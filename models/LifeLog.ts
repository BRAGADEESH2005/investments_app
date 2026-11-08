import { Schema, model, models } from "mongoose";

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "InvestmentUser", required: true, index: true },
  entry: { type: String, required: true, trim: true, maxlength: 10000 },
  driveLink: { type: String, trim: true, maxlength: 2048 },
  notes: { type: String, trim: true, maxlength: 1000 },
}, { timestamps: true });

schema.index({ userId: 1, createdAt: -1 });
export default models.LifeLog || model("LifeLog", schema);
