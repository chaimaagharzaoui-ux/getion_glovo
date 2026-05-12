import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Enterprise from "../models/Enterprise.js";

const router = Router();

router.post("/entreprise/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }
    const ent = await Enterprise.findOne({ email: String(email).toLowerCase() });
    if (!ent) return res.status(401).json({ error: "Identifiants invalides" });
    const ok = await bcrypt.compare(password, ent.password);
    if (!ok) return res.status(401).json({ error: "Identifiants invalides" });
    const token = jwt.sign(
      { sub: String(ent._id), role: "entreprise" },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "7d" }
    );
    res.json({
      token,
      entreprise: {
        id: String(ent._id),
        nom: ent.nom,
        email: ent.email,
        ouvert: ent.ouvert,
        logoUrl: ent.logoUrl,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
