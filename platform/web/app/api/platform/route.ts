import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

/** Recursively read a directory into a tree structure */
function readDir(
    dirPath: string,
    relativePath: string = ""
): FileNode[] {
    if (!fs.existsSync(dirPath)) return [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries
        .filter((e) => !e.name.startsWith(".") && e.name !== "node_modules")
        .sort((a, b) => {
            // dirs first
            if (a.isDirectory() && !b.isDirectory()) return -1;
            if (!a.isDirectory() && b.isDirectory()) return 1;
            return a.name.localeCompare(b.name);
        })
        .map((entry) => {
            const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
                return {
                    name: entry.name,
                    path: rel,
                    type: "directory" as const,
                    children: readDir(path.join(dirPath, entry.name), rel),
                };
            } else {
                return {
                    name: entry.name,
                    path: rel,
                    type: "file" as const,
                    ext: path.extname(entry.name).toLowerCase(),
                };
            }
        });
}

export interface FileNode {
    name: string;
    path: string;
    type: "file" | "directory";
    ext?: string;
    children?: FileNode[];
}

// Platform root is two levels above the web app
const PLATFORM_ROOT = path.resolve(process.cwd(), "..");
const PROJECTS_ROOT = path.resolve(process.cwd(), "../..", "projects");

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section") ?? "platform";

    if (section === "platform") {
        const tree: Record<string, FileNode[]> = {
            docs: readDir(path.join(PLATFORM_ROOT, "docs"), "docs"),
            workflows: readDir(path.join(PLATFORM_ROOT, "workflows"), "workflows"),
            rules: readDir(path.join(PLATFORM_ROOT, "rules"), "rules"),
        };
        return NextResponse.json(tree);
    }

    if (section === "projects") {
        if (!fs.existsSync(PROJECTS_ROOT)) {
            return NextResponse.json([]);
        }
        const entries = fs.readdirSync(PROJECTS_ROOT, { withFileTypes: true });
        const projects = entries
            .filter((e) => e.isDirectory() && !e.name.startsWith("."))
            .map((e) => ({
                name: e.name,
                path: e.name,
                files: readDir(path.join(PROJECTS_ROOT, e.name), e.name),
            }));
        return NextResponse.json(projects);
    }

    return NextResponse.json({ error: "invalid section" }, { status: 400 });
}
