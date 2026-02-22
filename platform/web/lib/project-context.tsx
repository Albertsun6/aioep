"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Project } from "./types";

interface ProjectContextValue {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProjectId: (id: string) => void;
  refreshProjects: () => Promise<void>;
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextValue>({
  projects: [],
  currentProject: null,
  setCurrentProjectId: () => {},
  refreshProjects: async () => {},
  loading: true,
});

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentId, setCurrentId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const refreshProjects = useCallback(async () => {
    const res = await fetch("/api/projects");
    const data: Project[] = await res.json();
    setProjects(data);
    if (data.length > 0 && !data.find((p) => p.id === currentId)) {
      setCurrentId(data[0].id);
    }
    setLoading(false);
  }, [currentId]);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const currentProject = projects.find((p) => p.id === currentId) || null;

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        setCurrentProjectId: setCurrentId,
        refreshProjects,
        loading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}
