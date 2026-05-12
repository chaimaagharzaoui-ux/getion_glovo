import { Router } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import { authEntreprise } from "../middleware/authEntreprise.js";

const router = Router();
router.use(authEntreprise);

function rangeForPeriode(periode) {
  const now = new Date();
  const to = new Date(now);
  let from = new Date(now);
  if (periode === "semaine") {
    from.setDate(from.getDate() - 7);
  } else if (periode === "mois") {
    from.setMonth(from.getMonth() - 1);
  } else if (periode === "trimestre") {
    from.setMonth(from.getMonth() - 3);
  } else if (periode === "annee") {
    from.setFullYear(from.getFullYear() - 1);
  } else {
    from.setDate(from.getDate() - 7);
  }
  return { from, to };
}

router.get("/ca", async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entrepriseId);
    const { periode = "semaine" } = req.query;
    const { from, to } = rangeForPeriode(periode);

    const agg = await Order.aggregate([
      {
        $match: {
          entreprise: eid,
          statut: "livre",
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$montant" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      labels: agg.map((a) => a._id),
      values: agg.map((a) => a.total),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/commandes", async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entrepriseId);
    const agg = await Order.aggregate([
      { $match: { entreprise: eid } },
      { $group: { _id: "$statut", count: { $sum: 1 } } },
    ]);
    const map = Object.fromEntries(agg.map((a) => [a._id, a.count]));
    res.json({
      livre: map.livre || 0,
      annule: map.annule || 0,
      en_cours:
        (map.en_attente || 0) +
        (map.en_preparation || 0) +
        (map.pret || 0) +
        (map.en_livraison || 0),
      detail: map,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/top-produits", async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entrepriseId);
    const agg = await Order.aggregate([
      { $match: { entreprise: eid, statut: "livre" } },
      { $unwind: "$articles" },
      {
        $group: {
          _id: "$articles.nom",
          quantite: { $sum: "$articles.quantite" },
        },
      },
      { $sort: { quantite: -1 } },
      { $limit: 5 },
    ]);
    res.json(
      agg.map((a) => ({
        nom: a._id,
        quantite: a.quantite,
      }))
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
