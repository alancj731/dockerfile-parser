"use client";

import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Info,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { useState } from "react";

export interface LineExplanation {
  lineNumber: number;
  instruction: string;
  content: string;
  explanation: string;
  category:
    | "base"
    | "workdir"
    | "copy"
    | "run"
    | "env"
    | "expose"
    | "cmd"
    | "comment"
    | "arg"
    | "label"
    | "user"
    | "healthcheck"
    | "other";
  tip?: string;
  warning?: string;
}

interface DockerfileExplanationProps {
  explanations: LineExplanation[];
  isLoading: boolean;
}

const categoryColors: Record<LineExplanation["category"], string> = {
  base: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  workdir: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  copy: "bg-green-500/20 text-green-400 border-green-500/30",
  run: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  env: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  expose: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  cmd: "bg-red-500/20 text-red-400 border-red-500/30",
  comment: "bg-muted text-muted-foreground border-muted",
  arg: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  label: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  user: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  healthcheck: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  other: "bg-muted text-muted-foreground border-muted",
};

const categoryLabels: Record<LineExplanation["category"], string> = {
  base: "Base Image",
  workdir: "Working Directory",
  copy: "Copy Files",
  run: "Run Command",
  env: "Environment",
  expose: "Port",
  cmd: "Entrypoint",
  comment: "Comment",
  arg: "Build Argument",
  label: "Label",
  user: "User",
  healthcheck: "Health Check",
  other: "Other",
};

function ExplanationCard({
  explanation,
  isExpanded,
  onToggle,
}: {
  explanation: LineExplanation;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "border border-border rounded-lg overflow-hidden transition-all duration-200",
        isExpanded ? "bg-card" : "bg-card/50 hover:bg-card"
      )}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <div className="flex-shrink-0 mt-0.5">
          <ChevronRight
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              isExpanded && "rotate-90"
            )}
          />
        </div>

        <div className="flex-shrink-0 w-8 h-8 rounded bg-secondary flex items-center justify-center font-mono text-xs text-muted-foreground">
          {explanation.lineNumber}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                categoryColors[explanation.category]
              )}
            >
              {categoryLabels[explanation.category]}
            </span>
            {explanation.instruction && (
              <code className="text-xs font-mono text-accent">
                {explanation.instruction}
              </code>
            )}
          </div>
          <code className="block text-sm font-mono text-foreground truncate">
            {explanation.content}
          </code>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pl-[4.5rem]">
          <div className="text-sm text-muted-foreground leading-relaxed">
            {explanation.explanation}
          </div>

          {explanation.tip && (
            <div className="mt-3 flex items-start gap-2 p-3 rounded-md bg-accent/10 border border-accent/20">
              <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-accent">{explanation.tip}</p>
            </div>
          )}

          {explanation.warning && (
            <div className="mt-3 flex items-start gap-2 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-400">{explanation.warning}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DockerfileExplanation({
  explanations,
  isLoading,
}: DockerfileExplanationProps) {
  const [expandedLines, setExpandedLines] = useState<Set<number>>(new Set());

  const toggleLine = (lineNumber: number) => {
    setExpandedLines((prev) => {
      const next = new Set(prev);
      if (next.has(lineNumber)) {
        next.delete(lineNumber);
      } else {
        next.add(lineNumber);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedLines(new Set(explanations.map((e) => e.lineNumber)));
  };

  const collapseAll = () => {
    setExpandedLines(new Set());
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-black bg-blue-50/80">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-sm">Analyzing your Dockerfile...</p>
      </div>
    );
  }

  if (explanations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-black bg-white p-8 border border-blue-100 rounded-lg">
        <FileText className="w-12 h-12 mb-4 opacity-50 text-blue-300" />
        <p className="text-lg font-medium mb-2">No Dockerfile analyzed yet</p>
        <p className="text-sm text-center max-w-md">
          Paste your Dockerfile content on the left and click{" "}
          {"Analyze Dockerfile"} to get a line-by-line explanation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border border-blue-100 rounded-xl shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-200 bg-blue-100/40 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-black">
            Line-by-Line Explanation
          </span>
          <span className="text-xs text-gray-500">
            {explanations.length} instructions
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
          >
            Expand All
          </button>
          <span className="text-gray-400">/</span>
          <button
            onClick={collapseAll}
            className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {explanations.map((explanation) => (
            <div key={explanation.lineNumber} className="transition-shadow duration-200 hover:shadow-md rounded-lg">
              <ExplanationCard
                explanation={explanation}
                isExpanded={expandedLines.has(explanation.lineNumber)}
                onToggle={() => toggleLine(explanation.lineNumber)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
