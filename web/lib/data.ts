import type {
  SDLCState,
  GapFitData,
  Project,
  Phase,
  Requirement,
} from "./types";

const hasDb = () => !!process.env.DATABASE_URL;

// ─── DB helpers ───

async function getDb() {
  const { neon } = await import("@neondatabase/serverless");
  return neon(process.env.DATABASE_URL!);
}

// ─── Fallback: read from JSON files (local dev without DB) ───

function readJson<T>(fileName: string): T {
  const fs = require("fs");
  const path = require("path");
  const raw = fs.readFileSync(
    path.join(process.cwd(), "data", fileName),
    "utf-8"
  );
  return JSON.parse(raw) as T;
}

function writeJson(fileName: string, data: unknown): void {
  const fs = require("fs");
  const path = require("path");
  fs.writeFileSync(
    path.join(process.cwd(), "data", fileName),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

// ═══════════════════════════════════════
// Projects
// ═══════════════════════════════════════

export async function getProjects(): Promise<Project[]> {
  if (!hasDb()) {
    return readJson<Project[]>("projects.json");
  }
  const sql = await getDb();
  const rows = await sql`SELECT * FROM projects ORDER BY created_at DESC`;
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    description: r.description as string,
    techStack: r.tech_stack as string,
    currentPhase: r.current_phase as string,
    status: r.status as string,
    createdAt: r.created_at as string,
  }));
}

export async function createProject(p: Project): Promise<Project> {
  if (!hasDb()) {
    const list = readJson<Project[]>("projects.json");
    list.push(p);
    writeJson("projects.json", list);
    return p;
  }
  const sql = await getDb();
  await sql`
    INSERT INTO projects (id, name, description, tech_stack, current_phase, status, created_at)
    VALUES (${p.id}, ${p.name}, ${p.description}, ${p.techStack}, ${p.currentPhase}, ${p.status}, ${p.createdAt})
  `;
  return p;
}

export async function updateProject(
  id: string,
  updates: Partial<Project>
): Promise<Project | null> {
  if (!hasDb()) {
    const list = readJson<Project[]>("projects.json");
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    Object.assign(list[idx], updates);
    writeJson("projects.json", list);
    return list[idx];
  }
  const sql = await getDb();
  const rows = await sql`
    UPDATE projects SET
      name = COALESCE(${updates.name ?? null}, name),
      description = COALESCE(${updates.description ?? null}, description),
      tech_stack = COALESCE(${updates.techStack ?? null}, tech_stack),
      current_phase = COALESCE(${updates.currentPhase ?? null}, current_phase),
      status = COALESCE(${updates.status ?? null}, status)
    WHERE id = ${id}
    RETURNING *
  `;
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: r.id as string,
    name: r.name as string,
    description: r.description as string,
    techStack: r.tech_stack as string,
    currentPhase: r.current_phase as string,
    status: r.status as string,
    createdAt: r.created_at as string,
  };
}

// ═══════════════════════════════════════
// SDLC
// ═══════════════════════════════════════

export async function getSDLCState(projectId?: string): Promise<SDLCState> {
  if (!hasDb()) {
    return readJson<SDLCState>("sdlc-state.json");
  }
  const sql = await getDb();
  const pid = projectId || (await getDefaultProjectId());

  const phaseRows = await sql`
    SELECT * FROM sdlc_phases WHERE project_id = ${pid} ORDER BY id
  `;
  const sprintRows = await sql`
    SELECT * FROM sprints WHERE project_id = ${pid} ORDER BY id
  `;

  return {
    currentPhase:
      phaseRows.find((p) => p.status === "in-progress")?.id ||
      phaseRows[phaseRows.length - 1]?.id ||
      "",
    phases: phaseRows.map(
      (r) =>
        ({
          id: r.id,
          name: r.name,
          subtitle: r.subtitle,
          status: r.status,
          progress: r.progress,
          duration: r.duration,
          milestones: r.milestones,
          deliverables: r.deliverables,
          gateChecks: r.gate_checks,
        }) as Phase
    ),
    sprints: sprintRows.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      status: r.status as "completed" | "in-progress" | "pending",
      content: r.content as string,
    })),
  };
}

export async function updateSDLCPhase(
  projectId: string,
  phaseId: string,
  updates: Partial<Phase>
): Promise<void> {
  if (!hasDb()) {
    const state = readJson<SDLCState>("sdlc-state.json");
    const idx = state.phases.findIndex((p) => p.id === phaseId);
    if (idx === -1) return;
    Object.assign(state.phases[idx], updates);
    writeJson("sdlc-state.json", state);
    return;
  }
  const sql = await getDb();
  if (updates.status !== undefined) {
    await sql`UPDATE sdlc_phases SET status = ${updates.status} WHERE id = ${phaseId} AND project_id = ${projectId}`;
  }
  if (updates.progress !== undefined) {
    await sql`UPDATE sdlc_phases SET progress = ${updates.progress} WHERE id = ${phaseId} AND project_id = ${projectId}`;
  }
  if (updates.milestones !== undefined) {
    await sql`UPDATE sdlc_phases SET milestones = ${JSON.stringify(updates.milestones)} WHERE id = ${phaseId} AND project_id = ${projectId}`;
  }
  if (updates.deliverables !== undefined) {
    await sql`UPDATE sdlc_phases SET deliverables = ${JSON.stringify(updates.deliverables)} WHERE id = ${phaseId} AND project_id = ${projectId}`;
  }
  if (updates.gateChecks !== undefined) {
    await sql`UPDATE sdlc_phases SET gate_checks = ${JSON.stringify(updates.gateChecks)} WHERE id = ${phaseId} AND project_id = ${projectId}`;
  }
}

// ═══════════════════════════════════════
// Gap-Fit
// ═══════════════════════════════════════

export async function getGapFitData(projectId?: string): Promise<GapFitData> {
  if (!hasDb()) {
    return readJson<GapFitData>("gap-fit-requirements.json");
  }
  const sql = await getDb();
  const pid = projectId || (await getDefaultProjectId());

  const metaRows = await sql`SELECT * FROM gap_fit_meta WHERE project_id = ${pid}`;
  const reqRows = await sql`SELECT * FROM gap_fit_requirements WHERE project_id = ${pid} ORDER BY id`;

  const meta = metaRows[0];
  return {
    projectName: "",
    version: (meta?.version as string) || "v0.1.0",
    domains: (meta?.domains as string[]) || [],
    requirements: reqRows.map(
      (r) =>
        ({
          id: r.id,
          domain: r.domain,
          subdomain: r.subdomain,
          description: r.description,
          currentCapability: r.current_capability,
          fitStatus: r.fit_status,
          strategy: r.strategy,
          effort: r.effort,
          priority: r.priority,
          sprint: r.sprint,
        }) as Requirement
    ),
  };
}

export async function updateRequirement(
  projectId: string,
  reqId: string,
  updates: Partial<Requirement>
): Promise<Requirement | null> {
  if (!hasDb()) {
    const data = readJson<GapFitData>("gap-fit-requirements.json");
    const idx = data.requirements.findIndex((r) => r.id === reqId);
    if (idx === -1) return null;
    const allowed = ["fitStatus", "strategy", "effort", "priority", "sprint"];
    for (const key of allowed) {
      if (key in updates) {
        const rec = data.requirements[idx] as unknown as Record<string, unknown>;
        const upd = updates as unknown as Record<string, unknown>;
        rec[key] = upd[key];
      }
    }
    writeJson("gap-fit-requirements.json", data);
    return data.requirements[idx];
  }
  const sql = await getDb();
  const rows = await sql`
    UPDATE gap_fit_requirements SET
      fit_status = COALESCE(${updates.fitStatus ?? null}, fit_status),
      strategy = COALESCE(${updates.strategy ?? null}, strategy),
      effort = COALESCE(${updates.effort ?? null}, effort),
      priority = COALESCE(${updates.priority ?? null}, priority),
      sprint = COALESCE(${updates.sprint ?? null}, sprint)
    WHERE id = ${reqId} AND project_id = ${projectId}
    RETURNING *
  `;
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: r.id,
    domain: r.domain,
    subdomain: r.subdomain,
    description: r.description,
    currentCapability: r.current_capability,
    fitStatus: r.fit_status,
    strategy: r.strategy,
    effort: r.effort,
    priority: r.priority,
    sprint: r.sprint,
  } as Requirement;
}

// ═══════════════════════════════════════
// Helpers
// ═══════════════════════════════════════

async function getDefaultProjectId(): Promise<string> {
  const projects = await getProjects();
  return projects[0]?.id || "erp-v1";
}
