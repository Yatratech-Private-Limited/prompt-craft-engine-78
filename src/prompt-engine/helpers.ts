import type {
  PromptConfiguration,
  ConversationLogEntry,
  RagDocument,
  RuntimePromptInput,
} from "./types";

const XML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

export function escapeXml(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const raw = String(value);
  return raw.replace(/[&<>"']/g, (char) => XML_ESCAPE_MAP[char] ?? char);
}

export function formatDatabasePayload(payload: Record<string, unknown>): string {
  const entries = Object.entries(payload || {});

  if (entries.length === 0) {
    return "Database payload: none provided.";
  }

  const formatted = entries
    .map(([key, value]) => {
      const safeValue = escapeXml(value);
      const displayValue =
        typeof value === "object" && value !== null
          ? JSON.stringify(value, null, 2)
          : safeValue;
      return `- ${key}: ${displayValue}`;
    })
    .join("\n");

  return [`Database payload:`, formatted].join("\n");
}

export function formatConversationLogs(logs: ConversationLogEntry[]): string {
  if (!Array.isArray(logs) || logs.length === 0) {
    return "Conversation history: none.";
  }

  return logs
    .map((entry) => {
      const safeContent = escapeXml(entry.content);
      const prefix = `[${entry.timestamp}] ${entry.role}:`;
      return `${prefix} ${safeContent}`;
    })
    .join("\n");
}

export function formatRagDocuments(
  docs: RagDocument[],
  options?: { maxSnippets?: number }
): string {
  const limit = options?.maxSnippets ?? docs.length;

  if (!Array.isArray(docs) || docs.length === 0) {
    return "RAG context: none.";
  }

  const snippets = docs.slice(0, limit).map((doc, index) => {
    const source = doc.sourceName ? `Source: ${escapeXml(doc.sourceName)}; ` : "";
    const confidence = doc.confidenceScore
      ? `Confidence: ${escapeXml(doc.confidenceScore)}; `
      : "";
    const content = escapeXml(doc.content);

    return [`Snippet ${index + 1}:`, `${source}${confidence}Content: ${content}`].join(" ");
  });

  return [`RAG context:`, ...snippets].join("\n");
}

export function validateRequiredKeys(
  config: PromptConfiguration,
  payload: Record<string, unknown>
): string[] {
  const missingKeys = config.dataMapping.requiredStructuredKeys.filter(
    (key) => {
      const value = payload[key];
      return value === null || value === undefined || value === "";
    }
  );

  return missingKeys;
}

export function buildMissingDataInstruction(
  config: PromptConfiguration,
  missingKeys?: string[]
): string {
  const fallback = config.dataMapping.fallbackTextTemplate;
  const behavior = config.dataMapping.missingDataBehavior;

  if (!missingKeys) {
    const behaviorInstruction =
      behavior === "ask-follow-up"
        ? "If required structured data is missing, ask a short clarifying question to collect the missing information."
        : behavior === "say-not-available"
        ? "If required structured data is missing, explain that the requested detail is unavailable and use the fallback message."
        : behavior === "escalate"
        ? "If required structured data is missing, do not guess. Escalate or advise the user to reach support."
        : "If required structured data is missing, provide general guidance only without inventing values.";

    return [
      behaviorInstruction,
      `Fallback response text: ${fallback}`,
    ].join(" ");
  }

  if (missingKeys.length === 0) {
    return "All required structured keys are present.";
  }

  const missingList = missingKeys.join(", ");
  const behaviorInstruction =
    behavior === "ask-follow-up"
      ? `Ask a short clarifying question to collect the missing information: ${missingList}.`
      : behavior === "say-not-available"
      ? `Explain that the requested detail is unavailable and use the fallback message.`
      : behavior === "escalate"
      ? `Do not guess. Escalate or advise the user to reach support when required fields are missing.`
      : `Provide general guidance only without inventing values.`;

  return [
    `Missing structured data detected: ${missingList}.`,
    behaviorInstruction,
    `Fallback response text: ${fallback}`,
  ].join(" ");
}
