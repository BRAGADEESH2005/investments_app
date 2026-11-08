import { Schema, model, models } from "mongoose";

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "InvestmentUser", required: true, index: true },
  snapshotDate: { type: Date, required: true },
  assets: { type: Number, required: true, min: 0 },
  liabilities: { type: Number, required: true, min: 0 },
  netWorth: { type: Number, required: true },
  notes: { type: String, maxlength: 1000 },
}, { timestamps: true });

schema.index({ userId: 1, snapshotDate: -1 }, { unique: true });
export default models.NetWorthSnapshot || model("NetWorthSnapshot", schema);
