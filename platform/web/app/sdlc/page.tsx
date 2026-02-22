"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "@/lib/project-context";
import { Loader2 } from "lucide-react";

export default function SDLCRedirect() {
  const router = useRouter();
  const { currentProject } = useProject();
  useEffect(() => {
    if (currentProject) {
      router.replace(`/projects/${currentProject.id}/sdlc`);
    } else {
      router.replace("/projects");
    }
  }, [currentProject, router]);
  return <div className="flex h-[80vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
}
