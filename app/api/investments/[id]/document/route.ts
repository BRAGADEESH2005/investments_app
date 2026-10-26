import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Investment from "@/models/Investment";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const item = await Investment.findOne({ _id: id, userId: user._id }).select("documentUrl").lean();
  if (!item?.documentUrl) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  return NextResponse.redirect(item.documentUrl);
}
