import { deleteResource, updateResource } from "@/lib/resource-api";
import Liability from "@/models/Liability";
const config = { model: Liability, required: [], numeric: ["outstandingAmount", "interestRate"], date: ["dueDate"], allowed: { type: ["loan", "credit-card", "mortgage", "other"] } };
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { return updateResource(request, (await params).id, config); }
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) { return deleteResource(request, (await params).id, config); }
