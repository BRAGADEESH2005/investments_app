import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { currentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await currentUser())) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json({ error: "Document storage is not configured." }, { status: 503 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Choose a document to upload." }, { status: 400 });
  if (file.type !== "application/pdf" && !file.type.startsWith("image/")) return NextResponse.json({ error: "Only PDF and image documents are supported." }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Documents must be 10 MB or smaller." }, { status: 400 });

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "investment-documents";
  const accessMode = "public";
  const signature = createHash("sha1").update(`access_mode=${accessMode}&folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`).digest("hex");
  const uploadForm = new FormData();
  uploadForm.append("file", file);
  uploadForm.append("api_key", process.env.CLOUDINARY_API_KEY);
  uploadForm.append("timestamp", String(timestamp));
  uploadForm.append("signature", signature);
  uploadForm.append("folder", folder);
  uploadForm.append("access_mode", accessMode);

  const resourceType = file.type === "application/pdf" ? "raw" : "image";
  const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, { method: "POST", body: uploadForm });
  const uploaded = await uploadResponse.json();
  if (!uploadResponse.ok || !uploaded.secure_url || !uploaded.public_id) {
    return NextResponse.json({ error: uploaded.error?.message || "Document upload failed." }, { status: 502 });
  }
  return NextResponse.json({ url: uploaded.secure_url, publicId: uploaded.public_id, resourceType: uploaded.resource_type });
}
