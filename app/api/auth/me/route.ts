import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
export async function GET() { const user = await currentUser(); return user ? NextResponse.json({ id: String(user._id), name: user.name, email: user.email }) : NextResponse.json({ error: "Unauthenticated" }, { status: 401 }); }
