import { neon } from "@neondatabase/serverless";

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Create a Neon database at https://neon.tech and add the connection string to .env.local"
    );
  }
  return neon(url);
}

export async function initDb() {
  const sql = getDb();

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
}
