/**
 * Migration script: Import existing JSON data into Neon Postgres.
 *
 * Usage:
 *   DATABASE_URL="postgres://..." npx tsx scripts/migrate.ts
 *
 * Or set DATABASE_URL in .env.local, then:
 *   npx tsx -r dotenv/config scripts/migrate.ts
 */

import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is required.");
  console.error(
    "Get one free at https://neon.tech, then run:\n  DATABASE_URL='postgres://...' npx tsx scripts/migrate.ts"
  );
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const dataDir = path.join(__dirname, "..", "data");

async function migrate() {
  console.log("Creating tables...");

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      tech_stack TEXT DEFAULT '',
      current_phase TEXT DEFAULT '',
      status TEXT DEFAULT '',
      created_at TEXT DEFAULT ''
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sdlc_phases (
      id TEXT NOT NULL,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      subtitle TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      progress INTEGER DEFAULT 0,
      duration TEXT DEFAULT '',
      milestones JSONB DEFAULT '[]',
      deliverables JSONB DEFAULT '[]',
      gate_checks JSONB DEFAULT '[]',
      PRIMARY KEY (id, project_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sprints (
      id TEXT NOT NULL,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      content TEXT DEFAULT '',
      PRIMARY KEY (id, project_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS gap_fit_requirements (
      id TEXT NOT NULL,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      domain TEXT DEFAULT '',
      subdomain TEXT DEFAULT '',
      description TEXT DEFAULT '',
      current_capability TEXT DEFAULT '',
      fit_status TEXT DEFAULT 'Gap',
      strategy TEXT,
      effort TEXT,
      priority TEXT,
      sprint TEXT,
      PRIMARY KEY (id, project_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS gap_fit_meta (
      project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
      version TEXT DEFAULT 'v0.1.0',
      domains JSONB DEFAULT '[]'
    )
  `;

  console.log("Tables created.");

  // --- Import projects ---
  const projectsRaw = fs.readFileSync(
    path.join(dataDir, "projects.json"),
    "utf-8"
  );
  const projects = JSON.parse(projectsRaw) as Array<{
    id: string;
    name: string;
    description: string;
    techStack: string;
    currentPhase: string;
    status: string;
    createdAt: string;
  }>;

  for (const p of projects) {
    await sql`
      INSERT INTO projects (id, name, description, tech_stack, current_phase, status, created_at)
      VALUES (${p.id}, ${p.name}, ${p.description}, ${p.techStack}, ${p.currentPhase}, ${p.status}, ${p.createdAt})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        tech_stack = EXCLUDED.tech_stack,
        current_phase = EXCLUDED.current_phase,
        status = EXCLUDED.status
    `;
  }
  console.log(`Imported ${projects.length} project(s).`);

  const projectId = projects[0].id;

  // --- Import SDLC state ---
  const sdlcRaw = fs.readFileSync(
    path.join(dataDir, "sdlc-state.json"),
    "utf-8"
  );
  const sdlc = JSON.parse(sdlcRaw);

  for (const phase of sdlc.phases) {
    await sql`
      INSERT INTO sdlc_phases (id, project_id, name, subtitle, status, progress, duration, milestones, deliverables, gate_checks)
      VALUES (
        ${phase.id}, ${projectId}, ${phase.name}, ${phase.subtitle},
        ${phase.status}, ${phase.progress}, ${phase.duration},
        ${JSON.stringify(phase.milestones)}, ${JSON.stringify(phase.deliverables)}, ${JSON.stringify(phase.gateChecks)}
      )
      ON CONFLICT (id, project_id) DO UPDATE SET
        name = EXCLUDED.name, subtitle = EXCLUDED.subtitle, status = EXCLUDED.status,
        progress = EXCLUDED.progress, milestones = EXCLUDED.milestones,
        deliverables = EXCLUDED.deliverables, gate_checks = EXCLUDED.gate_checks
    `;
  }
  console.log(`Imported ${sdlc.phases.length} SDLC phases.`);

  for (const sprint of sdlc.sprints) {
    await sql`
      INSERT INTO sprints (id, project_id, name, status, content)
      VALUES (${sprint.id}, ${projectId}, ${sprint.name}, ${sprint.status}, ${sprint.content})
      ON CONFLICT (id, project_id) DO UPDATE SET
        name = EXCLUDED.name, status = EXCLUDED.status, content = EXCLUDED.content
    `;
  }
  console.log(`Imported ${sdlc.sprints.length} sprints.`);

  // --- Import Gap-Fit ---
  const gapfitRaw = fs.readFileSync(
    path.join(dataDir, "gap-fit-requirements.json"),
    "utf-8"
  );
  const gapfit = JSON.parse(gapfitRaw);

  await sql`
    INSERT INTO gap_fit_meta (project_id, version, domains)
    VALUES (${projectId}, ${gapfit.version}, ${JSON.stringify(gapfit.domains)})
    ON CONFLICT (project_id) DO UPDATE SET
      version = EXCLUDED.version, domains = EXCLUDED.domains
  `;

  for (const r of gapfit.requirements) {
    await sql`
      INSERT INTO gap_fit_requirements (id, project_id, domain, subdomain, description, current_capability, fit_status, strategy, effort, priority, sprint)
      VALUES (
        ${r.id}, ${projectId}, ${r.domain}, ${r.subdomain}, ${r.description},
        ${r.currentCapability}, ${r.fitStatus}, ${r.strategy}, ${r.effort}, ${r.priority}, ${r.sprint}
      )
      ON CONFLICT (id, project_id) DO UPDATE SET
        fit_status = EXCLUDED.fit_status, strategy = EXCLUDED.strategy,
        effort = EXCLUDED.effort, priority = EXCLUDED.priority, sprint = EXCLUDED.sprint
    `;
  }
  console.log(`Imported ${gapfit.requirements.length} requirements.`);

  console.log("\nMigration complete!");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
