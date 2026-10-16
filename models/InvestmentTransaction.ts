import { Schema, model, models } from "mongoose";

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "InvestmentUser", required: true, index: true },
  investmentId: { type: Schema.Types.ObjectId, ref: "Investment", required: true, index: true },
  amount: { type: Number, required: true, min: 0.01 },
  date: { type: String, required: true },
  note: { type: String, maxlength: 200, default: "" },
}, { timestamps: true });

schema.index({ userId: 1, date: -1 });
export default models.InvestmentTransaction || model("InvestmentTransaction", schema);
