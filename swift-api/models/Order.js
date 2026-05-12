import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    nom: String,
    quantite: { type: Number, default: 1 },
    prix: { type: Number, default: 0 },
  },
  { _id: false }
);

const historiqueSchema = new mongoose.Schema(
  {
    statut: String,
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    numero: { type: String, required: true, unique: true },
    numeroSW: { type: String, unique: true, sparse: true },
    entreprise: { type: mongoose.Schema.Types.ObjectId, ref: "Enterprise", required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    livreur: { type: mongoose.Schema.Types.ObjectId, ref: "Livreur" },
    clientNom: { type: String, required: true },
    clientTel: { type: String, default: "" },
    clientAdresse: { type: String, default: "" },
    articles: [articleSchema],
    montant: { type: Number, required: true },
    montantTotal: { type: Number, default: null },
    fraisLivraison: { type: Number, default: 2.99 },
    statut: {
      type: String,
      enum: [
        "enAttente",
        "enPreparation",
        "enLivraison",
        "livree",
        "annulee",
        "en_attente",
        "en_preparation",
        "pret",
        "en_livraison",
        "livre",
        "annule",
      ],
      default: "en_attente",
    },
    adresseLivraison: {
      rue: String,
      ville: String,
      lat: Number,
      lng: Number,
    },
    evaluation: { note: Number, commentaire: String, date: Date },
    accepteeAt: Date,
    livreeAt: Date,
    livreurNom: { type: String, default: "" },
    historiqueStatuts: [historiqueSchema],
    tempsLivraisonMinutes: { type: Number, default: null },
  },
  { timestamps: true }
);

orderSchema.index({ entreprise: 1, createdAt: -1 });
orderSchema.index({ entreprise: 1, statut: 1 });

orderSchema.pre("save", function (next) {
  if (!this.numeroSW && this.numero) this.numeroSW = this.numero;
  if (this.montantTotal == null && this.montant != null) this.montantTotal = this.montant;
  this._swiftIsNew = this.isNew;
  next();
});

orderSchema.post("save", function (doc) {
  try {
    const io = globalThis.__SWIFT_IO;
    if (!io || !doc._swiftIsNew) return;
    io.to(`entreprise:${doc.entreprise}`).emit("nouvelle_commande", {
      id: String(doc._id),
      numero: doc.numero,
      clientNom: doc.clientNom,
      montant: doc.montant,
      statut: doc.statut,
    });
  } catch (_) {}
});

export default mongoose.model("Order", orderSchema);
