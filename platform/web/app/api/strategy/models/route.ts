import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MODELS_DIR = path.resolve(process.cwd(), "../models/archimate");

function ensureDir() {
    if (!fs.existsSync(MODELS_DIR)) {
        fs.mkdirSync(MODELS_DIR, { recursive: true });
    }
}

export const dynamic = "force-dynamic";

/**
 * GET /api/strategy/models — list all saved ArchiMate motivation models
 */
export async function GET() {
    ensureDir();
    const files = fs.readdirSync(MODELS_DIR).filter(f => f.endsWith(".json"));

    const models = files.map(file => {
        try {
            const content = JSON.parse(fs.readFileSync(path.join(MODELS_DIR, file), "utf-8"));
            return {
                id: file.replace(".json", ""),
                name: content.metadata?.name || file,
                source: content.metadata?.source || "unknown",
                createdAt: content.metadata?.createdAt || null,
                status: content.metadata?.status || "draft",
                targetYear: content.metadata?.targetYear || null,
                elementCount: content.elements?.length || 0,
                relationshipCount: content.relationships?.length || 0,
            };
        } catch {
            return { id: file.replace(".json", ""), name: file, error: "parse failed" };
        }
    });

    return NextResponse.json(models);
}

/**
 * POST /api/strategy/models — save a new ArchiMate motivation model
 */
export async function POST(req: Request) {
    ensureDir();

    try {
        const body = await req.json();
        const { name, source, elements, relationships, targetYear } = body;

        if (!elements || !Array.isArray(elements)) {
            return NextResponse.json(
                { error: "elements array is required" },
                { status: 400 }
            );
        }

        const id = `model-${Date.now()}`;
        const model = {
            modelVersion: "1.0",
            modelType: "archimate-motivation",
            metadata: {
                name: name || `战略模型 ${new Date().toLocaleDateString("zh-CN")}`,
                source: source || "AI Wizard",
                createdBy: "ai + human",
                createdAt: new Date().toISOString(),
                status: "confirmed",
                method: "AI辅助战略建模方法 v1.0",
                targetYear: targetYear || new Date().getFullYear(),
            },
            elements,
            relationships: relationships || [],
        };

        const filePath = path.join(MODELS_DIR, `${id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(model, null, 2), "utf-8");

        return NextResponse.json({
            id,
            filePath: filePath,
            elementCount: elements.length,
            relationshipCount: (relationships || []).length,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: `Failed to save model: ${error.message}` },
            { status: 500 }
        );
    }
}
