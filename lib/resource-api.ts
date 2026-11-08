import { NextResponse } from "next/server";
import { isValidObjectId, Model } from "mongoose";
import { currentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

type Config = {
  model: Model<any>;
  required: string[];
  numeric?: string[];
  date?: string[];
  allowed?: Record<string, string[]>;
  related?: { field: string; model: Model<any> };
};

function validate(body: Record<string, unknown>, config: Config) {
  for (const field of config.required) {
    if (body[field] === undefined || body[field] === null || body[field] === "") return `Enter ${field}.`;
  }
  for (const field of config.numeric || []) {
    if (body[field] !== undefined && (typeof body[field] !== "number" || !Number.isFinite(body[field]) || body[field] < 0)) return `${field} must be a non-negative number.`;
  }
  for (const field of config.date || []) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string" || Number.isNaN(Date.parse(body[field]))) return `${field} must be a valid date.`;
    }
  }
  for (const [field, values] of Object.entries(config.allowed || {})) {
    if (body[field] !== undefined && !values.includes(String(body[field]))) return `${field} is invalid.`;
  }
  return null;
}

export async function listResource(request: Request, config: Config) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  await connectDB();
  const { searchParams } = new URL(request.url);
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") || 50), 1), 100);
  const query = { userId: user._id };
  const [items, total] = await Promise.all([
    config.model.find(query).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
    config.model.countDocuments(query),
  ]);
  return NextResponse.json({ items, pagination: { page, pageSize, total, hasMore: page * pageSize < total } });
}

export async function createResource(request: Request, config: Config) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const error = validate(body, config);
  if (error) return NextResponse.json({ error }, { status: 400 });
  await connectDB();
  if (config.related && body[config.related.field] !== undefined) {
    const related = await config.related.model.exists({ _id: body[config.related.field], userId: user._id });
    if (!related) return NextResponse.json({ error: "Related resource not found." }, { status: 404 });
  }
  const item = await config.model.create({ ...body, userId: user._id });
  return NextResponse.json({ id: String(item._id) }, { status: 201 });
}

export async function updateResource(request: Request, id: string, config: Config) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const error = validate(body, { ...config, required: [] });
  if (error) return NextResponse.json({ error }, { status: 400 });
  await connectDB();
  if (config.related && body[config.related.field] !== undefined) {
    const related = await config.related.model.exists({ _id: body[config.related.field], userId: user._id });
    if (!related) return NextResponse.json({ error: "Related resource not found." }, { status: 404 });
  }
  const item = await config.model.findOneAndUpdate({ _id: id, userId: user._id }, { $set: body }, { new: true, runValidators: true }).lean();
  return item ? NextResponse.json(item) : NextResponse.json({ error: "Not found." }, { status: 404 });
}

export async function deleteResource(request: Request, id: string, config: Config) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  await connectDB();
  const result = await config.model.deleteOne({ _id: id, userId: user._id });
  return result.deletedCount ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not found." }, { status: 404 });
}
