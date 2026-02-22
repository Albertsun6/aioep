import { getSDLCState, updateSDLCPhase } from "@/lib/data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") || undefined;
  const data = await getSDLCState(projectId);
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { projectId, phaseId, ...updates } = body;

  if (!phaseId) {
    return NextResponse.json(
      { error: "phaseId is required" },
      { status: 400 }
    );
  }

  await updateSDLCPhase(projectId || "erp-v1", phaseId, updates);
  return NextResponse.json({ ok: true });
}
