import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    entreprise: { type: mongoose.Schema.Types.ObjectId, ref: "Enterprise", required: true },
    sujet: { type: String, required: true },
    message: { type: String, required: true },
    statut: { type: String, enum: ["ouvert", "resolu"], default: "ouvert" },
  },
  { timestamps: true }
);

export default mongoose.model("SupportTicket", supportTicketSchema);
