import { Router } from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Product from "../models/Product.js";
import { authEntreprise } from "../middleware/authEntreprise.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `prod-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 4 * 1024 * 1024 } });

const router = Router();
router.use(authEntreprise);

router.get("/", async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entrepriseId);
    const items = await Product.find({ entreprise: eid }).sort({ updatedAt: -1 }).lean();
    res.json(items.map(formatProduct));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entrepriseId);
    const { nom, description, prix, categorie, disponible, stock, emoji } = req.body;
    if (!nom || prix == null) return res.status(400).json({ error: "Nom et prix requis" });
    let imageUrl = "";
    if (req.file) imageUrl = `/uploads/${req.file.filename}`;
    const st = stock != null ? Number(stock) : 50;
    const p = await Product.create({
      entreprise: eid,
      nom: String(nom),
      description: String(description || ""),
      prix: Number(prix),
      categorie: String(categorie || "Autre"),
      disponible: disponible === "false" || disponible === false ? false : true,
      imageUrl,
      stock: Number.isFinite(st) ? st : 50,
      emoji: emoji ? String(emoji).slice(0, 4) : "📦",
    });
    res.status(201).json(formatProduct(p.toObject()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entrepriseId);
    const p = await Product.findOne({ _id: req.params.id, entreprise: eid });
    if (!p) return res.status(404).json({ error: "Produit introuvable" });
    const { nom, description, prix, categorie, disponible, stock, emoji } = req.body;
    if (nom != null) p.nom = String(nom);
    if (description != null) p.description = String(description);
    if (prix != null) p.prix = Number(prix);
    if (categorie != null) p.categorie = String(categorie);
    if (disponible != null) p.disponible = disponible === "false" || disponible === false ? false : true;
    if (stock != null) p.stock = Number(stock);
    if (emoji != null) p.emoji = String(emoji).slice(0, 4);
    if (req.file) p.imageUrl = `/uploads/${req.file.filename}`;
    await p.save();
    res.json(formatProduct(p.toObject()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entrepriseId);
    const r = await Product.deleteOne({ _id: req.params.id, entreprise: eid });
    if (r.deletedCount === 0) return res.status(404).json({ error: "Produit introuvable" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function formatProduct(p) {
  return {
    id: String(p._id),
    nom: p.nom,
    description: p.description,
    prix: p.prix,
    categorie: p.categorie,
    imageUrl: p.imageUrl,
    disponible: p.disponible,
    stock: typeof p.stock === "number" ? p.stock : 50,
    emoji: p.emoji || "📦",
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export default router;
