import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    entreprise: { type: mongoose.Schema.Types.ObjectId, ref: "Enterprise", required: true },
    commande: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    numeroCommande: String,
    montantBrut: { type: Number, required: true },
    commission: { type: Number, required: true },
    net: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

transactionSchema.index({ entreprise: 1, date: -1 });

export default mongoose.model("Transaction", transactionSchema);
