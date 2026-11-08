import { Schema, model, models } from "mongoose";

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "InvestmentUser", required: true, index: true },
  policyNumber: { type: String, required: true, trim: true, maxlength: 80 },
  insurer: { type: String, required: true, trim: true, maxlength: 120 },
  planName: { type: String, required: true, trim: true, maxlength: 120 },
  policyholderName: { type: String, trim: true, maxlength: 120 },
  lifeAssuredName: { type: String, trim: true, maxlength: 120 },
  nomineeName: { type: String, trim: true, maxlength: 120 },
  nomineeDetails: { type: String, trim: true, maxlength: 500 },
  policyType: { type: String, trim: true, maxlength: 80 },
  sumAssured: { type: Number, required: true, min: 0 },
  premiumAmount: { type: Number, required: true, min: 0.01 },
  premiumFrequency: { type: String, enum: ["monthly", "quarterly", "half-yearly", "yearly"], required: true },
  commencementDate: Date,
  premiumPayingTerm: { type: Number, min: 0 },
  totalPolicyTerm: { type: Number, min: 0 },
  nextPremiumDate: { type: Date, required: true },
  maturityDate: Date,
  premiumPaymentEndDate: Date,
  expectedMaturityAmount: { type: Number, min: 0 },
  documentUrl: { type: String, trim: true, maxlength: 2048 },
  bonuses: { type: Number, min: 0, default: 0 },
  guaranteedBenefits: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ["active", "matured", "surrendered", "lapsed"], default: "active" },
  reminderDaysBefore: { type: Number, min: 0, max: 365, default: 7 },
  notes: { type: String, maxlength: 1000 },
}, { timestamps: true });

schema.index({ userId: 1, policyNumber: 1 }, { unique: true });
schema.index({ userId: 1, nextPremiumDate: 1, status: 1 });
export default models.LICPolicy || model("LICPolicy", schema);
