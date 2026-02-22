import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const PLATFORM_ROOT = path.resolve(process.cwd(), "..");
const PROJECTS_ROOT = path.resolve(process.cwd(), "../..", "projects");

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get("path") ?? "";
    const section = searchParams.get("section") ?? "platform";

    // Security: prevent path traversal
    const sanitized = filePath.replace(/\.\.\//g, "");

    const root = section === "projects" ? PROJECTS_ROOT : PLATFORM_ROOT;
    const absPath = path.join(root, sanitized);

    if (!absPath.startsWith(root)) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    if (!fs.existsSync(absPath)) {
        return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const content = fs.readFileSync(absPath, "utf-8");
    return NextResponse.json({ content, path: filePath });
}
