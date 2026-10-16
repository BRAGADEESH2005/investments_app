import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import InvestmentTransaction from "@/models/InvestmentTransaction";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const body = await request.json();
  if (typeof body.investmentId !== "string" || typeof body.amount !== "number" || body.amount <= 0 || typeof body.date !== "string") return NextResponse.json({ error: "Enter a valid transaction." }, { status: 400 });
  await connectDB();
  const item = await InvestmentTransaction.create({ ...body, userId: user._id });
  return NextResponse.json({ id: String(item._id) }, { status: 201 });
}
