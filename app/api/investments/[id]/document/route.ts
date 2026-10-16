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
  const item = await Investment.findOne({ _id: id, userId: user._id }).select("documentUrl name").lean();
  if (!item?.documentUrl) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  const documentResponse = await fetch(item.documentUrl, { cache: "no-store" });
  if (!documentResponse.ok || !documentResponse.body) return NextResponse.json({ error: "Cloudinary blocked document delivery. Enable PDF delivery in Cloudinary Security settings." }, { status: 502 });
  const headers = new Headers();
  headers.set("Content-Type", documentResponse.headers.get("content-type") || "application/octet-stream");
  headers.set("Content-Disposition", `inline; filename="${item.name.replace(/[^a-z0-9]/gi, "-")}"`);
  return new NextResponse(documentResponse.body, { headers });
}
