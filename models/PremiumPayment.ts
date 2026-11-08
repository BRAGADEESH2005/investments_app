import { Schema, model, models } from "mongoose";

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "InvestmentUser", required: true, index: true },
  policyId: { type: Schema.Types.ObjectId, ref: "LICPolicy", required: true, index: true },
  amount: { type: Number, required: true, min: 0.01 },
  paidAt: { type: Date, required: true },
  receiptUrl: String,
  notes: { type: String, maxlength: 1000 },
}, { timestamps: true });

schema.index({ userId: 1, policyId: 1, paidAt: -1 });
export default models.PremiumPayment || model("PremiumPayment", schema);
