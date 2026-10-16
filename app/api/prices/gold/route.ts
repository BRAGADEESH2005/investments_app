import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";

const GOLD_PRICE_URL = "https://www.goodreturns.in/gold-rates/chennai.html";
const GRAMS_PER_TROY_OUNCE = 31.1034768;

function parseRate(text: string, karat: 18 | 22 | 24) {
  const normalized = text.replace(/\s+/g, " ");
  const priceBeforeKarat = new RegExp(`(?:₹|Rs\\.?|INR)\\s*([\\d,]+(?:\\.\\d+)?)\\s*(?:per\\s*gram\\s*)?(?:for\\s*)?${karat}\\s*(?:k|karat|carat)`, "i").exec(normalized);
  const karatBeforePrice = new RegExp(`${karat}\\s*(?:k|karat|carat)[^₹\\d]{0,120}(?:₹|Rs\\.?|INR)\\s*([\\d,]+(?:\\.\\d+)?)`, "i").exec(normalized);
  const value = priceBeforeKarat?.[1] || karatBeforePrice?.[1];
  return value ? Number(value.replace(/,/g, "")) : NaN;
}

export async function GET() {
  if (!(await currentUser())) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  try {
    const response = await fetch(GOLD_PRICE_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; HouseholdWealth/1.0)" },
      next: { revalidate: 900 },
    });
    if (!response.ok) return NextResponse.json({ error: "Goodreturns gold price is temporarily unavailable." }, { status: 502 });

    const html = await response.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&#8377;|&#x20b9;/gi, "₹")
      .replace(/&amp;/gi, "&");
    const prices = {
      18: parseRate(text, 18),
      22: parseRate(text, 22),
      24: parseRate(text, 24),
    };
    if (Object.values(prices).some((price) => !Number.isFinite(price) || price <= 0)) {
      console.error("Could not parse all Chennai gold rates from Goodreturns.");
      return NextResponse.json({ error: "Goodreturns gold price format is temporarily unavailable." }, { status: 502 });
    }

    return NextResponse.json({
      configured: true,
      pricePerOunce: prices[24] * GRAMS_PER_TROY_OUNCE,
      pricePerGram: prices[24],
      prices: { perGram: prices },
      currency: "INR",
      change: null,
      changePercent: null,
      source: GOLD_PRICE_URL,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Gold price request failed:", error);
    return NextResponse.json({ error: "Live gold price is temporarily unavailable." }, { status: 502 });
  }
}
