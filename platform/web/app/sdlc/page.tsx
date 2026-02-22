"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "@/lib/project-context";
import { Spin } from "antd";

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
  return <Spin size="large" style={{ display: "block", margin: "80px auto" }} />;
}
