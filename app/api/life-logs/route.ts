import { createResource, listResource } from "@/lib/resource-api";
import LifeLog from "@/models/LifeLog";

const config = { model: LifeLog, required: ["entry"] };
export const GET = (request: Request) => listResource(request, config);
export const POST = (request: Request) => createResource(request, config);
