import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/mongodb";
import LICPolicy from "@/models/LICPolicy";
import ReminderNotification from "@/models/ReminderNotification";
import User from "@/models/User";
import Investment from "@/models/Investment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const expected = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!expected || authorization !== `Bearer ${expected}`) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM || !Number.isInteger(Number(SMTP_PORT))) return NextResponse.json({ error: "SMTP is not configured." }, { status: 503 });

  await connectDB();
  const todayInIndia = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  const policies = await LICPolicy.find({ status: "active" }).lean();
  const investments = await Investment.find({ type: { $in: ["FD", "RD"] }, endDate: { $exists: true, $ne: "" } }).lean();
  const users = await User.find({ _id: { $in: [...policies.map((policy) => policy.userId), ...investments.map((investment) => investment.userId)] } }).lean();
  const usersById = new Map(users.map((user) => [String(user._id), user]));
  const transporter = nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT), secure: Number(SMTP_PORT) === 465, auth: { user: SMTP_USER, pass: SMTP_PASSWORD } });
  let sent = 0;

  for (const policy of policies) {
    const user = usersById.get(String(policy.userId));
    if (!user) continue;
    const due = new Date(policy.nextPremiumDate);
    const dueInIndia = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(due);
    const daysUntilDue = Math.round((Date.parse(`${dueInIndia}T00:00:00+05:30`) - Date.parse(`${todayInIndia}T00:00:00+05:30`)) / 86400000);
    const reminderType = daysUntilDue === 7 ? "7-day" : daysUntilDue === 1 ? "1-day" : daysUntilDue === 0 ? "due" : null;
    if (!reminderType || await ReminderNotification.exists({ userId: user._id, policyId: policy._id, dueDate: due, reminderType })) continue;
    await transporter.sendMail({ from: SMTP_FROM, to: user.email, subject: `Premium payment reminder: ${policy.planName}`, html: `<p>Hello ${user.name},</p><p>Your ${policy.insurer} policy <strong>${policy.policyNumber}</strong> premium of <strong>₹${policy.premiumAmount.toLocaleString("en-IN")}</strong> is due on <strong>${due.toISOString().slice(0, 10)}</strong>.</p>` });
    try {
      await ReminderNotification.create({ userId: user._id, policyId: policy._id, dueDate: due, reminderType, recipient: user.email });
      sent++;
    } catch (error: unknown) {
      if ((error as { code?: number }).code !== 11000) throw error;
    }
  }

  for (const investment of investments) {
    const user = usersById.get(String(investment.userId));
    if (!user || !investment.endDate) continue;
    const due = new Date(`${investment.endDate.slice(0, 10)}T00:00:00+05:30`);
    const dueInIndia = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(due);
    const daysUntilDue = Math.round((Date.parse(`${dueInIndia}T00:00:00+05:30`) - Date.parse(`${todayInIndia}T00:00:00+05:30`)) / 86400000);
    const reminderType = daysUntilDue === 7 ? "7-day" : daysUntilDue === 1 ? "1-day" : daysUntilDue === 0 ? "due" : null;
    if (!reminderType || await ReminderNotification.exists({ userId: user._id, resourceId: investment._id, dueDate: due, reminderType })) continue;
    await transporter.sendMail({ from: SMTP_FROM, to: user.email, subject: `Maturity reminder: ${investment.name}`, html: `<p>Hello ${user.name},</p><p>Your ${investment.type} investment <strong>${investment.name}</strong> matures on <strong>${investment.endDate.slice(0, 10)}</strong>.</p>` });
    try {
      await ReminderNotification.create({ userId: user._id, resourceType: "investment", resourceId: investment._id, dueDate: due, reminderType, recipient: user.email });
      sent++;
    } catch (error: unknown) {
      if ((error as { code?: number }).code !== 11000) throw error;
    }
  }

  return NextResponse.json({ sent });
}

export const GET = POST;
