import { createResource, listResource } from "@/lib/resource-api";
import FinancialGoal from "@/models/FinancialGoal";

const config = { model: FinancialGoal, required: ["name", "targetAmount", "targetDate"], numeric: ["targetAmount", "currentAmount"], date: ["targetDate"], allowed: { priority: ["low", "medium", "high"] } };
export const GET = (request: Request) => listResource(request, config);
export const POST = (request: Request) => createResource(request, config);
