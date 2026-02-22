import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SETTINGS_PATH = path.join(process.cwd(), "data", "company-settings.json");

const DEFAULT_SETTINGS = {
    companyName: "AIOEP 演示企业",
    industry: "",
    annualRevenue: "",
    employeeCount: "",
    description: "",
    strategicCycle: "annual",
    currentYear: new Date().getFullYear(),
};

function readSettings() {
    try {
        if (fs.existsSync(SETTINGS_PATH)) {
            return JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8"));
        }
    } catch { }
    return { ...DEFAULT_SETTINGS };
}

export const dynamic = "force-dynamic";

export async function GET() {
    return NextResponse.json(readSettings());
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const current = readSettings();
        const updated = { ...current, ...body };

        // Ensure data dir exists
        const dir = path.dirname(SETTINGS_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(updated, null, 2), "utf-8");
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json(
            { error: `Failed to save settings: ${error.message}` },
            { status: 500 }
        );
    }
}
