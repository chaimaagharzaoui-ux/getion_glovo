import { Router } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";
import { authEntreprise } from "../middleware/authEntreprise.js";

const router = Router();

router.use(authEntreprise);

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

router.get("/", async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entreprise.id);
    const {
      entreprise,
      statut,
      limit = 10,
      sort = "recent",
    } = req.query;

    const target = entreprise ? String(entreprise) : String(eid);
    if (target !== String(eid)) {
      return res.status(403).json({ message: "Entreprise non autorisée." });
    }

    const lim = Math.min(200, Math.max(1, parseInt(limit, 10) || 100));
    const sortOpt = sort === "recent" ? { createdAt: -1 } : { createdAt: 1 };
    const filter = { entreprise: eid };
    if (statut) filter.statut = statut;

    const commandes = await Order.find(filter)
      .populate("client", "nom prenom telephone")
      .sort(sortOpt)
      .limit(lim);

    res.json(commandes.map(formatOrder));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entreprise.id);
    const o = await Order.findOne({ _id: req.params.id, entreprise: eid }).lean();
    if (!o) return res.status(404).json({ error: "Commande introuvable" });
    res.json(formatOrder(o));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.put("/:id/statut", async (req, res) => {
  try {
    const eid = new mongoose.Types.ObjectId(req.entreprise.id);
    const { statut } = req.body || {};
    const allowed = ["en_preparation", "pret", "en_livraison", "livre", "annule", "en_attente"];
    if (!allowed.includes(statut)) {
      return res.status(400).json({ message: "Statut invalide" });
    }
    const o = await Order.findOne({ _id: req.params.id, entreprise: eid });
    if (!o) return res.status(404).json({ message: "Commande introuvable" });

    const etaitLivre = o.statut === "livre";
    o.statut = statut;
    o.historiqueStatuts = o.historiqueStatuts || [];
    o.historiqueStatuts.push({ statut, at: new Date() });

    if (statut === "livre" && !o.tempsLivraisonMinutes) {
      const mins = Math.round((Date.now() - o.createdAt.getTime()) / 60000);
      o.tempsLivraisonMinutes = Math.max(5, Math.min(120, mins));
    }

    await o.save();

    try {
      const io = globalThis.__SWIFT_IO;
      if (io) {
        io.to(`entreprise:${String(eid)}`).emit("livreur_update", {
          commandeId: String(o._id),
          statut: o.statut,
          livreurNom: o.livreurNom || "",
        });
      }
    } catch (_) {}

    if (statut === "livre" && !etaitLivre) {
      const pct = Number(process.env.COMMISSION_PERCENT || 12);
      const commission = Math.round(o.montant * (pct / 100) * 100) / 100;
      const net = Math.round((o.montant - commission) * 100) / 100;
      await Transaction.create({
        entreprise: eid,
        commande: o._id,
        numeroCommande: o.numero,
        montantBrut: o.montant,
        commission,
        net,
        date: new Date(),
      });
    }

    res.json(formatOrder(o.toObject()));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

function formatOrder(o) {
  const clientNomDb = o.client ? `${o.client.prenom ? `${o.client.prenom} ` : ""}${o.client.nom || ""}`.trim() : "";
  return {
    id: String(o._id),
    numero: o.numeroSW || o.numero,
    numeroSW: o.numeroSW || o.numero,
    client: o.client
      ? {
          id: String(o.client._id),
          nom: o.client.nom || "",
          prenom: o.client.prenom || "",
          telephone: o.client.telephone || "",
        }
      : null,
    clientNom: clientNomDb || o.clientNom,
    clientTel: o.clientTel,
    clientAdresse: o.clientAdresse,
    articles: o.articles || [],
    montant: o.montantTotal ?? o.montant,
    montantTotal: o.montantTotal ?? o.montant,
    statut: o.statut,
    livreurNom: o.livreurNom,
    historiqueStatuts: o.historiqueStatuts || [],
    tempsLivraisonMinutes: o.tempsLivraisonMinutes,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

export default router;
