import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  await connectDB();
  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  await createSession(String(user._id));
  return NextResponse.json({ ok: true });
}
