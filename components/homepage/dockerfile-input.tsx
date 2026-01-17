"use client";

import React from "react"
import { Button } from "@/components/ui/button";
import { FileCode, Upload, Trash2 } from "lucide-react";
import { useRef } from "react";

interface DockerfileInputProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const sampleDockerfile = `# Use official Node.js LTS image as base
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]`;

export function DockerfileInput({
  value,
  onChange,
  onAnalyze,
  isAnalyzing,
}: DockerfileInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onChange(content);
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSample = () => {
    onChange(sampleDockerfile);
  };

  const handleClear = () => {
    onChange("");
  };

  const lines = value.split("\n");
  const lineCount = lines.length;

  return (
    <div className="flex flex-col h-full bg-white border border-blue-100 rounded-xl shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-200 bg-blue-100/40 rounded-t-xl">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-black">
            Dockerfile
          </span>
          <span className="text-xs text-gray-500">
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="*"
            onChange={handleFileUpload}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-500 hover:text-blue-600 hover:!bg-slate-200"
          >
            <Upload className="w-4 h-4 mr-1 text-blue-500" />
            Upload
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadSample}
            className="text-blue-500 hover:text-blue-600 hover:!bg-slate-200"
          >
            Load Sample
          </Button>
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-blue-500 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4 text-blue-500" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Line numbers */}
          <div className="flex-shrink-0 bg-blue-100/30 border-r border-blue-200 select-none overflow-y-auto rounded-bl-xl">
            <div className="px-3 py-3 font-mono text-xs leading-6 text-gray-400 text-right">
              {lines.map((_, idx) => (
                <div key={idx}>{idx + 1}</div>
              ))}
            </div>
          </div>

          {/* Code editor */}
          <div className="flex-1 overflow-auto">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Paste your Dockerfile content here..."
              className="w-full h-full p-3 bg-transparent font-mono text-sm leading-6 text-black resize-none focus:outline-none placeholder:text-gray-400"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-blue-200 bg-blue-100/40 rounded-b-xl">
        <Button
          onClick={onAnalyze}
          disabled={!value.trim() || isAnalyzing}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-sm"
        >
          {isAnalyzing ? (
            <>
              <span className="w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mr-2" />
              Analyzing...
            </>
          ) : (
            "Analyze Dockerfile"
          )}
        </Button>
      </div>
    </div>
  );
}
