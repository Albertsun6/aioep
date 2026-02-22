import { NextResponse } from "next/server";
import { getStrategicInitiatives, getStrategicObjectives, getProjects } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;
    const iniId = resolvedParams.id;
    const initiatives = await getStrategicInitiatives();
    const ini = initiatives.find(i => i.id === iniId);

    if (!ini) {
        return NextResponse.json({ error: "Initiative not found" }, { status: 404 });
    }

    const objectives = await getStrategicObjectives();
    const obj = objectives.find(o => o.id === ini.objectiveId);

    const projects = await getProjects();
    const linkedProjects = projects.filter(p => p.strategyId === ini.id);

    return NextResponse.json({
        ...ini,
        objective: obj,
        projects: linkedProjects
    });
}
