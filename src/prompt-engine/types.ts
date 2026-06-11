export type Industry =
  | "agriculture"
  | "banking"
  | "telecom"
  | "healthcare"
  | "education"
  | "restaurant"
  | "custom";

export type ToneStyle =
  | "casual-expert"
  | "formal-secure"
  | "empathetic-direct"
  | "friendly-local"
  | "professional-concise";

export type ProblemHandlingMode =
  | "diagnostic-probe"
  | "direct-remediation"
  | "escalation"
  | "educational-explanation";

export type ResponseChannel = "voice" | "text" | "chat" | "call-center";

export type MissingDataBehavior =
  | "ask-follow-up"
  | "say-not-available"
  | "escalate"
  | "provide-general-guidance-only";

export interface PromptConfiguration {
  meta: {
    configName: string;
    industry: Industry;
    assistantName?: string;
    assistantPersona?: string;
    targetLanguage: string;
    responseChannel: ResponseChannel;
    domainDescription: string;
    useCaseDescription?: string;
  };

  behavioralOptions: {
    toneStyle: ToneStyle;
    lengthConstraint: {
      unit: "sentences" | "words" | "steps";
      defaultValue: number;
      maxElaborationValue: number;
      allowUserRequestedElaboration: boolean;
    };
    greetingPolicy: {
      initialGreetingsAllowed: string[];
      midConversationAcks: string[];
      allowInitialGreetingOnlyOnce: boolean;
      allowRepetition: boolean;
      requireLocalRespectWords: boolean;
    };
    problemHandlingMode: ProblemHandlingMode;
    answerStyle: {
      useBulletPoints: boolean;
      useMarkdown: boolean;
      askFollowUpWhenNeeded: boolean;
      preferSimpleLanguage: boolean;
      avoidTechnicalJargon: boolean;
    };
    personalization?: {
      userPersona?: string;
      assistantPersona?: string;
    };
    customInstructionBlocks?: string[];
  };

  dataMapping: {
    requiredStructuredKeys: string[];
    optionalStructuredKeys: string[];
    fallbackTextTemplate: string;
    missingDataBehavior: MissingDataBehavior;
  };

  safetyRules: {
    preventHallucination: boolean;
    blockFinancialGuessing: boolean;
    blockMedicalDiagnosis: boolean;
    blockLegalClaims: boolean;
    requireSourceGrounding: boolean;
    blockPIICollection?: boolean;
    restrictToDomain?: boolean;
    neverRepeatSensitiveData?: boolean;
    escalationMessage?: string;
  };

  ragOptions: {
    enabled: boolean;
    maxSnippets: number;
    includeSourceName: boolean;
    includeConfidenceScore: boolean;
  };
}

export interface ConversationLogEntry {
  timestamp: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export interface RagDocument {
  sourceName?: string;
  content: string;
  confidenceScore?: number;
}

export interface RuntimePromptInput {
  currentUserMessage: string;
  conversationLogs: ConversationLogEntry[];
  databasePayload: Record<string, unknown>;
  ragDocuments: RagDocument[];
  requestMetadata?: {
    userId?: string;
    sessionId?: string;
    locale?: string;
    channel?: string;
    timestamp?: string;
  };
}
