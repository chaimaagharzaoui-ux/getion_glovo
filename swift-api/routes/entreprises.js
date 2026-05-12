import { Router } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Enterprise from "../models/Enterprise.js";
import Order from "../models/Order.js";
import { authEntreprise } from "../middleware/authEntreprise.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `logo-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

const router = Router();

router.get("/me", authEntreprise, async (req, res) => {
  try {
    const ent = await Enterprise.findById(req.entrepriseId).lean();
    if (!ent) return res.status(404).json({ error: "Entreprise introuvable" });
    res.json(formatEnterprise(ent));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", authEntreprise, (req, res, next) => {
  const ct = req.headers["content-type"] || "";
  if (ct.includes("multipart/form-data")) {
    return upload.single("logo")(req, res, (err) => (err ? next(err) : next()));
  }
  next();
}, async (req, res) => {
  try {
    if (String(req.params.id) !== String(req.entrepriseId)) {
      return res.status(403).json({ error: "Non autorisé" });
    }
    const ent = await Enterprise.findById(req.entrepriseId);
    if (!ent) return res.status(404).json({ error: "Introuvable" });

    const fields = [
      "nom",
      "description",
      "adresse",
      "telephone",
      "email",
      "horairesDebut",
      "horairesFin",
      "categorie",
      "rayonKm",
    ];
    for (const f of fields) {
      if (req.body[f] != null) ent[f] = req.body[f];
    }
    if (req.file) ent.logoUrl = `/uploads/${req.file.filename}`;
    await ent.save();
    res.json(formatEnterprise(ent.toObject()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id/statut", authEntreprise, async (req, res) => {
  try {
    if (String(req.params.id) !== String(req.entrepriseId)) {
      return res.status(403).json({ error: "Non autorisé" });
    }
    const { ouvert } = req.body || {};
    if (typeof ouvert !== "boolean") {
      return res.status(400).json({ error: "ouvert (boolean) requis" });
    }
    const ent = await Enterprise.findByIdAndUpdate(
      req.entrepriseId,
      { ouvert },
      { new: true }
    ).lean();
    res.json({ ouvert: ent.ouvert });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/:id/password", authEntreprise, async (req, res) => {
  try {
    if (String(req.params.id) !== String(req.entrepriseId)) {
      return res.status(403).json({ error: "Non autorisé" });
    }
    const { ancien, nouveau } = req.body || {};
    if (!ancien || !nouveau) return res.status(400).json({ error: "Champs requis" });
    const ent = await Enterprise.findById(req.entrepriseId);
    const ok = await bcrypt.compare(ancien, ent.password);
    if (!ok) return res.status(400).json({ error: "Ancien mot de passe incorrect" });
    ent.password = await bcrypt.hash(nouveau, 10);
    await ent.save();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:id/dashboard-stats", authEntreprise, async (req, res) => {
  try {
    if (String(req.params.id) !== String(req.entrepriseId)) {
      return res.status(403).json({ error: "Non autorisé" });
    }
    const eid = new mongoose.Types.ObjectId(req.entrepriseId);
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const yesterday = new Date(start);
    yesterday.setDate(yesterday.getDate() - 1);
    const yStart = new Date(yesterday);
    yStart.setHours(0, 0, 0, 0);
    const yEnd = new Date(yesterday);
    yEnd.setHours(23, 59, 59, 999);

    const [caToday, caYesterday, ordersToday, ordersYesterday, recent, enCours, ent] = await Promise.all([
      Order.aggregate([
        { $match: { entreprise: eid, statut: "livre", createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$montant" } } },
      ]),
      Order.aggregate([
        { $match: { entreprise: eid, statut: "livre", createdAt: { $gte: yStart, $lte: yEnd } } },
        { $group: { _id: null, total: { $sum: "$montant" } } },
      ]),
      Order.countDocuments({ entreprise: eid, createdAt: { $gte: start, $lte: end } }),
      Order.countDocuments({ entreprise: eid, createdAt: { $gte: yStart, $lte: yEnd } }),
      Order.find({ entreprise: eid })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Order.countDocuments({
        entreprise: eid,
        statut: { $in: ["en_preparation", "pret", "en_livraison", "en_attente"] },
      }),
      Enterprise.findById(req.entrepriseId).lean(),
    ]);

    const caJ = caToday[0]?.total || 0;
    const caHier = caYesterday[0]?.total || 0;
    const pctVsHier =
      caHier > 0 ? Math.round(((caJ - caHier) / caHier) * 1000) / 10 : caJ > 0 ? 100 : 0;

    const livrees = await Order.find({
      entreprise: eid,
      statut: "livre",
      tempsLivraisonMinutes: { $ne: null },
    })
      .select("tempsLivraisonMinutes")
      .lean();
    const avgMin =
      livrees.length > 0
        ? Math.round(
            livrees.reduce((s, o) => s + (o.tempsLivraisonMinutes || 0), 0) / livrees.length
          )
        : 18;

    res.json({
      caAujourdhui: caJ,
      pctVsHier,
      commandesAujourdhui: ordersToday,
      commandesVsHier: ordersYesterday,
      enCours,
      noteMoyenne: ent?.noteMoyenne ?? 4.8,
      tempsLivraisonMoyen: avgMin,
      tauxAcceptation: ent?.tauxAcceptation ?? 96,
      horairesDebut: ent?.horairesDebut,
      horairesFin: ent?.horairesFin,
      ouvert: ent?.ouvert,
      recent: recent.map((o) => ({
        id: String(o._id),
        numero: o.numero,
        clientNom: o.clientNom,
        montant: o.montant,
        statut: o.statut,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function formatEnterprise(ent) {
  return {
    id: String(ent._id),
    nom: ent.nom,
    email: ent.email,
    description: ent.description,
    adresse: ent.adresse,
    telephone: ent.telephone,
    horairesDebut: ent.horairesDebut,
    horairesFin: ent.horairesFin,
    categorie: ent.categorie,
    rayonKm: ent.rayonKm,
    logoUrl: ent.logoUrl,
    ouvert: ent.ouvert,
    noteMoyenne: ent.noteMoyenne,
    tauxAcceptation: ent.tauxAcceptation,
  };
}

export default router;
