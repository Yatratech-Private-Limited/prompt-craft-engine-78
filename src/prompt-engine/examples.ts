import { agricultureVoiceBotConfig, retailBankingBotConfig } from "./configs";
import { compileStructuredDataPromptWithConfig } from "./structuredCompiler";
import { compileUnstructuredBehavioralPrompt } from "./behavioralCompiler";

const agricultureBehavioralPrompt = compileUnstructuredBehavioralPrompt(agricultureVoiceBotConfig);
const retailBehavioralPrompt = compileUnstructuredBehavioralPrompt(retailBankingBotConfig);

const agricultureRuntimePrompt = compileStructuredDataPromptWithConfig(
  {
    currentUserMessage: "My maize leaves have yellow spots and the field is near the river.",
    conversationLogs: [
      {
        timestamp: "2026-06-11T09:17:00Z",
        role: "user",
        content: "My maize leaves have yellow spots and the field is near the river.",
      },
      {
        timestamp: "2026-06-11T09:17:14Z",
        role: "assistant",
        content: "Namaste Hajur, could you tell me your crop type and exact location?",
      },
    ],
    databasePayload: {
      crop_type: "maize",
      location: "Rupandehi district",
      problem_description: "yellow spots on leaves",
      growth_stage: "tasseling",
    },
    ragDocuments: [
      {
        sourceName: "CropHealthDB",
        content: "Yellow spots on maize leaves at tasseling are often caused by nutrient deficiency or leaf blight.",
        confidenceScore: 0.92,
      },
    ],
    requestMetadata: {
      userId: "farmer-123",
      sessionId: "session-789",
      locale: "ne-NP",
      channel: "voice",
      timestamp: "2026-06-11T09:17:35Z",
    },
  },
  agricultureVoiceBotConfig
);

const bankingRuntimePrompt = compileStructuredDataPromptWithConfig(
  {
    currentUserMessage: "Why is my debit card blocked?",
    conversationLogs: [
      {
        timestamp: "2026-06-11T10:02:00Z",
        role: "user",
        content: "Why is my debit card blocked?",
      },
      {
        timestamp: "2026-06-11T10:02:22Z",
        role: "assistant",
        content: "Hello. I need your authentication status and account status to help you securely.",
      },
    ],
    databasePayload: {
      customer_id: "CUST-5874",
      auth_status: "verified",
      account_status: "active",
      account_type: "checking",
      recent_activity_summary: "Multiple failed PIN attempts detected.",
    },
    ragDocuments: [
      {
        sourceName: "BankPolicyGuide",
        content: "Debit cards may be blocked after repeated authentication failures or suspicious activity.",
        confidenceScore: 0.98,
      },
    ],
    requestMetadata: {
      userId: "customer-5874",
      sessionId: "session-982",
      locale: "en-US",
      channel: "text",
      timestamp: "2026-06-11T10:02:40Z",
    },
  },
  retailBankingBotConfig
);

export {
  agricultureBehavioralPrompt,
  retailBehavioralPrompt,
  agricultureRuntimePrompt,
  bankingRuntimePrompt,
};
