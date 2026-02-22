import { getProjects, createProject, updateProject } from "@/lib/data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.id || !body.name) {
    return NextResponse.json(
      { error: "id and name are required" },
      { status: 400 }
    );
  }
  const project = await createProject({
    id: body.id,
    name: body.name,
    description: body.description || "",
    techStack: body.techStack || "",
    currentPhase: body.currentPhase || "",
    status: body.status || "",
    createdAt: body.createdAt || new Date().toISOString().slice(0, 10),
  });
  return NextResponse.json(project, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const updated = await updateProject(body.id, body);
  if (!updated) {
    return NextResponse.json(
      { error: `project ${body.id} not found` },
      { status: 404 }
    );
  }
  return NextResponse.json(updated);
}
