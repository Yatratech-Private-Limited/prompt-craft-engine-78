import type { PromptConfiguration } from "./types";
import { escapeXml, buildMissingDataInstruction } from "./helpers";

const toneDescriptions: Record<string, string> = {
  "casual-expert": "Use a friendly, knowledgeable voice that feels approachable and confident.",
  "formal-secure": "Use a formal, careful tone with strong attention to compliance, security, and accuracy.",
  "empathetic-direct": "Use a supportive, simple, direct tone that is clear and caring.",
  "friendly-local": "Use a warm, locally grounded tone that feels familiar and respectful.",
  "professional-concise": "Use a professional and concise tone that communicates clearly with minimal extra language.",
};

const problemHandlingInstructions: Record<string, string> = {
  "diagnostic-probe":
    "If the user problem is not fully specified, ask one short clarifying question before offering a final recommendation.",
  "direct-remediation":
    "Use the available context to provide the most likely solution directly and clearly, without unnecessary exploration.",
  escalation:
    "Do not guess when context is missing. Escalate to support or ask the user to provide verified details before answering.",
  "educational-explanation":
    "Explain the concept clearly and simply, focusing on understanding rather than immediate step-by-step remediation.",
};

function pluralizeUnit(unit: "sentences" | "words" | "steps", value: number) {
  if (unit === "steps") {
    return `${value} ${unit}`;
  }
  return `${value} ${value === 1 ? unit.slice(0, -1) : unit}`;
}

export function compileUnstructuredBehavioralPrompt(config: PromptConfiguration): string {
  const { meta, behavioralOptions, dataMapping, safetyRules, ragOptions } = config;
  const toneRule = toneDescriptions[behavioralOptions.toneStyle];
  const greetingExamples = behavioralOptions.greetingPolicy.initialGreetingsAllowed.join(", ");
  const midAcks = behavioralOptions.greetingPolicy.midConversationAcks.join(", ");
  const missingDataInstruction = buildMissingDataInstruction(config);

  const personalizationRules = [
    behavioralOptions.personalization?.userPersona
      ? `User persona: ${escapeXml(behavioralOptions.personalization.userPersona)}.`
      : undefined,
    behavioralOptions.personalization?.assistantPersona
      ? `Assistant persona: ${escapeXml(behavioralOptions.personalization.assistantPersona)}.`
      : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  const channelInstructions =
    meta.responseChannel === "voice"
      ? "Prefer short, natural spoken answers appropriate for a voice conversation. Keep phrasing conversational and easy to say aloud."
      : "Respond in a concise written style appropriate for the selected text or chat channel.";

  const detailText = behavioralOptions.lengthConstraint.allowUserRequestedElaboration
    ? `If the user explicitly requests more detail, allow up to ${pluralizeUnit(
        behavioralOptions.lengthConstraint.unit,
        behavioralOptions.lengthConstraint.maxElaborationValue
      )}.`
    : "Do not elaborate beyond the default limit unless strictly required.";

  const bulletMode = behavioralOptions.answerStyle.useBulletPoints
    ? "When it is helpful, use short bullet points for clarity."
    : "Prefer full sentences unless the channel or user request clearly favors a list.";

  const markdownRule = behavioralOptions.answerStyle.useMarkdown
    ? "You may format the response using simple Markdown where appropriate."
    : "Do not use Markdown formatting in responses.";

  const answerStyleRules = [
    bulletMode,
    markdownRule,
    behavioralOptions.answerStyle.askFollowUpWhenNeeded
      ? "Ask a clarifying question only when the user request is incomplete or the answer would otherwise be unsafe."
      : "Avoid asking follow-up questions unless they are needed for safety or accuracy.",
    behavioralOptions.answerStyle.preferSimpleLanguage ? "Prefer simple, plain language." : undefined,
    behavioralOptions.answerStyle.avoidTechnicalJargon ? "Avoid technical jargon unless the user explicitly asks for it." : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  const ragHousekeeping = ragOptions.enabled
    ? "If RAG context is available, ground your answer explicitly in the retrieved data and mention the source references only when needed for accuracy."
    : "Do not expect external knowledge snippets beyond the provided context. Use only available structured and conversational context.";

  const safetyLines: string[] = [];
  if (safetyRules.preventHallucination) {
    safetyLines.push("Never hallucinate details or invent facts.");
  }
  if (safetyRules.blockFinancialGuessing) {
    safetyLines.push("Never guess financial information such as balances or transaction histories.");
  }
  if (safetyRules.blockMedicalDiagnosis) {
    safetyLines.push("Never provide a medical diagnosis or medical certainty.");
  }
  if (safetyRules.blockLegalClaims) {
    safetyLines.push("Never make legal claims or offer legal certainty.");
  }
  if (safetyRules.requireSourceGrounding) {
    safetyLines.push("Always ground your response in available data and cite that it comes from the provided context.");
  }
  if (safetyRules.blockPIICollection) {
    safetyLines.push("Never ask the user for passwords, PINs, full card numbers, national ID numbers, or any other sensitive personal credentials.");
  }
  if (safetyRules.neverRepeatSensitiveData) {
    safetyLines.push("Never repeat, echo, or display sensitive data (account numbers, card numbers, passwords) back to the user in any response.");
  }
  if (safetyRules.restrictToDomain) {
    safetyLines.push(`Only answer questions relevant to the ${escapeXml(meta.domainDescription || meta.industry)} domain. Politely decline unrelated queries.`);
  }
  if (safetyRules.escalationMessage) {
    safetyLines.push(safetyRules.escalationMessage);
  }

  const safetySection = safetyLines.length > 0 ? safetyLines.join(" ") : "Follow safety best practices for this domain.";

  const behaviorPrompt = [
    `# Assistant Identity`,
    `You are an AI assistant for the ${escapeXml(meta.industry)} industry.`,
    `You must respond in ${escapeXml(meta.targetLanguage)}.`,
    `You are optimized for ${escapeXml(meta.responseChannel)} conversations.`,
    `Domain context: ${escapeXml(meta.domainDescription)}.`,
    "",
    `# Tone Rules`,
    toneRule,
    channelInstructions,
    "",
    `# Greeting Rules`,
    `The first assistant response may begin with one of these greetings: ${greetingExamples}.`,
    `During the same conversation, use only short acknowledgements: ${midAcks}.`,
    behavioralOptions.greetingPolicy.allowInitialGreetingOnlyOnce
      ? "Do not repeat the full greeting after the first turn."
      : "Avoid repeating the same greeting unnecessarily.",
    behavioralOptions.greetingPolicy.requireLocalRespectWords
      ? "When greeting, include local respectful words where appropriate."
      : undefined,
    "",
    `# Length Control`,
    `Default response length: maximum ${pluralizeUnit(
      behavioralOptions.lengthConstraint.unit,
      behavioralOptions.lengthConstraint.defaultValue
    )}.`,
    detailText,
    `Never exceed these limits.`,
    "",
    `# Problem Handling`,
    problemHandlingInstructions[behavioralOptions.problemHandlingMode],
    `If required fields such as ${dataMapping.requiredStructuredKeys.join(", ")} are missing, follow the missing data rules below.`,
    "",
    `# Answer Style`,
    answerStyleRules,
    ragHousekeeping,
    "",
    personalizationRules ? `# Personalization
${personalizationRules}` : undefined,
    behavioralOptions.customInstructionBlocks?.length
      ? `# Custom Instructions
${behavioralOptions.customInstructionBlocks.join("\n")}`
      : undefined,
    "",
    `# Missing Data Rules`,
    `Do not invent missing database values.`,
    `Do not claim access to data not present in the context.`,
    missingDataInstruction,
    "",
    `# Safety Rules`,
    safetySection,
    "",
    `# Structured Data Requirements`,
    `Required structured keys: ${dataMapping.requiredStructuredKeys.join(", ")}.`,
    `Optional structured keys: ${dataMapping.optionalStructuredKeys.join(", ") || "none"}.`,
    "",
    "Be precise, safe, and user-focused."
  ]
    .filter(Boolean)
    .join("\n");

  return behaviorPrompt;
}
