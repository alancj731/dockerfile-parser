# Dockerfile Explainer

A web application that helps you understand Dockerfile instructions line by line. Paste your Dockerfile content and get detailed explanations for each instruction.

## Features

- 🔍 **Line-by-line analysis** - Get detailed explanations for each Dockerfile instruction
- 🔒 **Privacy-focused** - All analysis happens locally in your browser, no data is sent to any server
- 🌙 **Dark/Light mode** - Toggle between themes for comfortable viewing
- 📱 **Responsive design** - Works on desktop and mobile devices
- ⚡ **Fast and lightweight** - Built with Next.js and Tailwind CSS

## Supported Instructions

The analyzer supports all standard Dockerfile instructions including:

- `FROM` - Base image selection
- `RUN` - Execute commands
- `COPY` / `ADD` - File operations
- `WORKDIR` - Working directory
- `ENV` / `ARG` - Environment variables
- `EXPOSE` - Port documentation
- `CMD` / `ENTRYPOINT` - Container startup
- `VOLUME` - Data persistence
- `USER` - Security context
- `HEALTHCHECK` - Container health monitoring
- And more...

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/alancj731/dockerfile-parser.git
cd dockerfile-parser

# Install dependencies
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Lucide React](https://lucide.dev) - Icons
- [TypeScript](https://www.typescriptlang.org) - Type safety

## License

MIT
