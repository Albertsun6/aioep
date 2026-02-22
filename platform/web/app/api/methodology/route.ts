import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const REGISTRY_PATH = path.join(process.cwd(), "data", "methodology-registry.json");

export const dynamic = "force-dynamic";

/**
 * GET /api/methodology — list methodologies with optional filters
 * Query params: ?phase=Phase 1&scenario=ERP 选型&category=分析方法
 */
export async function GET(req: Request) {
    try {
        const content = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));
        const { searchParams } = new URL(req.url);
        const phase = searchParams.get("phase");
        const scenario = searchParams.get("scenario");
        const category = searchParams.get("category");

        let filtered = content;

        if (phase) {
            filtered = filtered.filter((m: any) => m.phase.includes(phase));
        }
        if (scenario) {
            filtered = filtered.filter((m: any) => m.scenarios.includes(scenario));
        }
        if (category) {
            filtered = filtered.filter((m: any) => m.category === category);
        }

        return NextResponse.json(filtered);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
