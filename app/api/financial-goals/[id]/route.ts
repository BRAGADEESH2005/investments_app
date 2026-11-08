import { deleteResource, updateResource } from "@/lib/resource-api";
import FinancialGoal from "@/models/FinancialGoal";
const config = { model: FinancialGoal, required: [], numeric: ["targetAmount", "currentAmount"], date: ["targetDate"], allowed: { priority: ["low", "medium", "high"] } };
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { return updateResource(request, (await params).id, config); }
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) { return deleteResource(request, (await params).id, config); }
