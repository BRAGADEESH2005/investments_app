import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";

const GOLD_PRICE_URL = "https://api.goldprice.dev/v1/carat?currency=INR";
const GRAMS_PER_TROY_OUNCE = 31.1034768;

export async function GET() {
  if (!(await currentUser())) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  try {
    const response = await fetch(GOLD_PRICE_URL, { next: { revalidate: 900 } });
    if (!response.ok) return NextResponse.json({ error: "Live gold price is temporarily unavailable." }, { status: 502 });

    const data = await response.json();
    const pricePerGram = Number(data.price_gram_24k);
    if (!Number.isFinite(pricePerGram) || pricePerGram <= 0) {
      return NextResponse.json({ error: "Live gold price response is invalid." }, { status: 502 });
    }

    return NextResponse.json({
      configured: true,
      pricePerOunce: pricePerGram * GRAMS_PER_TROY_OUNCE,
      pricePerGram,
      currency: data.currency,
      change: null,
      changePercent: null,
      updatedAt: data.timestamp || new Date().toISOString(),
    });
  } catch (error) {
    console.error("Gold price request failed:", error);
    return NextResponse.json({ error: "Live gold price is temporarily unavailable." }, { status: 502 });
  }
}
