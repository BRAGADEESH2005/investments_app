import { Schema, model, models } from "mongoose";

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "InvestmentUser", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  type: { type: String, enum: ["loan", "credit-card", "mortgage", "other"], required: true },
  outstandingAmount: { type: Number, required: true, min: 0 },
  interestRate: { type: Number, min: 0 },
  dueDate: Date,
  notes: { type: String, maxlength: 1000 },
}, { timestamps: true });

schema.index({ userId: 1, dueDate: 1 });
export default models.Liability || model("Liability", schema);
