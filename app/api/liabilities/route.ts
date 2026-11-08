import { createResource, listResource } from "@/lib/resource-api";
import Liability from "@/models/Liability";
const config = { model: Liability, required: ["name", "type", "outstandingAmount"], numeric: ["outstandingAmount", "interestRate"], date: ["dueDate"], allowed: { type: ["loan", "credit-card", "mortgage", "other"] } };
export const GET = (request: Request) => listResource(request, config);
export const POST = (request: Request) => createResource(request, config);
