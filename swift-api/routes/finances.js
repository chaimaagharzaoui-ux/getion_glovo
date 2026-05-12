import { Router } from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import { authEntreprise } from "../middleware/authEntreprise.js";

const router = Router();
router.use(authEntreprise);

router.get("/", async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entrepriseId);
    const { mois } = req.query;
    const now = new Date();
    let from = new Date(now.getFullYear(), now.getMonth(), 1);
    let to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    if (mois) {
      const [y, m] = String(mois).split("-").map(Number);
      if (y && m) {
        from = new Date(y, m - 1, 1);
        to = new Date(y, m, 0, 23, 59, 59);
      }
    }

    const items = await Transaction.find({
      entreprise: eid,
      date: { $gte: from, $lte: to },
    })
      .sort({ date: -1 })
      .lean();

    const revenusBrut = items.reduce((s, t) => s + t.montantBrut, 0);
    const commissionTotale = items.reduce((s, t) => s + t.commission, 0);
    const net = items.reduce((s, t) => s + t.net, 0);

    res.json({
      resume: {
        revenusBrut,
        commissionSwift: commissionTotale,
        netARecevoir: net,
        commissionPercent: Number(process.env.COMMISSION_PERCENT || 12),
      },
      transactions: items.map((t) => ({
        id: String(t._id),
        date: t.date,
        commande: t.numeroCommande,
        montantBrut: t.montantBrut,
        commission: t.commission,
        net: t.net,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
