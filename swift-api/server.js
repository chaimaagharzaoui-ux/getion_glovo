import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import bcrypt from "bcryptjs";

import authRoutes from "./routes/auth.js";
import entrepriseRoutes from "./routes/entreprise.js";
import commandesRoutes from "./routes/commandes.js";
import produitsRoutes from "./routes/produits.js";
import statsRoutes from "./routes/stats.js";
import financesRoutes from "./routes/finances.js";
import entreprisesRoutes from "./routes/entreprises.js";
import supportRoutes from "./routes/support.js";
import Enterprise from "./models/Enterprise.js";
import Order from "./models/Order.js";
import Product from "./models/Product.js";
import Transaction from "./models/Transaction.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4000);
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/swift";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN, credentials: true },
});

globalThis.__SWIFT_IO = io;

io.on("connection", (socket) => {
  socket.on("entreprise_connectee", ({ entrepriseId }) => {
    if (entrepriseId) socket.join(`entreprise:${entrepriseId}`);
  });
});

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/entreprise", entrepriseRoutes);
app.use("/api/commandes", commandesRoutes);
app.use("/api/produits", produitsRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/finances", financesRoutes);
app.use("/api/entreprises", entreprisesRoutes);
app.use("/api/support", supportRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

async function seedDemo() {
  const count = await Enterprise.countDocuments();
  if (count > 0) return null;
  const hash = await bcrypt.hash("swift2024", 10);
  const ent = await Enterprise.create({
    nom: "Burger Palace",
    email: "entreprise@swift.ma",
    password: hash,
    description: "Restaurant partenaire Swift — Casablanca",
    adresse: "Bd Zerktouni, Casablanca",
    telephone: "+212 5 22 00 00 01",
    horairesDebut: "09:00",
    horairesFin: "23:00",
    categorie: "restaurant",
    rayonKm: 8,
    ouvert: true,
    noteMoyenne: 4.8,
    tauxAcceptation: 96,
  });
  const eid = ent._id;
  const today = new Date();
  const nums = ["SW-1001", "SW-1002", "SW-1003", "SW-1004", "SW-1005"];
  const orders = [
    {
      numero: nums[0],
      entreprise: eid,
      clientNom: "Yasmine Alami",
      clientTel: "+212 6 00 00 00 01",
      clientAdresse: "Maarif, Casablanca",
      articles: [
        { nom: "Menu Classic", quantite: 2, prix: 45 },
        { nom: "Boisson", quantite: 2, prix: 15 },
      ],
      montant: 120,
      statut: "livre",
      historiqueStatuts: [{ statut: "livre", at: today }],
      tempsLivraisonMinutes: 18,
    },
    {
      numero: nums[1],
      entreprise: eid,
      clientNom: "Omar Benali",
      clientTel: "+212 6 00 00 00 02",
      clientAdresse: "Hay Hassani",
      articles: [{ nom: "Burger XL", quantite: 1, prix: 65 }],
      montant: 65,
      statut: "en_livraison",
      livreurNom: "Rachid M.",
      historiqueStatuts: [{ statut: "en_livraison", at: today }],
    },
    {
      numero: nums[2],
      entreprise: eid,
      clientNom: "Sara Idrissi",
      clientTel: "+212 6 00 00 00 03",
      clientAdresse: "Ain Sebaa",
      articles: [{ nom: "Wrap poulet", quantite: 3, prix: 40 }],
      montant: 120,
      statut: "en_preparation",
      historiqueStatuts: [{ statut: "en_preparation", at: today }],
    },
    {
      numero: nums[3],
      entreprise: eid,
      clientNom: "Mehdi Tazi",
      clientTel: "+212 6 00 00 00 04",
      clientAdresse: "Californie",
      articles: [{ nom: "Salade César", quantite: 1, prix: 55 }],
      montant: 55,
      statut: "en_attente",
      historiqueStatuts: [{ statut: "en_attente", at: today }],
    },
    {
      numero: nums[4],
      entreprise: eid,
      clientNom: "Lina Cherkaoui",
      clientTel: "+212 6 00 00 00 05",
      clientAdresse: "Centre-ville",
      articles: [{ nom: "Menu enfant", quantite: 2, prix: 35 }],
      montant: 70,
      statut: "annule",
      historiqueStatuts: [{ statut: "annule", at: today }],
    },
  ];
  const inserted = await Order.insertMany(orders);
  const livre = inserted.find((o) => o.numero === "SW-1001");
  const pct = Number(process.env.COMMISSION_PERCENT || 12);
  const brut = 120;
  const com = Math.round(brut * (pct / 100) * 100) / 100;
  await Transaction.create({
    entreprise: eid,
    commande: livre?._id,
    numeroCommande: "SW-1001",
    montantBrut: brut,
    commission: com,
    net: Math.round((brut - com) * 100) / 100,
    date: new Date(),
  });
  await Product.insertMany([
    {
      entreprise: eid,
      nom: "Menu Classic",
      description: "Burger, frites, boisson",
      prix: 45,
      categorie: "Menus",
      disponible: true,
    },
    {
      entreprise: eid,
      nom: "Burger XL",
      description: "Double steak",
      prix: 65,
      categorie: "Burgers",
      disponible: true,
    },
    {
      entreprise: eid,
      nom: "Wrap poulet",
      description: "Sauce fromagère",
      prix: 40,
      categorie: "Salades & wraps",
      disponible: true,
    },
  ]);
  console.log("[swift-api] Base vide : compte démo créé entreprise@swift.ma / swift2024");
  return ent;
}

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("[swift-api] MongoDB connecté");
    await seedDemo();
    httpServer.listen(PORT, () => {
      console.log(`[swift-api] http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
