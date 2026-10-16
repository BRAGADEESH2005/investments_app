import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";
import User from "@/models/User";

const cookieName = "investment_session";
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

export async function createSession(userId: string) {
  await connectDB();
  const token = randomBytes(32).toString("hex");
  await Session.create({ userId, tokenHash: hash(token), expiresAt: new Date(Date.now() + 7 * 86400000) });
  (await cookies()).set(cookieName, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 7 * 86400 });
}

export async function currentUser() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  await connectDB();
  const session = await Session.findOne({ tokenHash: hash(token), expiresAt: { $gt: new Date() } });
  return session ? User.findById(session.userId).lean() : null;
}

export async function endSession() {
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (token) {
    await connectDB();
    await Session.deleteOne({ tokenHash: hash(token) });
  }
  store.delete(cookieName);
}
