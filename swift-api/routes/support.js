import { Router } from "express";
import mongoose from "mongoose";
import SupportTicket from "../models/SupportTicket.js";
import { authEntreprise } from "../middleware/authEntreprise.js";

const router = Router();
router.use(authEntreprise);

router.get("/", async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entrepriseId);
    const items = await SupportTicket.find({ entreprise: eid }).sort({ createdAt: -1 }).lean();
    res.json(
      items.map((t) => ({
        id: String(t._id),
        sujet: t.sujet,
        message: t.message,
        statut: t.statut,
        createdAt: t.createdAt,
      }))
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entrepriseId);
    const { sujet, message } = req.body || {};
    if (!sujet || !message) return res.status(400).json({ error: "Sujet et message requis" });
    const t = await SupportTicket.create({
      entreprise: eid,
      sujet: String(sujet),
      message: String(message),
    });
    res.status(201).json({
      id: String(t._id),
      sujet: t.sujet,
      message: t.message,
      statut: t.statut,
      createdAt: t.createdAt,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
