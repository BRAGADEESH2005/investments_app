import { Schema, model, models } from "mongoose";

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "InvestmentUser", required: true, index: true },
  policyId: { type: Schema.Types.ObjectId, ref: "LICPolicy", index: true },
  resourceType: { type: String, enum: ["lic", "investment"], default: "lic" },
  resourceId: { type: Schema.Types.ObjectId, index: true },
  reminderType: { type: String, enum: ["1-month", "7-day", "1-day", "due"], required: true },
  dueDate: { type: Date, required: true },
  sentAt: { type: Date, required: true, default: Date.now },
  recipient: { type: String, required: true },
}, { timestamps: true });

schema.index({ userId: 1, policyId: 1, dueDate: 1, reminderType: 1 }, { unique: true });
export default models.ReminderNotification || model("ReminderNotification", schema);
