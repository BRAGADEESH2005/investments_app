import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { currentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import LICPolicy from "@/models/LICPolicy";
import PremiumPayment from "@/models/PremiumPayment";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  await connectDB();
  const { searchParams } = new URL(request.url);
  const query = { userId: user._id, ...(searchParams.get("policyId") ? { policyId: searchParams.get("policyId") } : {}) };
  const payments = await PremiumPayment.find(query).sort({ paidAt: -1 }).limit(100).lean();
  return NextResponse.json({ payments });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  if (typeof body.policyId !== "string" || !isValidObjectId(body.policyId) || typeof body.amount !== "number" || body.amount <= 0 || !Number.isFinite(body.amount) || typeof body.paidAt !== "string" || Number.isNaN(Date.parse(body.paidAt))) return NextResponse.json({ error: "Enter a valid policy, amount and payment date." }, { status: 400 });
  await connectDB();
  const policy = await LICPolicy.exists({ _id: body.policyId, userId: user._id });
  if (!policy) return NextResponse.json({ error: "Policy not found." }, { status: 404 });
  const payment = await PremiumPayment.create({ ...body, userId: user._id });
  return NextResponse.json({ id: String(payment._id) }, { status: 201 });
}
