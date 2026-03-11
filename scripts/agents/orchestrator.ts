import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import {
  AgentName,
  AgentResult,
  AgentTask,
  AGENT_SYSTEM_PROMPTS,
  OrchestratorState,
  ProjectStage,
  StageStatus,
} from "./types";

const ROOT = path.resolve(__dirname, "../..");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-6";

// ─── Project state scanner ────────────────────────────────────────────────────

function exists(...segments: string[]): boolean {
  return fs.existsSync(path.join(ROOT, ...segments));
}

export function scanProjectState(): OrchestratorState {
  const stages: ProjectStage[] = [
    {
      name: "Architecture",
      status: exists("AGENTS.md") ? "DONE" : "PENDING",
      agent: "ArchitectAgent",
      evidence: "AGENTS.md present",
    },
    {
      name: "DesignSystem",
      status: exists("packages", "shared") ? "DONE" : "PENDING",
      agent: "DesignSystemAgent",
      evidence: "packages/shared/ exists",
    },
    {
      name: "Backend",
      status: exists("apps", "backend", "src", "main.ts") ? "DONE" : "PENDING",
      agent: "BackendAgent",
      evidence: "apps/backend/src/main.ts exists",
    },
    {
      name: "Web",
      status: exists("app", "dashboard") ? "DONE" : "PENDING",
      agent: "WebAgent",
      evidence: "app/dashboard/ exists",
    },
    {
      name: "QA",
      status: exists("QA_AUDIT_REPORT.md") ? "PARTIAL" : "PENDING",
      agent: "QAAuditAgent",
      evidence: "QA_AUDIT_REPORT.md present",
    },
  ];

  return {
    stages,
    completedAgents: stages
      .filter((s) => s.status === "DONE")
      .map((s) => s.agent),
    currentRelease: "MVP",
  };
}

// ─── Single agent runner ──────────────────────────────────────────────────────

export async function runAgent(task: AgentTask): Promise<AgentResult> {
  const start = Date.now();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: AGENT_SYSTEM_PROMPTS[task.agent],
      messages: [
        {
          role: "user",
          content: task.context
            ? `${task.task}\n\n---\nContext:\n${task.context}`
            : task.task,
        },
      ],
    });

    const output =
      response.content[0].type === "text" ? response.content[0].text : "";

    return {
      agent: task.agent,
      task: task.task,
      output,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      agent: task.agent,
      task: task.task,
      output: "",
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─── Parallel runner ──────────────────────────────────────────────────────────

export async function runAgentsInParallel(
  tasks: AgentTask[]
): Promise<AgentResult[]> {
  console.log(`\n⚡ Running ${tasks.length} agents in parallel...\n`);

  tasks.forEach((t, i) => {
    console.log(`  [${i + 1}] ${t.agent}: ${t.task.slice(0, 60)}...`);
  });

  console.log("");

  const results = await Promise.all(tasks.map(runAgent));

  results.forEach((r) => {
    const status = r.error ? "❌ FAILED" : "✅ DONE";
    const duration = (r.durationMs / 1000).toFixed(1);
    console.log(`  ${status} ${r.agent} (${duration}s)`);
    if (r.error) console.log(`     Error: ${r.error}`);
  });

  return results;
}

// ─── Sequential runner (when order matters) ───────────────────────────────────

export async function runAgentsSequentially(
  tasks: AgentTask[]
): Promise<AgentResult[]> {
  const results: AgentResult[] = [];

  for (const task of tasks) {
    console.log(`\n▶ Running ${task.agent}...`);
    const result = await runAgent(task);
    const status = result.error ? "❌ FAILED" : "✅ DONE";
    const duration = (result.durationMs / 1000).toFixed(1);
    console.log(`  ${status} (${duration}s)`);
    results.push(result);
  }

  return results;
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export async function orchestrate(options: {
  forceAgents?: AgentName[];
  skipDone?: boolean;
  parallel?: boolean;
}): Promise<AgentResult[]> {
  const { forceAgents, skipDone = true, parallel = true } = options;

  const state = scanProjectState();

  console.log("\n📋 Project State Scan:");
  state.stages.forEach((s) => {
    const icon =
      s.status === "DONE" ? "✅" : s.status === "PARTIAL" ? "⚠️ " : "❌";
    console.log(`  ${icon} ${s.name}: ${s.status}`);
  });

  let tasks: AgentTask[];

  if (forceAgents) {
    // Run only the specified agents
    tasks = forceAgents.map((agent) => ({
      agent,
      task: getDefaultTask(agent, state),
    }));
  } else {
    // Build tasks for pending/partial stages only
    const pendingStages = state.stages.filter(
      (s) => !skipDone || s.status !== "DONE"
    );

    tasks = pendingStages.map((stage) => ({
      agent: stage.agent,
      task: getDefaultTask(stage.agent, state),
    }));
  }

  if (tasks.length === 0) {
    console.log("\n🎉 All stages are DONE. Nothing to run.");
    return [];
  }

  return parallel
    ? runAgentsInParallel(tasks)
    : runAgentsSequentially(tasks);
}

function getDefaultTask(agent: AgentName, state: OrchestratorState): string {
  const stageNames = state.stages.map((s) => `${s.name}: ${s.status}`).join(", ");
  const context = `Project stages: ${stageNames}. Release: ${state.currentRelease}.`;

  const tasks: Record<AgentName, string> = {
    OrchestratorAgent: `${context}\nScan project state and output the next priority tasks for each agent.`,
    ArchitectAgent: `${context}\nReview current architecture and identify any gaps or improvements needed.`,
    DesignSystemAgent: `${context}\nAudit design tokens and components. Report anything missing or inconsistent.`,
    BackendAgent: `${context}\nReview the NestJS backend. Check for missing endpoints, error handling, or security issues.`,
    WebAgent: `${context}\nReview Next.js pages. Check for missing pages, broken API integration, or UX issues.`,
    QAAuditAgent: `${context}\nPerform a full QA audit of the codebase. List all issues by severity.`,
  };

  return tasks[agent];
}

// ─── Result reporter ──────────────────────────────────────────────────────────

export function printResults(results: AgentResult[]): void {
  console.log("\n" + "=".repeat(60));
  console.log("AGENT RESULTS");
  console.log("=".repeat(60) + "\n");

  for (const result of results) {
    console.log(`## ${result.agent}`);
    console.log(`Task: ${result.task.slice(0, 80)}...`);
    console.log(`Duration: ${(result.durationMs / 1000).toFixed(1)}s`);

    if (result.error) {
      console.log(`Error: ${result.error}`);
    } else {
      console.log("\nOutput:");
      console.log(result.output);
    }

    console.log("\n" + "-".repeat(40) + "\n");
  }
}

export function saveResults(results: AgentResult[], outputPath?: string): void {
  const filePath =
    outputPath ??
    path.join(ROOT, `agent-results-${Date.now()}.json`);

  fs.writeFileSync(filePath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`\n💾 Results saved to: ${filePath}`);
}
