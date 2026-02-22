import "./globals.css";
import React from "react";
import AppShell from "@/components/layout/app-shell";
import { ProjectProvider } from "@/lib/project-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <title>AIOEP Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-background text-foreground antialiased min-h-screen font-sans">
        <TooltipProvider>
          <ProjectProvider>
            <AppShell>{children}</AppShell>
          </ProjectProvider>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
