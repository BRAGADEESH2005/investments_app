import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Investment from "@/models/Investment";

const types = ["House", "FD", "RD", "Gold"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const body = await request.json();
  if (!types.includes(body.type) || typeof body.name !== "string" || typeof body.principal !== "number" || body.principal <= 0 || typeof body.investedAt !== "string") {
    return NextResponse.json({ error: "Enter the required investment details." }, { status: 400 });
  }
  if ((body.type === "FD" || body.type === "RD") && body.maturityAmount !== undefined && (typeof body.maturityAmount !== "number" || body.maturityAmount < 0)) return NextResponse.json({ error: "Maturity amount must be a non-negative number." }, { status: 400 });
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  if (notes.length > 1000) return NextResponse.json({ error: "Notes must be 1000 characters or fewer." }, { status: 400 });
  await connectDB();
  const { id } = await params;
  const item = await Investment.findOneAndUpdate({ _id: id, userId: user._id }, { ...body, notes, userId: user._id }, { new: true, runValidators: true }).lean();
  if (!item) return NextResponse.json({ error: "Investment not found." }, { status: 404 });
  return NextResponse.json({ investment: { ...item, id: String(item._id) } });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const result = await Investment.deleteOne({ _id: id, userId: user._id });
  if (!result.deletedCount) return NextResponse.json({ error: "Investment not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
