import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { name, email, password } = await request.json();
  if (typeof name !== "string" || name.trim().length < 2 || typeof email !== "string" || !email.includes("@") || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Enter a name, valid email and password of at least 8 characters." }, { status: 400 });
  }
  await connectDB();
  if (await User.exists({ email: email.toLowerCase().trim() })) return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
  const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash: await bcrypt.hash(password, 12) });
  await createSession(String(user._id));
  return NextResponse.json({ ok: true }, { status: 201 });
}
