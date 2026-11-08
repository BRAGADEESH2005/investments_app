import { deleteResource, updateResource } from "@/lib/resource-api";
import LifeLog from "@/models/LifeLog";

const config = { model: LifeLog, required: [] };
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return deleteResource(request, (await params).id, config);
}
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return updateResource(request, (await params).id, config);
}
