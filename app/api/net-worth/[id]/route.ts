import { deleteResource, updateResource } from "@/lib/resource-api";
import NetWorthSnapshot from "@/models/NetWorthSnapshot";
const config = { model: NetWorthSnapshot, required: [], numeric: ["assets", "liabilities", "netWorth"], date: ["snapshotDate"] };
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { return updateResource(request, (await params).id, config); }
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) { return deleteResource(request, (await params).id, config); }
