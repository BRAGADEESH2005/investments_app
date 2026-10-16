import { Schema, model, models } from "mongoose";

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "InvestmentUser", required: true, index: true },
  type: { type: String, enum: ["House", "FD", "RD", "Gold"], required: true },
  name: { type: String, required: true, trim: true },
  principal: { type: Number, required: true, min: 0.01 },
  investedAt: { type: String, required: true },
  startDate: String,
  endDate: String,
  interestRate: { type: Number, min: 0 },
  compounding: { type: String, enum: ["monthly", "quarterly", "half-yearly", "yearly"] },
  metal: { type: String, enum: ["gold", "silver"] },
  quantity: Number,
  unit: { type: String, enum: ["grams", "pounds"] },
  assetName: String,
  documentUrl: String,
  documentPublicId: String,
  documentResourceType: String,
}, { timestamps: true });

schema.index({ userId: 1, type: 1, investedAt: -1 });
export default models.Investment || model("Investment", schema);
