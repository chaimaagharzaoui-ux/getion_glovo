import mongoose from "mongoose";

const enterpriseSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    description: { type: String, default: "" },
    adresse: { type: String, default: "" },
    telephone: { type: String, default: "" },
    horairesDebut: { type: String, default: "09:00" },
    horairesFin: { type: String, default: "22:00" },
    categorie: { type: String, default: "restaurant" },
    rayonKm: { type: Number, default: 5 },
    logoUrl: { type: String, default: "" },
    ouvert: { type: Boolean, default: true },
    noteMoyenne: { type: Number, default: 4.8 },
    tauxAcceptation: { type: Number, default: 96 },
    employes: {
      type: [
        {
          nom: { type: String, required: true },
          role: { type: String, default: "" },
          embauche: { type: String, default: "" },
          statut: { type: String, default: "actif" },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Enterprise", enterpriseSchema);
