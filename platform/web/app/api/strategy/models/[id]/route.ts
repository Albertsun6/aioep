import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MODELS_DIR = path.resolve(process.cwd(), "../models/archimate");

export const dynamic = "force-dynamic";

/**
 * GET /api/strategy/models/[id] — read a single ArchiMate model by ID
 */
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const filePath = path.join(MODELS_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    try {
        const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        return NextResponse.json(content);
    } catch {
        return NextResponse.json({ error: "Failed to parse model" }, { status: 500 });
    }
}
