"use client";

import { useState, useCallback } from "react";
import { DockerfileInput } from "@/components/homepage/dockerfile-input";
import {
  DockerfileExplanation,
  type LineExplanation,
} from "@/components/homepage/dockerfile-explanation";
import { analyzeDockerfile } from "@/lib/dockerfile-analyzer";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { FileCode, Github, Terminal, Dock } from "lucide-react";

export default function Home() {
  const [dockerfileContent, setDockerfileContent] = useState("");
  const [explanations, setExplanations] = useState<LineExplanation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true);

    // Simulate a brief delay for better UX
    setTimeout(() => {
      const results = analyzeDockerfile(dockerfileContent);
      setExplanations(results);
      setIsAnalyzing(false);
    }, 500);
  }, [dockerfileContent]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <FileCode className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Dockerfile Explainer
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Understand your Dockerfile line by line
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://docs.docker.com/reference/dockerfile/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Dock className="w-4 h-4" />
              <span className="hidden sm:inline">Docker</span>
            </a>
            <a
              href="https://github.com/alancj731/dockerfile-parser"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">Repo</span>
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4">
        <div className="grid lg:grid-cols-2 gap-4 h-[calc(100vh-8rem)]">
          {/* Input Panel */}
          <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col min-h-[400px] lg:min-h-0">
            <DockerfileInput
              value={dockerfileContent}
              onChange={setDockerfileContent}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {/* Output Panel */}
          <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col min-h-[400px] lg:min-h-0">
            <DockerfileExplanation
              explanations={explanations}
              isLoading={isAnalyzing}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>
            Analyze Dockerfiles locally - no data is sent to any server.
          </p>
          <p>
            Built with Next.js and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
