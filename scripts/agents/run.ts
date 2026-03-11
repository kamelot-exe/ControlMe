#!/usr/bin/env node
import "dotenv/config";
import {
  orchestrate,
  printResults,
  saveResults,
  scanProjectState,
} from "./orchestrator";
import { AgentName } from "./types";

// ─── CLI argument parsing ────────────────────────────────────────────────────

const args = process.argv.slice(2);

function getFlag(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
}

function hasFlag(flag: string): boolean {
  return args.includes(flag);
}

// ─── Help ─────────────────────────────────────────────────────────────────────

if (hasFlag("--help") || hasFlag("-h")) {
  console.log(`
ControlMe Agent Orchestrator

Usage:
  npx tsx scripts/agents/run.ts [options]

Options:
  --agent <name>     Run a specific agent only (can repeat)
  --all              Run all agents (even completed stages)
  --sequential       Run agents one by one instead of in parallel
  --scan             Only scan project state, don't run agents
  --save             Save results to a JSON file
  --output <path>    Path for saved results (implies --save)
  --help             Show this help

Available agents:
  OrchestratorAgent
  ArchitectAgent
  DesignSystemAgent
  BackendAgent
  WebAgent
  QAAuditAgent

Examples:
  npx tsx scripts/agents/run.ts
  npx tsx scripts/agents/run.ts --agent QAAuditAgent
  npx tsx scripts/agents/run.ts --agent BackendAgent --agent WebAgent
  npx tsx scripts/agents/run.ts --all --sequential --save
  npx tsx scripts/agents/run.ts --scan
`);
  process.exit(0);
}

// ─── Scan only ────────────────────────────────────────────────────────────────

if (hasFlag("--scan")) {
  const state = scanProjectState();
  console.log("\n📋 Project State:\n");
  state.stages.forEach((s) => {
    const icon =
      s.status === "DONE" ? "✅" : s.status === "PARTIAL" ? "⚠️ " : "❌";
    console.log(`  ${icon} ${s.name}: ${s.status}`);
    if (s.evidence) console.log(`      Evidence: ${s.evidence}`);
  });
  console.log(`\n  Release: ${state.currentRelease}`);
  process.exit(0);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "❌ ANTHROPIC_API_KEY is not set.\n" +
        "   Set it with: export ANTHROPIC_API_KEY=sk-ant-..."
    );
    process.exit(1);
  }

  // Collect --agent flags
  const forceAgents: AgentName[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--agent" && args[i + 1]) {
      forceAgents.push(args[i + 1] as AgentName);
    }
  }

  const skipDone = !hasFlag("--all");
  const parallel = !hasFlag("--sequential");
  const shouldSave = hasFlag("--save") || !!getFlag("--output");
  const outputPath = getFlag("--output");

  console.log("🤖 ControlMe Agent Orchestrator");
  console.log(`   Model: ${process.env.ANTHROPIC_MODEL ?? "claude-opus-4-6"}`);
  console.log(`   Mode: ${parallel ? "parallel" : "sequential"}`);
  if (forceAgents.length > 0) {
    console.log(`   Agents: ${forceAgents.join(", ")}`);
  } else {
    console.log(`   Skip done: ${skipDone}`);
  }

  const results = await orchestrate({
    forceAgents: forceAgents.length > 0 ? forceAgents : undefined,
    skipDone,
    parallel,
  });

  if (results.length > 0) {
    printResults(results);

    if (shouldSave) {
      saveResults(results, outputPath);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
