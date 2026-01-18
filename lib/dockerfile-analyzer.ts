import type { LineExplanation } from "@/components/homepage/dockerfile-explanation";

interface InstructionInfo {
  category: LineExplanation["category"];
  explain: (args: string, fullLine: string) => string;
  tip?: (args: string) => string | undefined;
  warning?: (args: string) => string | undefined;
}

const instructions: Record<string, InstructionInfo> = {
  FROM: {
    category: "base",
    explain: (args) => {
      const parts = args.split(" AS ");
      const image = parts[0].trim();
      const alias = parts[1]?.trim();

      if (alias) {
        return `Sets "${image}" as the base image for a build stage named "${alias}". This is a multi-stage build, which helps create smaller final images by separating build dependencies from runtime dependencies.`;
      }
      return `Sets "${image}" as the base image. This is the foundation of your Docker image - all subsequent instructions will build on top of this image.`;
    },
    tip: (args) => {
      if (args.includes(":latest") || !args.includes(":")) {
        return "Consider using a specific version tag instead of 'latest' for reproducible builds.";
      }
      if (args.includes("-alpine")) {
        return "Alpine images are minimal and secure - great choice for production!";
      }
      return undefined;
    },
  },
  WORKDIR: {
    category: "workdir",
    explain: (args) =>
      `Sets the working directory to "${args}" for all subsequent instructions (RUN, CMD, ENTRYPOINT, COPY, ADD). If the directory doesn't exist, it will be created automatically.`,
    tip: () =>
      "Using WORKDIR instead of 'cd' commands makes your Dockerfile cleaner and more predictable.",
  },
  COPY: {
    category: "copy",
    explain: (args, fullLine) => {
      if (fullLine.includes("--from=")) {
        const match = fullLine.match(/--from=(\S+)/);
        const stageName = match?.[1];
        return `Copies files from the build stage "${stageName}" to the current image. This is a key pattern in multi-stage builds - it allows you to copy only the necessary artifacts from previous stages.`;
      }
      const parts = args.split(/\s+/);
      if (parts.length >= 2) {
        return `Copies "${parts.slice(0, -1).join(", ")}" from your build context to "${parts[parts.length - 1]}" in the container.`;
      }
      return `Copies files or directories from your build context into the container filesystem.`;
    },
    tip: (args) => {
      if (args.includes("package*.json") || args.includes("package.json")) {
        return "Copying package files first and installing dependencies before copying source code leverages Docker's layer caching for faster builds.";
      }
      return undefined;
    },
  },
  ADD: {
    category: "copy",
    explain: (args) => {
      const parts = args.split(/\s+/);
      if (args.includes("http://") || args.includes("https://")) {
        return `Downloads a file from a URL and adds it to the container. ADD can fetch remote files, unlike COPY.`;
      }
      if (args.includes(".tar") || args.includes(".gz")) {
        return `Copies and automatically extracts the archive "${parts[0]}" into the container. ADD automatically extracts tar archives.`;
      }
      return `Adds "${parts.slice(0, -1).join(", ")}" to "${parts[parts.length - 1]}" in the container. ADD has extra features like URL fetching and archive extraction.`;
    },
    warning: () =>
      "Consider using COPY instead of ADD unless you need URL fetching or auto-extraction. COPY is more transparent and predictable.",
  },
  RUN: {
    category: "run",
    explain: (args) => {
      if (args.includes("apt-get") || args.includes("apk add")) {
        return `Installs system packages. This command runs during the image build process and the results become part of the image layer.`;
      }
      if (args.includes("npm") || args.includes("yarn") || args.includes("pnpm")) {
        return `Runs a package manager command to install or build Node.js dependencies. The results are cached in a Docker layer.`;
      }
      if (args.includes("pip")) {
        return `Installs Python packages using pip. These packages become part of the Docker image.`;
      }
      if (args.includes("adduser") || args.includes("addgroup") || args.includes("useradd")) {
        return `Creates a system user or group. This is typically done to run the application as a non-root user for security.`;
      }
      if (args.includes("chmod") || args.includes("chown")) {
        return `Modifies file permissions or ownership. This ensures files have the correct access rights inside the container.`;
      }
      if (args.includes("mkdir")) {
        return `Creates directories inside the container. These directories will persist in the final image.`;
      }
      return `Executes the command "${args.substring(0, 60)}${args.length > 60 ? "..." : ""}" during the image build. Each RUN instruction creates a new layer in the image.`;
    },
    tip: (args) => {
      if (args.includes("&&") && args.split("&&").length > 1) {
        return "Chaining commands with && in a single RUN instruction is a best practice - it reduces the number of image layers.";
      }
      if (args.includes("npm ci")) {
        return "Using 'npm ci' is great for CI/CD - it ensures reproducible installs from package-lock.json.";
      }
      return undefined;
    },
    warning: (args) => {
      if (args.includes("apt-get install") && !args.includes("--no-install-recommends")) {
        return "Consider adding '--no-install-recommends' to apt-get install to reduce image size.";
      }
      if (args.includes("apt-get") && !args.includes("rm -rf /var/lib/apt/lists")) {
        return "Consider cleaning up apt cache with 'rm -rf /var/lib/apt/lists/*' in the same RUN instruction to reduce image size.";
      }
      return undefined;
    },
  },
  ENV: {
    category: "env",
    explain: (args) => {
      const [key, ...valueParts] = args.split("=");
      const value = valueParts.join("=");
      if (value) {
        return `Sets the environment variable "${key}" to "${value}". This variable will be available during build and at runtime in the container.`;
      }
      return `Sets environment variables. These will be available both during the build process and when the container runs.`;
    },
    tip: () =>
      "Environment variables set with ENV persist in the final image. Use ARG for build-time only variables.",
  },
  ARG: {
    category: "arg",
    explain: (args) => {
      const [key, defaultValue] = args.split("=");
      if (defaultValue) {
        return `Defines a build argument "${key}" with default value "${defaultValue}". Build arguments can be overridden at build time with --build-arg.`;
      }
      return `Defines a build argument "${key}". This value must be provided at build time using --build-arg ${key}=value.`;
    },
    tip: () =>
      "ARG values don't persist in the final image (unlike ENV), making them ideal for secrets during build.",
    warning: (args) => {
      const lowerArgs = args.toLowerCase();
      if (lowerArgs.includes("password") || lowerArgs.includes("secret") || lowerArgs.includes("token")) {
        return "Be careful with secrets in ARG - they may be visible in image history. Consider using Docker secrets or build-time mounts instead.";
      }
      return undefined;
    },
  },
  EXPOSE: {
    category: "expose",
    explain: (args) =>
      `Documents that the container listens on port ${args}. Note: This doesn't actually publish the port, only serves as documentation. Use -p flag when running to publish ports.`,
    tip: () =>
      "EXPOSE is informational - you still need to use -p or -P when running the container to actually publish ports.",
  },
  CMD: {
    category: "cmd",
    explain: (args) => {
      if (args.startsWith("[")) {
        return `Sets the default command to run when the container starts (exec form). This can be overridden when running the container. The exec form is preferred as it doesn't invoke a shell.`;
      }
      return `Sets the default command to run when the container starts (shell form). This runs through /bin/sh -c and can be overridden.`;
    },
    tip: (args) => {
      if (!args.startsWith("[")) {
        return 'Consider using exec form (e.g., ["node", "server.js"]) instead of shell form for proper signal handling.';
      }
      return undefined;
    },
  },
  ENTRYPOINT: {
    category: "cmd",
    explain: (args) => {
      if (args.startsWith("[")) {
        return `Sets the container's main executable. Unlike CMD, ENTRYPOINT is not easily overridden. CMD arguments will be appended to this command.`;
      }
      return `Sets the container's entrypoint using shell form. This defines the main process that runs in the container.`;
    },
    tip: () =>
      "ENTRYPOINT + CMD is a powerful pattern: ENTRYPOINT defines the executable, CMD provides default arguments.",
  },
  LABEL: {
    category: "label",
    explain: (args) =>
      `Adds metadata to the image as key-value pairs: ${args}. Labels are useful for organization, automation, and documentation.`,
  },
  USER: {
    category: "user",
    explain: (args) =>
      `Switches to user "${args}" for all subsequent instructions and at runtime. Running as non-root is a security best practice.`,
    tip: () =>
      "Running containers as non-root users is a security best practice that limits potential damage from container escapes.",
  },
  HEALTHCHECK: {
    category: "healthcheck",
    explain: (args) => {
      if (args.toUpperCase() === "NONE") {
        return "Disables any health check inherited from the base image.";
      }
      return `Defines a command to periodically check if the container is healthy. Docker will mark the container as unhealthy if this check fails repeatedly.`;
    },
    tip: () =>
      "Health checks help orchestrators (like Kubernetes or Docker Swarm) know when to restart unhealthy containers.",
  },
  VOLUME: {
    category: "other",
    explain: (args) =>
      `Creates a mount point at "${args}" and marks it as holding externally mounted volumes. Data here persists beyond the container lifecycle.`,
    warning: () =>
      "VOLUME creates anonymous volumes that can be hard to manage. Consider defining volumes at runtime instead.",
  },
  SHELL: {
    category: "other",
    explain: (args) =>
      `Changes the default shell used for shell-form commands to ${args}. This affects all subsequent RUN, CMD, and ENTRYPOINT instructions in shell form.`,
  },
  STOPSIGNAL: {
    category: "other",
    explain: (args) =>
      `Sets the system call signal (${args}) that will be sent to the container to exit. The default is SIGTERM.`,
  },
  ONBUILD: {
    category: "other",
    explain: (args) =>
      `Registers a trigger instruction "${args}" that will run when this image is used as a base for another build. It's a way to defer instructions to child images.`,
  },
};

export function analyzeDockerfile(content: string): LineExplanation[] {
  const lines = content.split("\n");
  const explanations: LineExplanation[] = [];

  let multilineBuffer = "";
  let multilineStartLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    const lineNumber = i + 1;

    // Skip empty lines
    if (!trimmedLine) {
      continue;
    }

    // Handle multi-line instructions (ending with \)
    if (trimmedLine.endsWith("\\")) {
      if (!multilineBuffer) {
        multilineStartLine = lineNumber;
      }
      multilineBuffer += trimmedLine.slice(0, -1) + " ";
      continue;
    }

    // Complete multi-line or process single line
    const fullLine = multilineBuffer ? multilineBuffer + trimmedLine : trimmedLine;
    const currentLineNumber = multilineBuffer ? multilineStartLine : lineNumber;
    multilineBuffer = "";

    // Handle comments
    if (fullLine.startsWith("#")) {
      explanations.push({
        lineNumber: currentLineNumber,
        instruction: "",
        content: fullLine,
        explanation:
          "A comment providing documentation or context. Comments are ignored during the build but help others understand the Dockerfile.",
        category: "comment",
      });
      continue;
    }

    // Parse instruction
    const match = fullLine.match(/^(\S+)\s*(.*)/);
    if (!match) continue;

    const [, instruction, args] = match;
    const upperInstruction = instruction.toUpperCase();
    const info = instructions[upperInstruction];

    if (info) {
      explanations.push({
        lineNumber: currentLineNumber,
        instruction: upperInstruction,
        content: fullLine.length > 80 ? fullLine.substring(0, 77) + "..." : fullLine,
        explanation: info.explain(args, fullLine),
        category: info.category,
        tip: info.tip?.(args),
        warning: info.warning?.(args),
      });
    } else {
      explanations.push({
        lineNumber: currentLineNumber,
        instruction: upperInstruction,
        content: fullLine,
        explanation: `Executes the ${upperInstruction} instruction. This may be a less common or custom instruction.`,
        category: "other",
      });
    }
  }

  return explanations;
}
