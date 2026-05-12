import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    entreprise: { type: mongoose.Schema.Types.ObjectId, ref: "Enterprise", required: true },
    nom: { type: String, required: true },
    description: { type: String, default: "" },
    prix: { type: Number, required: true },
    categorie: { type: String, default: "Autre" },
    imageUrl: { type: String, default: "" },
    disponible: { type: Boolean, default: true },
    stock: { type: Number, default: 50 },
    emoji: { type: String, default: "📦" },
  },
  { timestamps: true }
);

productSchema.index({ entreprise: 1 });

export default mongoose.model("Product", productSchema);
