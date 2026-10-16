import { Schema, model, models } from "mongoose";

const schema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  name: { type: String, required: true, trim: true, maxlength: 80 },
}, { timestamps: true });

export default models.InvestmentUser || model("InvestmentUser", schema);
