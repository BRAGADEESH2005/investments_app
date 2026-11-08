import { createResource, listResource } from "@/lib/resource-api";
import NetWorthSnapshot from "@/models/NetWorthSnapshot";
const config = { model: NetWorthSnapshot, required: ["snapshotDate", "assets", "liabilities", "netWorth"], numeric: ["assets", "liabilities", "netWorth"], date: ["snapshotDate"] };
export const GET = (request: Request) => listResource(request, config);
export const POST = (request: Request) => createResource(request, config);
