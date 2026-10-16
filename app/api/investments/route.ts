import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Investment from "@/models/Investment";

const types = ["House", "FD", "RD", "Gold"];
export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  await connectDB();
  const { searchParams } = new URL(request.url);
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") || 50), 1), 100);
  const query = { userId: user._id, ...(types.includes(searchParams.get("type") || "") ? { type: searchParams.get("type") } : {}) };
  const [items, total] = await Promise.all([Investment.find(query).sort({ investedAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(), Investment.countDocuments(query)]);
  return NextResponse.json({ investments: items.map((item) => ({ ...item, id: String(item._id) })), pagination: { page, pageSize, total, hasMore: page * pageSize < total } });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const body = await request.json();
  if (!types.includes(body.type) || typeof body.name !== "string" || typeof body.principal !== "number" || body.principal <= 0 || typeof body.investedAt !== "string") return NextResponse.json({ error: "Enter the required investment details." }, { status: 400 });
  if (body.type === "Gold" && (!body.documentUrl || typeof body.quantity !== "number" || body.quantity <= 0 || !body.unit || !body.assetName)) return NextResponse.json({ error: "Gold requires a bill, quantity, unit and ornament/coin name." }, { status: 400 });
  await connectDB();
  const item = await Investment.create({ ...body, userId: user._id });
  return NextResponse.json({ id: String(item._id) }, { status: 201 });
}
