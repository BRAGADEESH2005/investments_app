import { createResource, listResource } from "@/lib/resource-api";
import LICPolicy from "@/models/LICPolicy";

const config = {
  model: LICPolicy,
  required: ["policyNumber", "insurer", "planName", "sumAssured", "premiumAmount", "premiumFrequency", "nextPremiumDate"],
  numeric: ["sumAssured", "premiumAmount", "reminderDaysBefore", "premiumPayingTerm", "totalPolicyTerm", "expectedMaturityAmount", "bonuses", "guaranteedBenefits"],
  date: ["nextPremiumDate", "maturityDate", "commencementDate", "premiumPaymentEndDate"],
  allowed: { premiumFrequency: ["monthly", "quarterly", "half-yearly", "yearly"], status: ["active", "matured", "surrendered", "lapsed"] },
};
export const GET = (request: Request) => listResource(request, config);
export const POST = (request: Request) => createResource(request, config);
