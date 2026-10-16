import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { currentUser } from "@/lib/auth";

export async function POST() {
  if (!(await currentUser())) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json({ error: "Document storage is not configured." }, { status: 503 });
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash("sha1").update(`folder=investment-documents&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`).digest("hex");
  return NextResponse.json({ timestamp, signature, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME, folder: "investment-documents" });
}
