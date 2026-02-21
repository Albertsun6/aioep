import { getGapFitData, updateRequirement } from "@/lib/data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") || undefined;
  const data = await getGapFitData(projectId);
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, projectId, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const updated = await updateRequirement(
    projectId || "erp-v1",
    id,
    updates
  );
  if (!updated) {
    return NextResponse.json(
      { error: `requirement ${id} not found` },
      { status: 404 }
    );
  }
  return NextResponse.json(updated);
}
