import { getGoldPrice, type GoldKarat } from "@/lib/gold";

type ValuableInvestment = {
  type: "House" | "FD" | "RD" | "Gold";
  name: string;
  principal: number;
  investedAt: string;
  endDate?: string;
  interestRate?: number;
  compounding?: "monthly" | "quarterly" | "half-yearly" | "yearly";
  quantity?: number;
  unit?: string;
};

type GoldPrices = Partial<Record<GoldKarat, number>>;

export function getElapsedDays(investedAt: string, endDate?: string) {
  const start = new Date(`${investedAt.slice(0, 10)}T00:00:00`).getTime();
  const end = endDate ? new Date(`${endDate.slice(0, 10)}T00:00:00`).getTime() : Date.now();
  return Math.max(0, Math.floor((Math.min(end, Date.now()) - start) / 86400000));
}

export function getCurrentValue(item: ValuableInvestment, goldPrices: GoldPrices = {}) {
  if (item.type === "Gold" && item.quantity) {
    const gold = getGoldPrice(goldPrices, item.name);
    const quantityInGrams = item.unit === "pounds" ? item.quantity * 453.59237 : item.quantity;
    return gold.pricePerGram * quantityInGrams || item.principal;
  }
  if ((item.type === "FD" || item.type === "RD") && item.interestRate) {
    const days = getElapsedDays(item.investedAt, item.endDate);
    const periodsPerYear = item.compounding === "monthly" ? 12 : item.compounding === "quarterly" ? 4 : item.compounding === "half-yearly" ? 2 : 1;
    const periods = (days / 365) * periodsPerYear;
    return item.compounding ? item.principal * Math.pow(1 + item.interestRate / 100 / periodsPerYear, periods) : item.principal * (1 + item.interestRate / 100 * days / 365);
  }
  return item.principal;
}

export function getValueLabel(item: ValuableInvestment) {
  if (item.type === "Gold") return "Market value";
  if (item.type === "FD" || item.type === "RD") return "Accrued value";
  return "Current value";
}

export function getChangePercent(principal: number, currentValue: number) {
  return principal > 0 ? ((currentValue - principal) / principal) * 100 : 0;
}
