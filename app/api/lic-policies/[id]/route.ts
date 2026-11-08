import bcrypt from "bcryptjs";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { currentUser } from "@/lib/auth";
import User from "@/models/User";
import LICPolicy from "@/models/LICPolicy";
import PremiumPayment from "@/models/PremiumPayment";
import { deleteResource, updateResource } from "@/lib/resource-api";

const config = {
  model: LICPolicy,
  required: [],
  numeric: ["sumAssured", "premiumAmount", "reminderDaysBefore", "premiumPayingTerm", "totalPolicyTerm", "expectedMaturityAmount", "bonuses", "guaranteedBenefits"],
  date: ["nextPremiumDate", "maturityDate", "commencementDate", "premiumPaymentEndDate"],
  allowed: { premiumFrequency: ["monthly", "quarterly", "half-yearly", "yearly"], status: ["active", "matured", "surrendered", "lapsed"] },
};
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return updateResource(request, (await params).id, config);
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  let body: { password?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Password is required." }, { status: 400 }); }
  if (typeof body.password !== "string" || !body.password) return NextResponse.json({ error: "Password is required." }, { status: 400 });
  await connectDB();
  const storedUser = await User.findById(user._id).select("+passwordHash");
  if (!storedUser || !(await bcrypt.compare(body.password, storedUser.passwordHash))) return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  const result = await LICPolicy.deleteOne({ _id: id, userId: user._id });
  if (result.deletedCount) await PremiumPayment.deleteMany({ policyId: id, userId: user._id });
  return result.deletedCount ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not found." }, { status: 404 });
}
