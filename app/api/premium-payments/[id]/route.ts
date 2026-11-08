import { deleteResource, updateResource } from "@/lib/resource-api";
import PremiumPayment from "@/models/PremiumPayment";
import LICPolicy from "@/models/LICPolicy";
const config = { model: PremiumPayment, required: [], numeric: ["amount"], date: ["paidAt"], related: { field: "policyId", model: LICPolicy } };
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { return updateResource(request, (await params).id, config); }
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) { return deleteResource(request, (await params).id, config); }
