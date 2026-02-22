import { NextResponse } from "next/server";
import { getStrategicObjectives, getKeyResults, getStrategicInitiatives, getProjects } from "@/lib/data";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const MODELS_DIR = path.resolve(process.cwd(), "../models/archimate");

/**
 * Load ArchiMate models and convert to dashboard format
 */
function loadArchiMateModels() {
    if (!fs.existsSync(MODELS_DIR)) return [];
    const files = fs.readdirSync(MODELS_DIR).filter(f => f.endsWith(".json"));

    return files.map(file => {
        try {
            const model = JSON.parse(fs.readFileSync(path.join(MODELS_DIR, file), "utf-8"));
            const elements = model.elements || [];
            const relationships = model.relationships || [];

            // Map Goal → StrategicObjective
            const goals = elements.filter((e: any) => e.type === "Goal");
            const outcomes = elements.filter((e: any) => e.type === "Outcome");
            const workPackages = elements.filter((e: any) => e.type === "WorkPackage");

            return goals.map((goal: any) => {
                // Find Outcomes linked to this Goal via Aggregation
                const linkedOutcomeIds = relationships
                    .filter((r: any) => r.type === "Aggregation" && r.sourceId === goal.id)
                    .map((r: any) => r.targetId);
                const linkedOutcomes = outcomes.filter((o: any) => linkedOutcomeIds.includes(o.id));

                // Find WorkPackages linked to this Goal via Realization chain
                const linkedReqIds = relationships
                    .filter((r: any) => r.type === "Realization" && r.targetId === goal.id)
                    .map((r: any) => r.sourceId);
                const linkedWpIds = relationships
                    .filter((r: any) => r.type === "Realization" && linkedReqIds.includes(r.targetId))
                    .map((r: any) => r.sourceId);
                // Also include direct Realization to Goal
                const directWpIds = relationships
                    .filter((r: any) => r.type === "Realization" && r.targetId === goal.id && workPackages.some((wp: any) => wp.id === r.sourceId))
                    .map((r: any) => r.sourceId);
                const allWpIds = [...new Set([...linkedWpIds, ...directWpIds])];
                const linkedWps = workPackages.filter((wp: any) => allWpIds.includes(wp.id));

                return {
                    id: goal.id,
                    name: goal.name,
                    description: goal.description,
                    year: model.metadata?.targetYear || new Date().getFullYear(),
                    progress: 0,
                    source: "archimate",
                    modelFile: file,
                    keyResults: linkedOutcomes.map((o: any) => ({
                        id: o.id,
                        objectiveId: goal.id,
                        name: o.name,
                        target: o.target || "",
                        current: 0,
                        unit: "",
                    })),
                    initiatives: linkedWps.map((wp: any) => ({
                        id: wp.id,
                        objectiveId: goal.id,
                        name: wp.name,
                        description: wp.description,
                        status: "planning",
                        priority: wp.priority || "P2",
                        projects: [],
                    })),
                };
            });
        } catch {
            return [];
        }
    }).flat();
}

export async function GET() {
    // Load legacy data
    const objectives = await getStrategicObjectives();
    const keyResults = await getKeyResults();
    const initiatives = await getStrategicInitiatives();
    const projects = await getProjects();

    const legacyData = objectives.map(obj => {
        return {
            ...obj,
            source: "legacy",
            keyResults: keyResults.filter(kr => kr.objectiveId === obj.id),
            initiatives: initiatives.filter(ini => ini.objectiveId === obj.id).map(ini => {
                return {
                    ...ini,
                    projects: projects.filter(p => p.strategyId === ini.id)
                }
            })
        };
    });

    // Load ArchiMate models
    const archiMateData = loadArchiMateModels();

    // Merge: legacy first, then ArchiMate (dedupe by id)
    const existingIds = new Set(legacyData.map(d => d.id));
    const merged = [
        ...legacyData,
        ...archiMateData.filter((d: any) => !existingIds.has(d.id)),
    ];

    return NextResponse.json(merged);
}
