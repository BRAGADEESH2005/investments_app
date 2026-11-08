import { Schema, model, models } from "mongoose";

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "InvestmentUser", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  targetAmount: { type: Number, required: true, min: 0.01 },
  currentAmount: { type: Number, min: 0, default: 0 },
  targetDate: { type: Date, required: true },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  notes: { type: String, maxlength: 1000 },
}, { timestamps: true });

schema.index({ userId: 1, targetDate: 1 });
export default models.FinancialGoal || model("FinancialGoal", schema);
