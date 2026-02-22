// === SDLC Types ===

export type PhaseStatus = "completed" | "in-progress" | "pending";

export interface Milestone {
  id: string;
  name: string;
  completed: boolean;
}

export interface Deliverable {
  id: string;
  name: string;
  completed: boolean;
  path?: string;
}

export interface GateCheck {
  id: string;
  description: string;
  passed: boolean | null; // null = not checked yet
  standard: string;
}

export interface Phase {
  id: string;
  name: string;
  subtitle: string;
  status: PhaseStatus;
  progress: number;
  duration: string;
  milestones: Milestone[];
  deliverables: Deliverable[];
  gateChecks: GateCheck[];
}

export interface Sprint {
  id: string;
  name: string;
  status: "completed" | "in-progress" | "pending";
  content: string;
}

export interface SDLCState {
  phases: Phase[];
  sprints: Sprint[];
  currentPhase: string;
}

// === Gap-Fit Types ===

export type FitStatus = "Fit" | "Partial" | "Gap" | "OOS";
export type Effort = "S" | "M" | "L" | "XL";
export type Priority = "P0" | "P1" | "P2" | "P3";

export interface Requirement {
  id: string;
  domain: string;
  subdomain: string;
  description: string;
  currentCapability: string;
  fitStatus: FitStatus;
  strategy: string | null;
  effort: Effort | null;
  priority: Priority | null;
  sprint: string | null;
}

export interface GapFitData {
  projectName: string;
  version: string;
  domains: string[];
  requirements: Requirement[];
}

// === Project Types ===

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string;
  currentPhase: string;
  status: string;
  createdAt: string;
}

// === AI Chat Types ===

export type AIProvider = "openai" | "anthropic";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}
