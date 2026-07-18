/**
 * Source-bound Finance Debrief AI adapter.
 * Live model credentials are owner-configured (Edge secret / server). Until then,
 * generations are queued in `debrief_ai_generation_logs` with status `queued`.
 */

export type DebriefAiAdapterStatus = "unconfigured" | "ready";

export interface QueueDebriefAiInput {
  prompt: string;
  sourceIds: string[];
  articleId?: string;
  model?: string;
}

export interface QueueDebriefAiResult {
  status: DebriefAiAdapterStatus;
  promptHash: string;
  message: string;
}

function hashPrompt(prompt: string): string {
  let h = 0;
  for (let i = 0; i < prompt.length; i++) {
    h = (Math.imul(31, h) + prompt.charCodeAt(i)) | 0;
  }
  return `p${(h >>> 0).toString(16)}`;
}

export function getDebriefAiAdapterStatus(): DebriefAiAdapterStatus {
  // Browser must never hold model API keys. Live completion happens server-side when configured.
  return "unconfigured";
}

export function prepareDebriefAiQueue(input: QueueDebriefAiInput): QueueDebriefAiResult {
  if (!input.sourceIds.length) {
    throw new Error("AI generation requires at least one approved source id");
  }
  if (!input.prompt.trim()) {
    throw new Error("AI generation requires a prompt");
  }

  const status = getDebriefAiAdapterStatus();
  return {
    status,
    promptHash: hashPrompt(input.prompt.trim()),
    message:
      status === "unconfigured"
        ? "Queued for server processing. Live model completion runs when the Debrief AI service is configured."
        : "Queued for generation",
  };
}
