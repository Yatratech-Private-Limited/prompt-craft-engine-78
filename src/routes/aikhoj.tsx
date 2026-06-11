import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Wheat,
  Landmark,
  Wifi,
  Heart,
  GraduationCap,
  UtensilsCrossed,
  Wand2,
  Mic,
  MessageSquare,
  MessagesSquare,
  Phone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { compileUnstructuredBehavioralPrompt } from "@/prompt-engine/behavioralCompiler";
import { compileStructuredDataPromptWithConfig } from "@/prompt-engine/structuredCompiler";
import type {
  PromptConfiguration,
  Industry,
  ToneStyle,
  ResponseChannel,
  MissingDataBehavior,
  ProblemHandlingMode,
} from "@/prompt-engine/types";

export const Route = createFileRoute("/aikhoj")({
  head: () => ({
    meta: [
      { title: "AIKhoj - Prompt Engine" },
      { name: "description", content: "Build a production-ready AI assistant prompt in minutes." },
    ],
  }),
  component: AIKhojPage,
});

// ─── Rule-based industry defaults ────────────────────────────────────────────

type IndustryDefaults = {
  toneStyle: ToneStyle;
  problemHandling: ProblemHandlingMode;
  preferSimple: boolean;
  avoidJargon: boolean;
  preventHallucination: boolean;
  blockFinancial: boolean;
  blockMedicalDiagnosis: boolean;
  blockLegalClaims: boolean;
  blockPIICollection: boolean;
  restrictToDomain: boolean;
  neverRepeatSensitiveData: boolean;
  requireGrounding: boolean;
  ragEnabled: boolean;
  domainDescription: string;
  useCaseDescription: string;
  missingDataBehavior: MissingDataBehavior;
};

const INDUSTRY_DEFAULTS: Record<Industry, IndustryDefaults> = {
  agriculture: {
    toneStyle: "friendly-local",
    problemHandling: "diagnostic-probe",
    preferSimple: true,
    avoidJargon: true,
    preventHallucination: true,
    blockFinancial: false,
    blockMedicalDiagnosis: false,
    blockLegalClaims: false,
    blockPIICollection: false,
    restrictToDomain: false,
    neverRepeatSensitiveData: false,
    requireGrounding: true,
    ragEnabled: true,
    domainDescription: "Agricultural advisory and crop management assistant",
    useCaseDescription: "Help farmers with crop advice, weather, and market information",
    missingDataBehavior: "ask-follow-up",
  },
  banking: {
    toneStyle: "formal-secure",
    problemHandling: "escalation",
    preferSimple: false,
    avoidJargon: false,
    preventHallucination: true,
    blockFinancial: true,
    blockMedicalDiagnosis: false,
    blockLegalClaims: true,
    blockPIICollection: true,
    restrictToDomain: true,
    neverRepeatSensitiveData: true,
    requireGrounding: true,
    ragEnabled: true,
    domainDescription: "Banking and financial services customer assistant",
    useCaseDescription: "Help customers with account inquiries and banking services",
    missingDataBehavior: "escalate",
  },
  telecom: {
    toneStyle: "professional-concise",
    problemHandling: "direct-remediation",
    preferSimple: true,
    avoidJargon: false,
    preventHallucination: true,
    blockFinancial: false,
    blockMedicalDiagnosis: false,
    blockLegalClaims: false,
    blockPIICollection: true,
    restrictToDomain: true,
    neverRepeatSensitiveData: true,
    requireGrounding: true,
    ragEnabled: true,
    domainDescription: "Telecom customer support and technical assistance",
    useCaseDescription: "Help customers with connectivity issues and service inquiries",
    missingDataBehavior: "ask-follow-up",
  },
  healthcare: {
    toneStyle: "empathetic-direct",
    problemHandling: "escalation",
    preferSimple: true,
    avoidJargon: true,
    preventHallucination: true,
    blockFinancial: false,
    blockMedicalDiagnosis: true,
    blockLegalClaims: false,
    blockPIICollection: true,
    restrictToDomain: false,
    neverRepeatSensitiveData: true,
    requireGrounding: true,
    ragEnabled: true,
    domainDescription: "Healthcare information and appointment scheduling assistant",
    useCaseDescription: "Help patients with health information and appointment scheduling",
    missingDataBehavior: "escalate",
  },
  education: {
    toneStyle: "casual-expert",
    problemHandling: "educational-explanation",
    preferSimple: true,
    avoidJargon: true,
    preventHallucination: true,
    blockFinancial: false,
    blockMedicalDiagnosis: false,
    blockLegalClaims: false,
    blockPIICollection: false,
    restrictToDomain: false,
    neverRepeatSensitiveData: false,
    requireGrounding: false,
    ragEnabled: true,
    domainDescription: "Educational support and learning assistant",
    useCaseDescription: "Help students understand concepts and answer academic questions",
    missingDataBehavior: "provide-general-guidance-only",
  },
  restaurant: {
    toneStyle: "friendly-local",
    problemHandling: "direct-remediation",
    preferSimple: true,
    avoidJargon: true,
    preventHallucination: false,
    blockFinancial: false,
    blockMedicalDiagnosis: false,
    blockLegalClaims: false,
    blockPIICollection: false,
    restrictToDomain: true,
    neverRepeatSensitiveData: false,
    requireGrounding: false,
    ragEnabled: false,
    domainDescription: "Restaurant menu, ordering, and dining experience assistant",
    useCaseDescription: "Help customers explore the menu and place orders",
    missingDataBehavior: "say-not-available",
  },
  custom: {
    toneStyle: "professional-concise",
    problemHandling: "diagnostic-probe",
    preferSimple: true,
    avoidJargon: true,
    preventHallucination: true,
    blockFinancial: false,
    blockMedicalDiagnosis: false,
    blockLegalClaims: false,
    blockPIICollection: false,
    restrictToDomain: false,
    neverRepeatSensitiveData: false,
    requireGrounding: false,
    ragEnabled: false,
    domainDescription: "",
    useCaseDescription: "",
    missingDataBehavior: "ask-follow-up",
  },
};

// ─── Option metadata ──────────────────────────────────────────────────────────

const INDUSTRY_META: Record<Industry, { icon: React.ReactNode; label: string; desc: string }> = {
  agriculture: { icon: <Wheat className="h-5 w-5" />, label: "Agriculture", desc: "Farming & crops" },
  banking:     { icon: <Landmark className="h-5 w-5" />, label: "Banking", desc: "Finance & accounts" },
  telecom:     { icon: <Wifi className="h-5 w-5" />, label: "Telecom", desc: "Connectivity & support" },
  healthcare:  { icon: <Heart className="h-5 w-5" />, label: "Healthcare", desc: "Health & appointments" },
  education:   { icon: <GraduationCap className="h-5 w-5" />, label: "Education", desc: "Learning & courses" },
  restaurant:  { icon: <UtensilsCrossed className="h-5 w-5" />, label: "Restaurant", desc: "Menu & orders" },
  custom:      { icon: <Wand2 className="h-5 w-5" />, label: "Custom", desc: "Build your own" },
};

const TONE_META: Record<ToneStyle, { label: string; desc: string }> = {
  "casual-expert":        { label: "Friendly Expert",   desc: "Approachable & knowledgeable" },
  "formal-secure":        { label: "Formal & Secure",   desc: "Professional with compliance" },
  "empathetic-direct":    { label: "Caring & Clear",    desc: "Supportive and direct" },
  "friendly-local":       { label: "Warm & Local",      desc: "Familiar and respectful" },
  "professional-concise": { label: "Sharp & Efficient", desc: "Direct, no filler" },
};

const CHANNEL_META: Record<ResponseChannel, { icon: React.ReactNode; label: string }> = {
  "voice":       { icon: <Mic className="h-3.5 w-3.5" />,            label: "Voice" },
  "text":        { icon: <MessageSquare className="h-3.5 w-3.5" />,  label: "Text" },
  "chat":        { icon: <MessagesSquare className="h-3.5 w-3.5" />, label: "Chat" },
  "call-center": { icon: <Phone className="h-3.5 w-3.5" />,          label: "Call Center" },
};

const PROBLEM_META: Record<ProblemHandlingMode, { label: string; desc: string }> = {
  "diagnostic-probe":       { label: "Ask First",       desc: "Clarify before answering" },
  "direct-remediation":     { label: "Solve Directly",  desc: "Best-guess solution" },
  "escalation":             { label: "Escalate",         desc: "Forward to support" },
  "educational-explanation":{ label: "Explain It",      desc: "Teach the concept" },
};

const MISSING_DATA_META: Record<MissingDataBehavior, { label: string }> = {
  "ask-follow-up":                { label: "Ask follow-up" },
  "say-not-available":            { label: "Say not available" },
  "escalate":                     { label: "Escalate" },
  "provide-general-guidance-only":{ label: "Give general guidance" },
};

// ─── Form state ───────────────────────────────────────────────────────────────

type FormState = {
  configName: string;
  industry: Industry;
  customIndustryName: string;
  assistantName: string;
  assistantPersona: string;
  targetLanguage: string;
  responseChannel: ResponseChannel;
  domainDescription: string;
  useCaseDescription: string;
  toneStyle: ToneStyle;
  defaultSentences: number;
  maxSentences: number;
  greetings: string;
  midAcks: string;
  problemHandling: ProblemHandlingMode;
  useBullets: boolean;
  preferSimple: boolean;
  avoidJargon: boolean;
  customInstructions: string;
  userPersona: string;
  requiredKeys: string;
  fallbackText: string;
  missingDataBehavior: MissingDataBehavior;
  preventHallucination: boolean;
  blockFinancial: boolean;
  blockMedicalDiagnosis: boolean;
  blockLegalClaims: boolean;
  blockPIICollection: boolean;
  restrictToDomain: boolean;
  neverRepeatSensitiveData: boolean;
  requireGrounding: boolean;
  ragEnabled: boolean;
};

function defaultFormForIndustry(industry: Industry): FormState {
  const d = INDUSTRY_DEFAULTS[industry];
  return {
    configName: `${INDUSTRY_META[industry].label} Assistant`,
    industry,
    customIndustryName: "",
    assistantName: "Assistant",
    assistantPersona: "A helpful and knowledgeable assistant",
    targetLanguage: "English",
    responseChannel: "text",
    greetings: "Hello, Hi there",
    midAcks: "Got it, Understood, Sure",
    userPersona: "A user seeking quick and accurate help",
    requiredKeys: "topic, context",
    fallbackText: "I don't have enough information to answer that question.",
    defaultSentences: 2,
    maxSentences: 5,
    customInstructions: "",
    useBullets: false,
    ...d,
  };
}

// ─── Config builder ───────────────────────────────────────────────────────────

function buildConfig(form: FormState): PromptConfiguration {
  return {
    meta: {
      configName: form.configName || "Custom Config",
      industry: form.industry,
      assistantName: form.assistantName || "Assistant",
      assistantPersona: form.assistantPersona,
      targetLanguage: form.targetLanguage || "English",
      responseChannel: form.responseChannel,
      domainDescription:
        form.industry === "custom" && form.customIndustryName
          ? form.domainDescription || `${form.customIndustryName} assistant`
          : form.domainDescription || "General assistant",
      useCaseDescription: form.useCaseDescription,
    },
    behavioralOptions: {
      toneStyle: form.toneStyle,
      lengthConstraint: {
        unit: "sentences",
        defaultValue: form.defaultSentences,
        maxElaborationValue: form.maxSentences,
        allowUserRequestedElaboration: true,
      },
      greetingPolicy: {
        initialGreetingsAllowed: form.greetings.split(",").map((g) => g.trim()).filter(Boolean),
        midConversationAcks: form.midAcks.split(",").map((m) => m.trim()).filter(Boolean),
        allowInitialGreetingOnlyOnce: true,
        allowRepetition: false,
        requireLocalRespectWords: false,
      },
      problemHandlingMode: form.problemHandling,
      answerStyle: {
        useBulletPoints: form.useBullets,
        useMarkdown: true,
        askFollowUpWhenNeeded: form.problemHandling === "diagnostic-probe",
        preferSimpleLanguage: form.preferSimple,
        avoidTechnicalJargon: form.avoidJargon,
      },
      personalization: {
        userPersona: form.userPersona,
        assistantPersona: form.assistantPersona,
      },
      customInstructionBlocks: form.customInstructions.split("\n").map((l) => l.trim()).filter(Boolean),
    },
    dataMapping: {
      requiredStructuredKeys: form.requiredKeys.split(",").map((k) => k.trim()).filter(Boolean),
      optionalStructuredKeys: [],
      fallbackTextTemplate: form.fallbackText || "Information not available.",
      missingDataBehavior: form.missingDataBehavior,
    },
    safetyRules: {
      preventHallucination: form.preventHallucination,
      blockFinancialGuessing: form.blockFinancial,
      blockMedicalDiagnosis: form.blockMedicalDiagnosis,
      blockLegalClaims: form.blockLegalClaims,
      blockPIICollection: form.blockPIICollection,
      restrictToDomain: form.restrictToDomain,
      neverRepeatSensitiveData: form.neverRepeatSensitiveData,
      requireSourceGrounding: form.requireGrounding,
    },
    ragOptions: {
      enabled: form.ragEnabled,
      maxSnippets: 5,
      includeSourceName: true,
      includeConfidenceScore: true,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AIKhojPage() {
  const [form, setForm] = useState<FormState>(() => defaultFormForIndustry("agriculture"));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState<"behavioral" | "structured" | null>(null);
  const [openedIn, setOpenedIn] = useState<"chatgpt" | "gemini" | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Industry change applies all rule-based defaults, preserving assistant name
  const pickIndustry = (industry: Industry) => {
    setForm((prev) => ({
      ...defaultFormForIndustry(industry),
      assistantName: prev.assistantName,
      customIndustryName: prev.customIndustryName,
      configName: industry === "custom" && prev.customIndustryName
        ? `${prev.customIndustryName} Assistant`
        : `${INDUSTRY_META[industry].label} Assistant`,
    }));
  };

  const config = useMemo(() => buildConfig(form), [form]);
  const behavioralPrompt = useMemo(() => compileUnstructuredBehavioralPrompt(config), [config]);
  const structuredPrompt = useMemo(
    () =>
      compileStructuredDataPromptWithConfig(
        { currentUserMessage: "Help me with this task", conversationLogs: [], databasePayload: {}, ragDocuments: [] },
        config,
      ),
    [config],
  );

  const copy = (text: string, id: "behavioral" | "structured") => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const openIn = async (site: "chatgpt" | "gemini") => {
    if (site === "gemini") {
      await navigator.clipboard.writeText(behavioralPrompt);
      window.open("https://gemini.google.com/app", "_blank", "noopener,noreferrer");
    } else {
      const encoded = encodeURIComponent(behavioralPrompt);
      window.open(`https://chatgpt.com/?q=${encoded}`, "_blank", "noopener,noreferrer");
    }
    setOpenedIn(site);
    setTimeout(() => setOpenedIn(null), 4000);
  };

  const industries = Object.keys(INDUSTRY_META) as Industry[];
  const tones = Object.keys(TONE_META) as ToneStyle[];
  const channels = Object.keys(CHANNEL_META) as ResponseChannel[];
  const problemModes = Object.keys(PROBLEM_META) as ProblemHandlingMode[];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">

        {/* ── LEFT: CONFIG ── */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h2 className="text-2xl font-bold text-slate-900">Build Your Assistant</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Pick an industry and we'll set the rules. Fine-tune anything below.
              </p>
            </div>
            <Link
              to="/"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
            >
              ← General
            </Link>
          </div>

          <div className="mt-8 space-y-8">

            {/* 1 — INDUSTRY */}
            <Step n={1} label="What industry is this for?">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {industries.map((ind) => {
                  const m = INDUSTRY_META[ind];
                  const active = form.industry === ind;
                  return (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => pickIndustry(ind)}
                      className={[
                        "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition",
                        active
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <span className={active ? "text-indigo-600" : "text-slate-400"}>{m.icon}</span>
                      <span className="text-xs font-semibold leading-tight">{m.label}</span>
                      <span className="text-[10px] text-slate-400 leading-tight hidden sm:block">{m.desc}</span>
                    </button>
                  );
                })}
              </div>
            </Step>

            {/* Custom industry name */}
            {form.industry === "custom" && (
              <div className="ml-10 -mt-4">
                <input
                  value={form.customIndustryName}
                  onChange={(e) => {
                    const name = e.target.value;
                    set("customIndustryName", name);
                    if (name) set("configName", `${name} Assistant`);
                  }}
                  placeholder="Enter your industry name (e.g. Real Estate)"
                  className="w-full rounded-lg border border-indigo-200 bg-indigo-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            )}

            {/* 2 — CHANNEL */}
            <Step n={2} label="Where will it talk?">
              <div className="flex flex-wrap gap-2">
                {channels.map((ch) => {
                  const m = CHANNEL_META[ch];
                  const active = form.responseChannel === ch;
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => set("responseChannel", ch)}
                      className={chip(active)}
                    >
                      {m.icon}
                      {m.label}
                      {active && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </Step>

            {/* 3 — TONE */}
            <Step n={3} label="How should it sound?">
              <div className="grid gap-2 sm:grid-cols-2">
                {tones.map((t) => {
                  const m = TONE_META[t];
                  const active = form.toneStyle === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set("toneStyle", t)}
                      className={[
                        "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition",
                        active
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div>
                        <p className={`text-sm font-semibold ${active ? "text-indigo-700" : "text-slate-800"}`}>
                          {m.label}
                        </p>
                        <p className="text-xs text-slate-400">{m.desc}</p>
                      </div>
                      {active && <Check className="h-4 w-4 shrink-0 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            </Step>

            {/* 4 — IDENTITY */}
            <Step n={4} label="Assistant identity">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">Name</label>
                  <input
                    value={form.assistantName}
                    onChange={(e) => set("assistantName", e.target.value)}
                    placeholder="e.g., Alex"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">Language</label>
                  <input
                    value={form.targetLanguage}
                    onChange={(e) => set("targetLanguage", e.target.value)}
                    placeholder="English, Nepali…"
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500">Domain description</label>
                <textarea
                  value={form.domainDescription}
                  onChange={(e) => set("domainDescription", e.target.value)}
                  placeholder="What does this assistant help with?"
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </Step>

            {/* 5 — WHEN SOMETHING GOES WRONG */}
            <Step n={5} label="When something goes wrong…">
              <div className="grid gap-2 sm:grid-cols-2">
                {problemModes.map((mode) => {
                  const m = PROBLEM_META[mode];
                  const active = form.problemHandling === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => set("problemHandling", mode)}
                      className={[
                        "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition",
                        active
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div>
                        <p className={`text-sm font-semibold ${active ? "text-indigo-700" : "text-slate-800"}`}>
                          {m.label}
                        </p>
                        <p className="text-xs text-slate-400">{m.desc}</p>
                      </div>
                      {active && <Check className="h-4 w-4 shrink-0 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            </Step>

            {/* 6 — SAFETY */}
            <Step n={6} label="Safety rules">
              <div className="space-y-4">
                {/* Content safety */}
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Content</p>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-1">
                    <Toggle id="preventHallucination" label="Prevent hallucination" checked={form.preventHallucination} onCheckedChange={(v) => set("preventHallucination", v)} />
                    <Toggle id="blockFinancial" label="Block financial guessing" checked={form.blockFinancial} onCheckedChange={(v) => set("blockFinancial", v)} />
                    <Toggle id="blockMedicalDiagnosis" label="Block medical diagnosis" checked={form.blockMedicalDiagnosis} onCheckedChange={(v) => set("blockMedicalDiagnosis", v)} />
                    <Toggle id="blockLegalClaims" label="Block legal claims" checked={form.blockLegalClaims} onCheckedChange={(v) => set("blockLegalClaims", v)} />
                  </div>
                </div>
                {/* Data & PII safety */}
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Data & Privacy</p>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-1">
                    <Toggle id="blockPIICollection" label="Block PII collection (passwords, card numbers)" checked={form.blockPIICollection} onCheckedChange={(v) => set("blockPIICollection", v)} />
                    <Toggle id="neverRepeatSensitiveData" label="Never echo sensitive data back" checked={form.neverRepeatSensitiveData} onCheckedChange={(v) => set("neverRepeatSensitiveData", v)} />
                    <Toggle id="requireGrounding" label="Require source grounding" checked={form.requireGrounding} onCheckedChange={(v) => set("requireGrounding", v)} />
                  </div>
                </div>
                {/* Access control */}
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Access Control</p>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-1">
                    <Toggle id="restrictToDomain" label="Restrict to domain only" checked={form.restrictToDomain} onCheckedChange={(v) => set("restrictToDomain", v)} />
                    <Toggle id="ragEnabled" label="Enable RAG retrieval" checked={form.ragEnabled} onCheckedChange={(v) => set("ragEnabled", v)} />
                  </div>
                </div>
                {/* Answer style */}
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Answer Style</p>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-1">
                    <Toggle id="useBullets" label="Use bullet points" checked={form.useBullets} onCheckedChange={(v) => set("useBullets", v)} />
                    <Toggle id="preferSimple" label="Prefer simple language" checked={form.preferSimple} onCheckedChange={(v) => set("preferSimple", v)} />
                    <Toggle id="avoidJargon" label="Avoid technical jargon" checked={form.avoidJargon} onCheckedChange={(v) => set("avoidJargon", v)} />
                  </div>
                </div>
              </div>
            </Step>

            {/* ADVANCED (collapsible) */}
            <div className="border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="flex w-full items-center justify-between text-sm font-semibold text-slate-500 hover:text-slate-700 transition"
              >
                <span>Advanced settings</span>
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showAdvanced && (
                <div className="mt-6 space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">Configuration name</label>
                    <input value={form.configName} onChange={(e) => set("configName", e.target.value)} className={inputCls} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">Use case description</label>
                    <textarea value={form.useCaseDescription} onChange={(e) => set("useCaseDescription", e.target.value)} rows={2} className={`${inputCls} resize-none`} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">Default sentences</label>
                      <input type="number" min={1} max={10} value={form.defaultSentences} onChange={(e) => set("defaultSentences", parseInt(e.target.value) || 1)} className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">Max sentences</label>
                      <input type="number" min={1} max={20} value={form.maxSentences} onChange={(e) => set("maxSentences", parseInt(e.target.value) || 1)} className={inputCls} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">Initial greetings (comma-separated)</label>
                    <input value={form.greetings} onChange={(e) => set("greetings", e.target.value)} className={inputCls} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">Mid-conversation acknowledgments</label>
                    <input value={form.midAcks} onChange={(e) => set("midAcks", e.target.value)} className={inputCls} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">Assistant persona</label>
                    <textarea value={form.assistantPersona} onChange={(e) => set("assistantPersona", e.target.value)} rows={2} className={`${inputCls} resize-none`} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">User persona</label>
                    <textarea value={form.userPersona} onChange={(e) => set("userPersona", e.target.value)} rows={2} className={`${inputCls} resize-none`} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">Custom instructions (one per line)</label>
                    <textarea value={form.customInstructions} onChange={(e) => set("customInstructions", e.target.value)} rows={3} className={`${inputCls} resize-none`} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">Required data keys (comma-separated)</label>
                    <input value={form.requiredKeys} onChange={(e) => set("requiredKeys", e.target.value)} placeholder="e.g., user_id, context" className={inputCls} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">Fallback text</label>
                    <textarea value={form.fallbackText} onChange={(e) => set("fallbackText", e.target.value)} rows={2} className={`${inputCls} resize-none`} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">When data is missing</label>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(MISSING_DATA_META) as MissingDataBehavior[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => set("missingDataBehavior", mode)}
                          className={chip(form.missingDataBehavior === mode)}
                        >
                          {MISSING_DATA_META[mode].label}
                          {form.missingDataBehavior === mode && <Check className="h-3.5 w-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* ── RIGHT: LIVE OUTPUT ── */}
        <section className="space-y-6">
          {/* Header */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900">Generated Prompt</h2>
            <p className="mt-1 text-sm text-slate-500">Updates live as you configure on the left.</p>

            {/* Active rule summary */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill color="indigo">{INDUSTRY_META[form.industry].label}</Pill>
              <Pill color="slate">{CHANNEL_META[form.responseChannel].label}</Pill>
              <Pill color="slate">{TONE_META[form.toneStyle].label}</Pill>
              <Pill color="slate">{PROBLEM_META[form.problemHandling].label}</Pill>
              {form.preventHallucination && <Pill color="green">No hallucination</Pill>}
              {form.requireGrounding && <Pill color="green">Grounded</Pill>}
              {form.ragEnabled && <Pill color="purple">RAG</Pill>}
              {form.blockFinancial && <Pill color="orange">No fin. guessing</Pill>}
            </div>
          </div>

          {/* Prompt tabs */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <Tabs defaultValue="behavioral">
              <TabsList className="grid w-full grid-cols-2 mb-5">
                <TabsTrigger value="behavioral">System Prompt</TabsTrigger>
                <TabsTrigger value="structured">Data Context</TabsTrigger>
              </TabsList>

              <TabsContent value="behavioral" className="space-y-3">
                <div className="max-h-[480px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-700">
                  <pre className="whitespace-pre-wrap break-words">{behavioralPrompt}</pre>
                </div>
                <button
                  onClick={() => copy(behavioralPrompt, "behavioral")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-110 active:scale-[0.99]"
                >
                  {copied === "behavioral" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === "behavioral" ? "Copied!" : "Copy System Prompt"}
                </button>

                {/* Open in AI chat */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openIn("chatgpt")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99]"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-[#10a37f] text-white text-[9px] font-bold shrink-0">G</span>
                    {openedIn === "chatgpt" ? "Prompt copied!" : "Open in ChatGPT"}
                    {openedIn !== "chatgpt" && <ExternalLink className="h-3.5 w-3.5 text-slate-400" />}
                  </button>
                  <button
                    onClick={() => openIn("gemini")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99]"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-gradient-to-br from-blue-500 to-purple-500 text-white text-[9px] font-bold shrink-0">G</span>
                    {openedIn === "gemini" ? "Prompt copied!" : "Open in Gemini"}
                    {openedIn !== "gemini" && <ExternalLink className="h-3.5 w-3.5 text-slate-400" />}
                  </button>
                </div>
                {openedIn === "chatgpt" && (
                  <p className="text-center text-xs text-slate-400">
                    Prompt sent to ChatGPT — it should appear in the input field automatically.
                    <br />
                    If it didn't load, paste with{" "}
                    <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-600">Ctrl+V</kbd>
                    {" "}or{" "}
                    <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-600">⌘V</kbd>
                  </p>
                )}
                {openedIn === "gemini" && (
                  <p className="text-center text-xs text-slate-400">
                    Prompt copied to clipboard — paste it in Gemini with{" "}
                    <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-600">Ctrl+V</kbd>
                    {" "}or{" "}
                    <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-600">⌘V</kbd>
                  </p>
                )}
              </TabsContent>

              <TabsContent value="structured" className="space-y-3">
                <div className="max-h-[480px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-700">
                  <pre className="whitespace-pre-wrap break-words">{structuredPrompt}</pre>
                </div>
                <button
                  onClick={() => copy(structuredPrompt, "structured")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  {copied === "structured" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === "structured" ? "Copied!" : "Copy Data Context"}
                </button>
              </TabsContent>
            </Tabs>
          </div>
        </section>

      </div>
    </main>
  );
}

// ─── Primitives ───────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100";

function chip(active: boolean) {
  return [
    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
    active
      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
      : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
  ].join(" ");
}

function Step({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-xs font-semibold text-indigo-600">
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <p className="mb-3 text-sm font-semibold text-slate-800">{label}</p>
        {children}
      </div>
    </div>
  );
}

function Toggle({
  id,
  label: lbl,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <label htmlFor={id} className="cursor-pointer text-sm text-slate-700">{lbl}</label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

const pillColors: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  slate:  "bg-slate-100 text-slate-600",
  green:  "bg-green-50 text-green-700",
  purple: "bg-purple-50 text-purple-700",
  orange: "bg-orange-50 text-orange-700",
};

function Pill({ children, color = "slate" }: { children: React.ReactNode; color?: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${pillColors[color] ?? pillColors.slate}`}>
      {children}
    </span>
  );
}
