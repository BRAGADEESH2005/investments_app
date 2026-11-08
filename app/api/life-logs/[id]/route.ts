import { deleteResource } from "@/lib/resource-api";
import LifeLog from "@/models/LifeLog";

const config = { model: LifeLog, required: [] };
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return deleteResource(request, (await params).id, config);
}
