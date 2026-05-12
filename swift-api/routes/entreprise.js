import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Enterprise from "../models/Enterprise.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { authEntreprise } from "../middleware/authEntreprise.js";

const router = Router();

const EN_COURS = ["enAttente", "enPreparation", "enLivraison", "en_attente", "en_preparation", "en_livraison"];
const STATUT_NOT_ANNULE = ["annulee", "annule"];

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    const entreprise = await Enterprise.findOne({ email: String(email).toLowerCase() });
    if (!entreprise) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const ok = await bcrypt.compare(password, entreprise.password);
    if (!ok) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const token = jwt.sign(
      { id: String(entreprise._id), role: "entreprise" },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      entreprise: {
        id: String(entreprise._id),
        nom: entreprise.nom,
        email: entreprise.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/stats", authEntreprise, async (req, res) => {
  try {
    const entrepriseId = new mongoose.Types.ObjectId(req.entreprise.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const commandesAujourdhui = await Order.find({
      entreprise: entrepriseId,
      createdAt: { $gte: today },
      statut: { $nin: STATUT_NOT_ANNULE },
    });

    const commandesHier = await Order.find({
      entreprise: entrepriseId,
      createdAt: { $gte: yesterday, $lt: today },
      statut: { $nin: STATUT_NOT_ANNULE },
    });

    const amountOf = (c) => Number(c.montantTotal ?? c.montant ?? 0);
    const caAujourdhui = commandesAujourdhui.reduce((sum, c) => sum + amountOf(c), 0);
    const caHier = commandesHier.reduce((sum, c) => sum + amountOf(c), 0);
    const variation = caHier > 0 ? Math.round(((caAujourdhui - caHier) / caHier) * 100) : 0;

    const commandesEnCours = await Order.countDocuments({
      entreprise: entrepriseId,
      statut: { $in: EN_COURS },
    });

    const totalCommandes = await Order.countDocuments({ entreprise: entrepriseId });

    const evaluations = await Order.find({
      entreprise: entrepriseId,
      "evaluation.note": { $exists: true },
    }).select("evaluation");

    const noteMoyenne =
      evaluations.length > 0
        ? (
            evaluations.reduce((s, c) => s + Number(c.evaluation?.note || 0), 0) /
            evaluations.length
          ).toFixed(1)
        : "—";

    const livreesAujourdhui = await Order.find({
      entreprise: entrepriseId,
      statut: { $in: ["livree", "livre"] },
      livreeAt: { $gte: today },
    }).select("accepteeAt livreeAt");

    const tempsLivraisonMoyen =
      livreesAujourdhui.length > 0
        ? Math.round(
            livreesAujourdhui.reduce((s, c) => {
              if (!c.accepteeAt || !c.livreeAt) return s;
              return s + (new Date(c.livreeAt) - new Date(c.accepteeAt)) / 60000;
            }, 0) / livreesAujourdhui.length
          )
        : "—";

    const ent = await Enterprise.findById(entrepriseId).select("ouvert horairesDebut horairesFin");
    const acceptationDen = totalCommandes || 1;
    const tauxAcceptation = Math.round(((totalCommandes - (await Order.countDocuments({
      entreprise: entrepriseId,
      statut: { $in: ["annulee", "annule"] },
    }))) / acceptationDen) * 100);

    const totalProduits = await Product.countDocuments({ entreprise: entrepriseId });
    const stockAlerte = await Product.countDocuments({ entreprise: entrepriseId, stock: { $lte: 5 } });

    const livreursDistinct = await Order.distinct("livreurNom", {
      entreprise: entrepriseId,
      statut: { $in: ["en_livraison", "enLivraison"] },
      livreurNom: { $nin: [null, ""] },
    });
    const livreursEnLigne = livreursDistinct.filter(Boolean).length;

    const commandesLivrees = await Order.countDocuments({
      entreprise: entrepriseId,
      statut: { $in: ["livree", "livre"] },
      createdAt: { $gte: today },
    });

    const jours = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const graphique7j = [];
    for (let i = 6; i >= 0; i--) {
      const d0 = new Date(today);
      d0.setDate(d0.getDate() - i);
      const d1 = new Date(d0);
      d1.setDate(d1.getDate() + 1);
      const n = await Order.countDocuments({
        entreprise: entrepriseId,
        createdAt: { $gte: d0, $lt: d1 },
      });
      const rev = await Order.aggregate([
        { $match: { entreprise: entrepriseId, createdAt: { $gte: d0, $lt: d1 } } },
        { $group: { _id: null, s: { $sum: { $ifNull: ["$montantTotal", "$montant"] } } } },
      ]);
      const revenus = Math.round(rev[0]?.s || 0);
      graphique7j.push({ jour: jours[d0.getDay()], commandes: n, revenus });
    }

    res.json({
      caAujourdhui,
      variation,
      totalCommandes,
      commandesEnCours,
      noteMoyenne,
      tempsLivraisonMoyen,
      ouvert: ent?.ouvert ?? true,
      horaires: `${ent?.horairesDebut || "08:00"} – ${ent?.horairesFin || "23:00"}`,
      tauxAcceptation: Number.isFinite(tauxAcceptation) ? tauxAcceptation : 0,
      totalProduits,
      revenuJour: caAujourdhui,
      stockAlerte,
      livreursEnLigne,
      commandesLivrees,
      graphique7j,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/statut", authEntreprise, async (req, res) => {
  try {
    const { ouvert } = req.body || {};
    if (typeof ouvert !== "boolean") {
      return res.status(400).json({ message: "Champ 'ouvert' requis (boolean)." });
    }
    await Enterprise.findByIdAndUpdate(req.entreprise.id, { ouvert });
    res.json({ success: true, ouvert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function emitStockAlerte(entrepriseId, payload) {
  try {
    const io = globalThis.__SWIFT_IO;
    if (io) io.to(`entreprise:${entrepriseId}`).emit("stock_alerte", payload);
  } catch (_) {}
}

function formatProductUi(p) {
  return {
    id: String(p._id),
    emoji: p.emoji || "📦",
    nom: p.nom,
    categorie: p.categorie || "Autre",
    prix: p.prix,
    stock: typeof p.stock === "number" ? p.stock : 50,
    description: p.description || "",
    disponible: p.disponible !== false,
    imageUrl: p.imageUrl || "",
  };
}

function formatCommandeUi(o) {
  return {
    id: String(o._id),
    client: o.clientNom || "",
    produits: (o.articles || []).map((a) => a.nom),
    montant: o.montantTotal ?? o.montant ?? 0,
    statut: o.statut,
    date: o.createdAt,
  };
}

router.get("/produits", authEntreprise, async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entreprise.id);
    const items = await Product.find({ entreprise: eid }).sort({ updatedAt: -1 }).lean();
    res.json(items.map(formatProductUi));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/produits", authEntreprise, async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entreprise.id);
    const { nom, description, prix, categorie, stock, emoji, disponible } = req.body || {};
    if (!nom || prix == null) return res.status(400).json({ message: "Nom et prix requis" });
    const st = stock != null ? Number(stock) : 50;
    const p = await Product.create({
      entreprise: eid,
      nom: String(nom),
      description: String(description || ""),
      prix: Number(prix),
      categorie: String(categorie || "Autre"),
      disponible: disponible !== false,
      stock: Number.isFinite(st) ? st : 50,
      emoji: emoji ? String(emoji).slice(0, 4) : "📦",
    });
    if (p.stock <= 5) emitStockAlerte(req.entreprise.id, { produitId: String(p._id), nom: p.nom, stock: p.stock });
    res.status(201).json(formatProductUi(p.toObject()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/produits/:id", authEntreprise, async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entreprise.id);
    const p = await Product.findOne({ _id: req.params.id, entreprise: eid });
    if (!p) return res.status(404).json({ message: "Produit introuvable" });
    const { nom, description, prix, categorie, stock, emoji, disponible } = req.body || {};
    if (nom != null) p.nom = String(nom);
    if (description != null) p.description = String(description);
    if (prix != null) p.prix = Number(prix);
    if (categorie != null) p.categorie = String(categorie);
    if (stock != null) p.stock = Number(stock);
    if (emoji != null) p.emoji = String(emoji).slice(0, 4);
    if (disponible != null) p.disponible = Boolean(disponible);
    await p.save();
    if (p.stock <= 5) emitStockAlerte(req.entreprise.id, { produitId: String(p._id), nom: p.nom, stock: p.stock });
    res.json(formatProductUi(p.toObject()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/produits/:id", authEntreprise, async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entreprise.id);
    const r = await Product.deleteOne({ _id: req.params.id, entreprise: eid });
    if (r.deletedCount === 0) return res.status(404).json({ message: "Produit introuvable" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/commandes", authEntreprise, async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entreprise.id);
    const { statut } = req.query || {};
    const filter = { entreprise: eid };
    if (statut === "enCours") filter.statut = { $in: EN_COURS };
    const commandes = await Order.find(filter).sort({ createdAt: -1 }).limit(250).lean();
    res.json(commandes.map(formatCommandeUi));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/livreurs-actifs", authEntreprise, async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entreprise.id);
    const rows = await Order.find({
      entreprise: eid,
      statut: { $in: ["en_livraison", "enLivraison"] },
      livreurNom: { $nin: [null, ""] },
    })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();
    const seen = new Set();
    const out = [];
    for (const o of rows) {
      const key = o.livreurNom;
      if (seen.has(key)) continue;
      seen.add(key);
      const parts = String(key).trim().split(/\s+/);
      const prenom = parts[0] || "Livreur";
      const nom = parts.slice(1).join(" ") || "";
      out.push({
        id: `lv-${out.length}`,
        prenom,
        nom,
        zone: o.clientAdresse || "—",
        statut: "enLivraison",
        arriveDans: null,
        note: 4.5,
        livraisons: 0,
        ligne: true,
      });
    }
    res.json(out);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/statistiques", authEntreprise, async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entreprise.id);
    const annulees = await Order.countDocuments({ entreprise: eid, statut: { $in: ["annulee", "annule"] } });
    const revenusAgg = await Order.aggregate([
      { $match: { entreprise: eid, statut: { $in: ["livree", "livre"] } } },
      { $group: { _id: null, s: { $sum: { $ifNull: ["$montantTotal", "$montant"] } } } },
    ]);
    const revenusTotaux = Math.round(revenusAgg[0]?.s || 0);
    const clientsAgg = await Order.distinct("clientNom", { entreprise: eid, clientNom: { $nin: [null, ""] } });
    const clientsActifs = clientsAgg.filter(Boolean).length;
    const prodAgg = await Order.aggregate([
      { $match: { entreprise: eid } },
      { $unwind: "$articles" },
      { $group: { _id: "$articles.nom", vendus: { $sum: "$articles.quantite" } } },
      { $sort: { vendus: -1 } },
      { $limit: 5 },
    ]);
    const topProduits = prodAgg.map((x) => ({ nom: x._id || "—", vendus: x.vendus }));
    const produitsStock = await Product.aggregate([
      { $match: { entreprise: eid } },
      { $group: { _id: null, s: { $sum: "$stock" } } },
    ]);
    res.json({
      revenusTotaux,
      commandesAnnulees: annulees,
      clientsActifs,
      produitsStock: Math.round(produitsStock[0]?.s || 0),
      topProduits,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/employes", authEntreprise, async (req, res) => {
  try {
    const ent = await Enterprise.findById(req.entreprise.id).select("employes").lean();
    const list = (ent?.employes || []).map((e, i) => ({
      id: `e-${i}-${e.nom}`,
      nom: e.nom,
      role: e.role,
      embauche: e.embauche || "",
      statut: e.statut || "actif",
    }));
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/employes", authEntreprise, async (req, res) => {
  try {
    const { nom, role } = req.body || {};
    if (!nom || !role) return res.status(400).json({ message: "Nom et rôle requis" });
    const embauche = new Date().toISOString().slice(0, 10);
    const updated = await Enterprise.findByIdAndUpdate(
      req.entreprise.id,
      { $push: { employes: { nom: String(nom), role: String(role), embauche, statut: "actif" } } },
      { new: true }
    ).select("employes");
    const list = (updated.employes || []).map((e, i) => ({
      id: `e-${i}-${e.nom}`,
      nom: e.nom,
      role: e.role,
      embauche: e.embauche,
      statut: e.statut,
    }));
    res.status(201).json(list[list.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { nom, email, password, telephone } = req.body || {};
    if (!nom || !email || !password) return res.status(400).json({ message: "Champs requis." });
    if (password.length < 6) return res.status(400).json({ message: "Mot de passe trop court." });
    const exists = await Enterprise.findOne({ email: String(email).toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email déjà utilisé." });
    const hash = await bcrypt.hash(password, 10);
    const ent = await Enterprise.create({
      nom: String(nom),
      email: String(email).toLowerCase(),
      password: hash,
      telephone: telephone ? String(telephone) : "",
    });
    const token = jwt.sign(
      { id: String(ent._id), role: "entreprise" },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "7d" }
    );
    res.status(201).json({
      token,
      entreprise: { id: String(ent._id), nom: ent.nom, email: ent.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
