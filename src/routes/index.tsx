import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlignLeft,
  BookOpen,
  Check,
  ClipboardList,
  Code2,
  Copy,
  ExternalLink,
  Hash,
  ImageIcon,
  Mail,
  MessageSquare,
  PencilLine,
  Smile,
  Sparkles,
  Tag,
  Target,
  Type,
  Users,
  Wand2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prompt Builder" },
      { name: "description", content: "Build clear, structured AI prompts in a few simple steps." },
      { property: "og:title", content: "Prompt Builder" },
      { property: "og:description", content: "Build clear, structured AI prompts in a few simple steps." },
    ],
  }),
  component: PromptBuilderPage,
});

// ─── Role engine ──────────────────────────────────────────────────────────────

type RoleId =
  | "software-engineer" | "marketing-expert" | "content-writer" | "data-analyst"
  | "educator" | "designer" | "business-consultant" | "researcher"
  | "product-manager" | "hr-specialist" | "financial-advisor" | "general";

type Role = {
  id: RoleId;
  label: string;
  persona: string;
  keywords: string[];
  qualityCriteria: string[];
};

const ROLES: Role[] = [
  {
    id: "software-engineer",
    label: "Software Engineer",
    persona: "a senior software engineer who gives practical, correct, and production-ready guidance",
    keywords: [
      "code", "coding", "software", "bug", "fix", "app", "application", "api", "database",
      "function", "component", "script", "program", "developer", "deploy", "debug", "test",
      "feature", "backend", "frontend", "web", "mobile", "react", "python", "javascript",
      "typescript", "css", "html", "server", "endpoint", "refactor", "git", "pull request",
      "repository", "algorithm", "library", "framework", "cli", "dockerfile", "kubernetes",
      "aws", "cloud", "authentication", "integration", "architecture", "microservice",
    ],
    qualityCriteria: [
      "The solution must be correct, executable, and explicitly handle edge cases",
      "Prefer idiomatic patterns for the language or framework; avoid anti-patterns",
      "Include error handling, typing, and any critical security or performance considerations",
    ],
  },
  {
    id: "marketing-expert",
    label: "Marketing Expert",
    persona: "a seasoned marketing expert who crafts compelling, conversion-focused messaging",
    keywords: [
      "ad", "advertisement", "campaign", "brand", "sales", "marketing", "promote", "promotion",
      "product launch", "social media", "email campaign", "copy", "conversion", "funnel", "lead",
      "cta", "landing page", "seo", "growth", "engagement", "viral", "influencer",
      "customer acquisition", "retargeting", "positioning", "tagline", "slogan", "go-to-market",
      "market research", "competitive analysis",
    ],
    qualityCriteria: [
      "Every sentence must serve a persuasion or conversion purpose — cut all filler",
      "Messaging must speak directly to the audience's specific pain, desire, or objection",
      "Include a clear call to action that is specific and low-friction",
    ],
  },
  {
    id: "content-writer",
    label: "Content Writer",
    persona: "a skilled content writer who crafts clear, engaging, and audience-tailored writing",
    keywords: [
      "blog", "article", "write", "writing", "post", "content", "story", "newsletter",
      "essay", "caption", "description", "headline", "copywriting", "draft", "proofread",
      "narrative", "creative writing", "press release", "case study", "white paper", "ebook",
      "script", "lyrics", "poem", "social caption", "listicle", "about page", "bio",
      "product description", "explainer",
    ],
    qualityCriteria: [
      "The writing must have a clear arc: hook, body, and resolution",
      "Voice must be consistent and calibrated to the audience's reading level",
      "Avoid passive constructions, hedging language, and vague qualifiers",
    ],
  },
  {
    id: "data-analyst",
    label: "Data Analyst",
    persona: "an expert data analyst who derives clear insights from data and communicates them simply",
    keywords: [
      "data", "analysis", "statistics", "chart", "graph", "trend", "metric", "report",
      "insight", "analytics", "dashboard", "visualization", "dataset", "spreadsheet",
      "sql", "excel", "csv", "kpi", "forecast", "regression", "cohort", "pivot",
      "tableau", "power bi", "pandas", "numpy", "jupyter", "a/b test", "hypothesis",
      "correlation", "segmentation", "retention",
    ],
    qualityCriteria: [
      "Insights must be grounded in the data provided — never extrapolate beyond what is present",
      "Lead with the conclusion, then support it with evidence; do not bury the finding",
      "Use precise quantitative language; avoid vague terms like 'significant' without a number",
    ],
  },
  {
    id: "educator",
    label: "Educator",
    persona: "an experienced educator who explains concepts clearly and structures learning effectively",
    keywords: [
      "teach", "explain", "learn", "learning", "course", "lesson", "student", "education",
      "tutorial", "guide", "instruction", "training", "quiz", "curriculum", "lecture",
      "study", "concept", "beginner friendly", "understand", "simplify", "classroom",
      "workshop", "onboarding", "bootcamp", "walkthrough", "step by step", "how does",
      "what is", "definition", "knowledge check",
    ],
    qualityCriteria: [
      "Use a concrete example or analogy to illustrate every abstract concept",
      "Build from known to unknown — scaffold on what the learner already has",
      "Include a comprehension check or summary statement at the end",
    ],
  },
  {
    id: "designer",
    label: "UX/UI Designer",
    persona: "a user-centered UX/UI designer who balances aesthetics with usability",
    keywords: [
      "design", "ui", "ux", "user interface", "user experience", "layout", "visual",
      "prototype", "wireframe", "mockup", "figma", "color", "typography", "accessibility",
      "responsive", "design system", "branding", "logo", "icon", "illustration",
      "motion", "animation", "style guide", "component library", "font pairing",
      "color palette", "spacing", "grid", "contrast", "usability",
    ],
    qualityCriteria: [
      "Every design decision must connect to a user need or established usability principle",
      "Address accessibility — contrast, touch targets, screen reader behavior — proactively",
      "Provide rationale for visual choices, not just the choices themselves",
    ],
  },
  {
    id: "business-consultant",
    label: "Business Consultant",
    persona: "a strategic business consultant who provides clear, actionable business advice",
    keywords: [
      "business", "strategy", "plan", "planning", "revenue", "profit", "startup", "company",
      "market", "competition", "investor", "pitch", "proposal", "operations", "process",
      "efficiency", "roi", "okr", "business model", "monetization", "pricing strategy",
      "expansion", "partnership", "acquisition", "swot", "lean", "agile", "roadmap",
      "stakeholder", "due diligence",
    ],
    qualityCriteria: [
      "Every recommendation must be actionable — specify the who, what, and when",
      "Acknowledge the key trade-off or risk associated with the primary recommendation",
      "Quantify impact where possible; use ranges or proxies rather than leaving it qualitative",
    ],
  },
  {
    id: "researcher",
    label: "Researcher",
    persona: "a rigorous researcher who synthesizes information accurately and cites reasoning clearly",
    keywords: [
      "research", "study", "literature review", "paper", "academic", "survey", "methodology",
      "hypothesis", "findings", "citation", "references", "peer-reviewed", "abstract",
      "thesis", "dissertation", "evidence", "data collection", "qualitative", "quantitative",
      "systematic review", "meta-analysis", "scholarly", "journal", "fact-check",
      "investigate", "analyze sources", "primary source",
    ],
    qualityCriteria: [
      "Clearly distinguish between established evidence and interpretation or hypothesis",
      "Cite the type of evidence being drawn on (e.g., RCT, observational, expert consensus)",
      "Identify the primary limitation of the analysis or source material",
    ],
  },
  {
    id: "product-manager",
    label: "Product Manager",
    persona: "an experienced product manager who frames problems in terms of user value and business impact",
    keywords: [
      "product", "feature", "roadmap", "backlog", "sprint", "user story", "acceptance criteria",
      "stakeholder", "product strategy", "launch", "mvp", "discovery", "requirements",
      "persona", "jobs to be done", "prioritization", "release", "product brief",
      "go-to-market", "product metrics", "north star", "prd", "spec", "initiative", "epic",
      "feedback loop",
    ],
    qualityCriteria: [
      "Frame everything around user value and measurable outcome, not features or tasks",
      "Include prioritization rationale — why this, why now",
      "Surface the key assumption that, if wrong, would invalidate the recommendation",
    ],
  },
  {
    id: "hr-specialist",
    label: "HR Specialist",
    persona: "a professional HR specialist who provides inclusive, legally-mindful, and actionable HR guidance",
    keywords: [
      "hr", "human resources", "hiring", "recruitment", "job description", "interview",
      "onboarding", "performance review", "employee", "team culture", "compensation",
      "benefits", "policy", "handbook", "workplace", "retention", "engagement survey",
      "exit interview", "talent acquisition", "diversity", "inclusion",
      "learning and development", "offboarding", "workforce planning", "employment contract",
    ],
    qualityCriteria: [
      "Ensure all recommendations align with common employment law principles; flag jurisdiction-specific items",
      "Use inclusive, bias-aware language throughout",
      "Balance company interests and employee experience explicitly when there is tension",
    ],
  },
  {
    id: "financial-advisor",
    label: "Financial Advisor",
    persona: "a knowledgeable financial advisor who gives clear, well-reasoned financial guidance",
    keywords: [
      "finance", "financial", "investment", "portfolio", "savings", "budget", "budgeting",
      "expense", "retirement", "tax", "accounting", "cash flow", "balance sheet",
      "income statement", "valuation", "assets", "liabilities", "equity", "stock",
      "bond", "mutual fund", "etf", "interest rate", "mortgage", "loan", "debt",
      "wealth management", "financial planning", "profit and loss",
    ],
    qualityCriteria: [
      "Present ranges or scenarios rather than single-point projections",
      "Separate facts from assumptions clearly; label every assumption used in reasoning",
      "Highlight risk factors the reader should consider alongside any opportunity",
    ],
  },
  {
    id: "general",
    label: "General Assistant",
    persona: "a knowledgeable and versatile assistant who provides clear, helpful guidance",
    keywords: [],
    qualityCriteria: [
      "Answer the question directly without unnecessary preamble",
      "Be specific — avoid vague generalizations when concrete detail is achievable",
      "Match the depth and formality of the response to the apparent intent of the request",
    ],
  },
];

// Goal field gets 2× weight — it's more indicative of intent than subject
function deriveRole(goal: string, subject: string): Role {
  const goalText = goal.toLowerCase();
  const subjectText = subject.toLowerCase();
  let best: Role = ROLES.find((r) => r.id === "general")!;
  let bestScore = 0;

  for (const role of ROLES) {
    if (role.id === "general") continue;
    const goalScore = role.keywords.filter((kw) => goalText.includes(kw)).length * 2;
    const subjectScore = role.keywords.filter((kw) => subjectText.includes(kw)).length;
    const score = goalScore + subjectScore;
    if (score > bestScore) {
      bestScore = score;
      best = role;
    }
  }

  return best;
}

// ─── Audience tier ────────────────────────────────────────────────────────────

type AudienceTier = "beginner" | "expert" | "executive" | "general";

const AUDIENCE_TIER_KEYWORDS: Record<Exclude<AudienceTier, "general">, string[]> = {
  beginner: [
    "beginner", "beginners", "novice", "newbie", "new to", "no experience", "starter",
    "non-technical", "non technical", "layperson", "general public", "kids", "children",
    "students", "first-time", "unfamiliar", "zero knowledge",
  ],
  expert: [
    "expert", "experts", "senior", "advanced", "specialist", "professional", "developer",
    "engineer", "researcher", "experienced", "technical", "practitioner", "phd",
    "scientist", "architect", "lead",
  ],
  executive: [
    "executive", "ceo", "cto", "cfo", "coo", "vp", "director", "head of", "c-suite",
    "c suite", "leadership", "board", "investor", "stakeholder", "decision maker",
    "manager", "management",
  ],
};

// expert > executive > beginner when multiple match
function detectAudienceTier(audience: string): AudienceTier {
  const text = audience.toLowerCase();
  for (const tier of ["expert", "executive", "beginner"] as const) {
    if (AUDIENCE_TIER_KEYWORDS[tier].some((kw) => text.includes(kw))) return tier;
  }
  return "general";
}

const AUDIENCE_TIER_INSTRUCTIONS: Record<AudienceTier, string> = {
  beginner:  "Use simple, jargon-free language. Define any technical terms you use. Use analogies to everyday experience where helpful.",
  expert:    "Assume domain-level expertise. Skip foundational explanations. Use precise technical language and go straight to depth.",
  executive: "Be brief and outcome-focused. Lead with the bottom line. Use business-level framing — implications, risks, decisions — not implementation details.",
  general:   "",
};

// ─── Output format ────────────────────────────────────────────────────────────

const OUTPUT_FORMAT_IDS = ["auto", "email", "blog", "social", "code", "summary", "plan"] as const;
type OutputFormat = (typeof OUTPUT_FORMAT_IDS)[number];

const FORMAT_META: Record<OutputFormat, { label: string; icon: React.ReactNode }> = {
  auto:    { label: "Auto-detect", icon: <Sparkles className="h-3.5 w-3.5" /> },
  email:   { label: "Email",       icon: <Mail className="h-3.5 w-3.5" /> },
  blog:    { label: "Blog Post",   icon: <BookOpen className="h-3.5 w-3.5" /> },
  social:  { label: "Social Post", icon: <Hash className="h-3.5 w-3.5" /> },
  code:    { label: "Code",        icon: <Code2 className="h-3.5 w-3.5" /> },
  summary: { label: "Summary",     icon: <AlignLeft className="h-3.5 w-3.5" /> },
  plan:    { label: "Action Plan", icon: <ClipboardList className="h-3.5 w-3.5" /> },
};

const FORMAT_AUTO_KEYWORDS: Partial<Record<OutputFormat, string[]>> = {
  email:   ["email", "e-mail", "message to", "reply to", "subject line", "follow up", "follow-up", "cold outreach", "cover letter", "introduction email", "newsletter"],
  blog:    ["blog", "article", "write about", "write up", "long-form", "guide", "how-to", "explainer", "tutorial post", "listicle", "editorial"],
  social:  ["tweet", "twitter", "linkedin post", "instagram", "social media", "caption", "facebook post", "thread", "social post", "x post"],
  code:    ["code", "function", "script", "component", "implement", "build a", "create a class", "write a program", "algorithm", "api endpoint", "sql query", "snippet"],
  summary: ["summarize", "summary", "tldr", "tl;dr", "condense", "recap", "key points", "brief overview", "highlights"],
  plan:    ["action plan", "action items", "next steps", "roadmap", "checklist", "to-do", "todo", "task list", "milestones", "implementation plan", "steps to", "project plan"],
};

function autoDetectFormat(goal: string, extra: string): OutputFormat {
  const text = `${goal} ${extra}`.toLowerCase();
  for (const [fmt, keywords] of Object.entries(FORMAT_AUTO_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return fmt as OutputFormat;
  }
  return "auto";
}

const FORMAT_INSTRUCTIONS: Record<OutputFormat, string> = {
  auto:    "",
  email:   "Format this as a complete email with: subject line, greeting, concise body paragraphs, and a closing signature placeholder. Do not add commentary outside the email itself.",
  blog:    "Format as a blog post with: an engaging headline (H1), a hook introduction, clearly labeled sections with subheadings (H2/H3), and a conclusion with a call to action.",
  social:  "Format as a social media post: concise, high-impact, written for scanning. Include a strong opening line, relevant hashtags at the end if appropriate, platform-appropriate length.",
  code:    "Format as clean, production-ready code: brief comment block explaining what it does, the implementation with inline comments on non-obvious logic, and usage examples.",
  summary: "Format as a structured summary: one-sentence TL;DR, then 3–5 key points as bullet items, then a one-sentence implication or takeaway.",
  plan:    "Format as an action plan: brief goal statement, numbered steps in priority order, each step with a time estimate and success criterion. Close with a risks/dependencies note.",
};

// ─── Length ───────────────────────────────────────────────────────────────────

const LENGTH_IDS = ["auto", "concise", "standard", "detailed"] as const;
type Length = (typeof LENGTH_IDS)[number];

const LENGTH_INSTRUCTIONS: Record<Length, string> = {
  auto:     "",
  concise:  "Keep the response concise — aim for brevity and directness. Cut everything that doesn't add value.",
  standard: "Use a standard length — enough to be complete and clear without being exhaustive.",
  detailed: "Provide a thorough, detailed response. Cover the topic comprehensively, including supporting reasoning, examples, and considerations.",
};

// ─── Sensitivity detection ────────────────────────────────────────────────────

type SensitivityDomain = "medical" | "legal" | "financial";

const SENSITIVITY_RULES: Array<{ domain: SensitivityDomain; keywords: string[]; notice: string }> = [
  {
    domain: "medical",
    keywords: [
      "medical", "medicine", "diagnosis", "diagnose", "symptom", "symptoms", "treatment",
      "disease", "condition", "illness", "injury", "medication", "drug", "dosage",
      "prescription", "therapy", "health condition", "cancer", "diabetes", "depression",
      "anxiety", "surgery", "hospital", "clinical", "patient", "mental health",
      "psychiatric", "vaccine", "chronic", "cardiovascular", "neurological",
    ],
    notice: 'The generated output must include this disclaimer: "This information is for general educational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional before making health decisions."',
  },
  {
    domain: "legal",
    keywords: [
      "legal", "law", "lawsuit", "contract", "liability", "compliance", "regulation",
      "court", "attorney", "lawyer", "sue", "intellectual property", "copyright",
      "trademark", "patent", "gdpr", "terms of service", "privacy policy",
      "employment law", "tax law", "securities", "legal advice", "rights", "agreement",
      "breach", "dispute", "arbitration", "indemnity", "nda",
    ],
    notice: 'The generated output must include this disclaimer: "This information is for general informational purposes only and does not constitute legal advice. Consult a qualified attorney in your jurisdiction for advice specific to your situation."',
  },
  {
    domain: "financial",
    keywords: [
      "investment advice", "investing advice", "stock picks", "crypto advice", "trading advice",
      "financial advice", "retire early", "retirement planning advice", "tax advice",
      "loan advice", "mortgage advice", "wealth management", "asset allocation",
      "hedge fund", "options trading", "futures trading", "financial planning advice",
    ],
    notice: 'The generated output must include this disclaimer: "This information is for general educational purposes only and does not constitute financial advice. Consult a registered financial advisor before making investment or financial decisions."',
  },
];

function detectSensitivityFlags(goal: string, subject: string): SensitivityDomain[] {
  const text = `${goal} ${subject}`.toLowerCase();
  return SENSITIVITY_RULES
    .filter((r) => r.keywords.some((kw) => text.includes(kw)))
    .map((r) => r.domain);
}

// ─── Image generation types & constants ───────────────────────────────────────

type ArtStyle =
  | "photorealistic" | "cinematic" | "oil-painting" | "watercolor"
  | "digital-art" | "anime" | "sketch" | "3d-render" | "comic-book" | "impressionist";

type ImageMood = "moody" | "dreamy" | "dramatic" | "cheerful" | "peaceful" | "mysterious" | "epic";

type Lighting = "golden-hour" | "studio" | "neon" | "soft-diffused" | "harsh-shadows" | "moonlight" | "overcast";

type Composition =
  | "wide-angle" | "portrait" | "birds-eye" | "low-angle"
  | "rule-of-thirds" | "symmetrical" | "bokeh";

type ColorPalette = "auto" | "warm" | "cool" | "monochrome" | "vibrant" | "muted" | "pastel" | "neon-colors";

type ImageFormData = {
  subject: string;
  artStyles: ArtStyle[];
  moods: ImageMood[];
  lighting: Lighting | null;
  composition: Composition | null;
  colorPalette: ColorPalette;
  extraDetails: string;
  negativePrompt: string;
};

const ART_STYLE_LABELS: Record<ArtStyle, string> = {
  "photorealistic": "Photorealistic",
  "cinematic": "Cinematic",
  "oil-painting": "Oil Painting",
  "watercolor": "Watercolor",
  "digital-art": "Digital Art",
  "anime": "Anime / Manga",
  "sketch": "Sketch",
  "3d-render": "3D Render",
  "comic-book": "Comic Book",
  "impressionist": "Impressionist",
};

const IMAGE_MOOD_LABELS: Record<ImageMood, string> = {
  moody: "Moody / Dark",
  dreamy: "Dreamy / Ethereal",
  dramatic: "Dramatic",
  cheerful: "Bright / Cheerful",
  peaceful: "Peaceful / Calm",
  mysterious: "Mysterious",
  epic: "Epic / Heroic",
};

const LIGHTING_LABELS: Record<Lighting, string> = {
  "golden-hour": "Golden Hour",
  "studio": "Studio",
  "neon": "Neon / Cyberpunk",
  "soft-diffused": "Soft Diffused",
  "harsh-shadows": "Harsh Shadows",
  "moonlight": "Moonlight",
  "overcast": "Overcast",
};

const COMPOSITION_LABELS: Record<Composition, string> = {
  "wide-angle": "Wide Angle",
  "portrait": "Portrait / Close-up",
  "birds-eye": "Bird's Eye View",
  "low-angle": "Low Angle",
  "rule-of-thirds": "Rule of Thirds",
  "symmetrical": "Symmetrical",
  "bokeh": "Bokeh / Shallow DOF",
};

const COLOR_PALETTE_LABELS: Record<ColorPalette, string> = {
  auto: "Auto",
  warm: "Warm Tones",
  cool: "Cool Tones",
  monochrome: "Monochrome",
  vibrant: "Vibrant",
  muted: "Muted / Desaturated",
  pastel: "Pastel",
  "neon-colors": "Neon Colors",
};

const COLOR_PALETTE_TERMS: Record<ColorPalette, string> = {
  auto: "",
  warm: "warm color palette, golden tones",
  cool: "cool color palette, blue tones",
  monochrome: "monochromatic, black and white",
  vibrant: "vibrant colors, high saturation",
  muted: "muted colors, desaturated, low saturation",
  pastel: "pastel colors, soft hues",
  "neon-colors": "neon colors, electric palette",
};

const DEFAULT_NEGATIVE_PROMPT =
  "blurry, out of focus, bad anatomy, watermark, text overlay, low quality, pixelated, distorted, ugly, deformed";

const ART_STYLE_PERSONA: Record<ArtStyle, string> = {
  "photorealistic":  "a professional photographer with expertise in high-end commercial and fine-art photography",
  "cinematic":       "a cinematographer and visual director specializing in dramatic, film-quality imagery",
  "oil-painting":    "a master oil painter with deep knowledge of classical and contemporary painting techniques",
  "watercolor":      "a professional watercolor artist known for luminous, expressive illustrations",
  "digital-art":     "a concept artist and digital illustrator working in the style of leading studios",
  "anime":           "a professional anime artist and character illustrator trained in Japanese animation aesthetics",
  "sketch":          "a professional sketch artist with expertise in expressive line work and tonal rendering",
  "3d-render":       "a 3D artist and visual effects specialist producing photorealistic CGI renders",
  "comic-book":      "a comic book artist and inker with a bold, graphic visual style",
  "impressionist":   "an impressionist painter who captures light, movement, and emotion through expressive brushwork",
};

function deriveImagePersona(artStyles: ArtStyle[]): string {
  if (artStyles.length === 0) return "a skilled visual artist and image designer";
  if (artStyles.length === 1) return ART_STYLE_PERSONA[artStyles[0]];
  return `a versatile visual artist skilled in ${artStyles.map((s) => ART_STYLE_LABELS[s].toLowerCase()).join(" and ")}`;
}

function buildImagePrompt(d: ImageFormData): string {
  const persona = deriveImagePersona(d.artStyles);
  const lines: string[] = [];

  lines.push(`You are ${persona}.`);
  lines.push("");

  lines.push("## Subject");
  lines.push(d.subject.trim() || "[describe your scene or subject]");
  lines.push("");

  lines.push("## Art Style");
  lines.push(
    d.artStyles.length
      ? d.artStyles.map((s) => ART_STYLE_LABELS[s]).join(", ")
      : "Not specified"
  );
  lines.push("");

  lines.push("## Mood & Atmosphere");
  lines.push(
    d.moods.length
      ? d.moods.map((m) => IMAGE_MOOD_LABELS[m]).join(", ")
      : "Not specified"
  );
  lines.push("");

  lines.push("## Lighting");
  lines.push(d.lighting ? LIGHTING_LABELS[d.lighting] : "Not specified");
  lines.push("");

  lines.push("## Composition");
  lines.push(d.composition ? COMPOSITION_LABELS[d.composition] : "Not specified");
  lines.push("");

  lines.push("## Color Palette");
  lines.push(d.colorPalette !== "auto" ? COLOR_PALETTE_LABELS[d.colorPalette] : "Not specified");
  lines.push("");

  if (d.extraDetails.trim()) {
    lines.push("## Additional Details");
    lines.push(d.extraDetails.trim());
    lines.push("");
  }

  lines.push("## Quality Standards");
  lines.push("• Ultra-detailed and high resolution");
  lines.push("• Sharp focus with accurate, consistent lighting");
  lines.push("• Composition must feel intentional and balanced");
  lines.push("• Style must be cohesive and true to the selected art direction");
  lines.push("");

  lines.push("## Negative Prompt");
  lines.push(d.negativePrompt.trim() || DEFAULT_NEGATIVE_PROMPT);

  return lines.join("\n");
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TONES = ["Simple", "Friendly", "Professional", "Technical", "Persuasive", "Concise", "Empathetic"] as const;
type Tone = (typeof TONES)[number];

// ─── Form state ───────────────────────────────────────────────────────────────

type FormData = {
  goal: string;
  subject: string;
  audience: string;
  format: OutputFormat;
  length: Length;
  tones: Tone[];
  extra: string;
};

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(
  d: FormData,
  role: Role,
  audienceTier: AudienceTier,
  effectiveFormat: OutputFormat,
  sensitivityFlags: SensitivityDomain[],
): string {
  const goal = d.goal.trim() || "[your request]";
  const subject = d.subject.trim() || "[topic]";
  const audience = d.audience.trim() || "[audience]";
  const extra = d.extra.trim();
  const toneStr = d.tones.length ? d.tones.join(", ") : "Professional";

  const lines: string[] = [];

  lines.push(`Act as ${role.persona}.`);
  lines.push("");

  lines.push("## Task");
  lines.push(goal);
  lines.push("");

  lines.push("## Subject");
  lines.push(subject);
  lines.push("");

  lines.push("## Target Audience");
  lines.push(audience);
  const tierInstruction = AUDIENCE_TIER_INSTRUCTIONS[audienceTier];
  if (tierInstruction) lines.push(tierInstruction);
  lines.push("");

  const formatInstruction = FORMAT_INSTRUCTIONS[effectiveFormat];
  if (formatInstruction) {
    lines.push("## Format Requirements");
    lines.push(formatInstruction);
    lines.push("");
  }

  const lengthInstruction = LENGTH_INSTRUCTIONS[d.length];
  if (lengthInstruction) {
    lines.push("## Length");
    lines.push(lengthInstruction);
    lines.push("");
  }

  lines.push("## Tone");
  lines.push(toneStr);
  lines.push("");

  if (extra) {
    lines.push("## Context & Constraints");
    lines.push(extra);
    lines.push("");
  }

  lines.push("## Quality Standards");
  role.qualityCriteria.forEach((c) => lines.push(`• ${c}`));
  lines.push("• Directly addresses the stated task");
  lines.push("• Stays focused on the subject");
  lines.push("• Matches the intended audience");
  lines.push("");

  if (sensitivityFlags.length > 0) {
    lines.push("## Important Notices");
    for (const domain of sensitivityFlags) {
      const rule = SENSITIVITY_RULES.find((r) => r.domain === domain)!;
      lines.push(rule.notice);
    }
    lines.push("");
  }

  lines.push("Return only the final answer with no meta-commentary.");

  return lines.join("\n");
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function PromptBuilderPage() {
  const [mode, setMode] = useState<"text" | "image">("text");

  // Text form state
  const [goal, setGoal] = useState("");
  const [subject, setSubject] = useState("");
  const [audience, setAudience] = useState("");
  const [format, setFormat] = useState<OutputFormat>("auto");
  const [length, setLength] = useState<Length>("auto");
  const [tones, setTones] = useState<Tone[]>(["Friendly", "Professional"]);
  const [extra, setExtra] = useState("");

  // Image form state
  const [imgSubject, setImgSubject] = useState("");
  const [imgArtStyles, setImgArtStyles] = useState<ArtStyle[]>([]);
  const [imgMoods, setImgMoods] = useState<ImageMood[]>([]);
  const [imgLighting, setImgLighting] = useState<Lighting | null>(null);
  const [imgComposition, setImgComposition] = useState<Composition | null>(null);
  const [imgColorPalette, setImgColorPalette] = useState<ColorPalette>("auto");
  const [imgExtraDetails, setImgExtraDetails] = useState("");
  const [imgNegativePrompt, setImgNegativePrompt] = useState("");

  const [generated, setGenerated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [launchHint, setLaunchHint] = useState<"chatgpt" | "gemini" | null>(null);

  const data: FormData = { goal, subject, audience, format, length, tones, extra };

  const role = useMemo(() => deriveRole(goal, subject), [goal, subject]);
  const audienceTier = useMemo(() => detectAudienceTier(audience), [audience]);
  const detectedFormat = useMemo(() => autoDetectFormat(goal, extra), [goal, extra]);
  const effectiveFormat: OutputFormat = format === "auto" ? detectedFormat : format;
  const sensitivityFlags = useMemo(() => detectSensitivityFlags(goal, subject), [goal, subject]);

  const toggleTone = (t: Tone) =>
    setTones((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const handleModeSwitch = (m: "text" | "image") => {
    setMode(m);
    setGenerated(null);
    setCopied(false);
    setLaunchHint(null);
  };

  const imgData: ImageFormData = {
    subject: imgSubject,
    artStyles: imgArtStyles,
    moods: imgMoods,
    lighting: imgLighting,
    composition: imgComposition,
    colorPalette: imgColorPalette,
    extraDetails: imgExtraDetails,
    negativePrompt: imgNegativePrompt,
  };

  const handleGenerate = () => {
    if (mode === "text") {
      setGenerated(buildPrompt(data, role, audienceTier, effectiveFormat, sensitivityFlags));
    } else {
      setGenerated(buildImagePrompt(imgData));
    }
    setCopied(false);
    setLaunchHint(null);
  };

  const handleCopy = async () => {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleOpenIn = async (site: "chatgpt" | "gemini") => {
    if (!generated) return;
    if (site === "gemini") {
      await navigator.clipboard.writeText(generated);
      window.open("https://gemini.google.com/app", "_blank", "noopener,noreferrer");
    } else {
      const encoded = encodeURIComponent(generated);
      window.open(`https://chatgpt.com/?q=${encoded}`, "_blank", "noopener,noreferrer");
    }
    setLaunchHint(site);
    setTimeout(() => setLaunchHint(null), 4000);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">

        {/* ── LEFT: BUILDER ── */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h2 className="text-2xl font-bold text-slate-900">Prompt Builder</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">Describe what you need — rules apply automatically.</p>
            </div>
            <Link
              to="/aikhoj"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 shadow-sm transition hover:bg-indigo-100 hover:border-indigo-300"
            >
              Advanced →
            </Link>
          </div>

          {/* ── MODE TOGGLE ── */}
          <div className="mt-6 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
            <button
              type="button"
              onClick={() => handleModeSwitch("text")}
              className={[
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
                mode === "text"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-700",
              ].join(" ")}
            >
              <Type className="h-4 w-4" />
              Text
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch("image")}
              className={[
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
                mode === "image"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-700",
              ].join(" ")}
            >
              <ImageIcon className="h-4 w-4" />
              Image
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {mode === "text" ? (
              <>
                {/* 1 — GOAL */}
                <Field n={1} label="What do you want to create?">
                  <input
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="Write a Facebook ad for my bakery"
                    className={inputCls}
                  />
                </Field>

                {/* 2 — SUBJECT */}
                <Field n={2} label="What is the topic or subject?">
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Fresh artisan breads and seasonal pastries"
                    className={inputCls}
                  />
                </Field>

                {/* 3 — AUDIENCE */}
                <Field n={3} label="Who is this for?">
                  <input
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="Local families near Kathmandu"
                    className={inputCls}
                  />
                </Field>

                {/* 4 — FORMAT */}
                <Field n={4} label="Output format">
                  <div className="flex flex-wrap gap-2">
                    {OUTPUT_FORMAT_IDS.map((fid) => {
                      const m = FORMAT_META[fid];
                      const active = format === fid;
                      const showDetected = fid === "auto" && format === "auto" && detectedFormat !== "auto";
                      return (
                        <button
                          key={fid}
                          type="button"
                          onClick={() => setFormat(fid)}
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                            active
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                              : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          {m.icon}
                          {m.label}
                          {showDetected && (
                            <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                              → {FORMAT_META[detectedFormat].label}
                            </span>
                          )}
                          {active && fid !== "auto" && <Check className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* 5 — LENGTH */}
                <Field n={5} label="Length">
                  <div className="flex flex-wrap gap-2">
                    {LENGTH_IDS.map((lid) => {
                      const active = length === lid;
                      const labels: Record<Length, string> = {
                        auto: "Auto", concise: "Concise", standard: "Standard", detailed: "Detailed",
                      };
                      return (
                        <button
                          key={lid}
                          type="button"
                          onClick={() => setLength(lid)}
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                            active
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                              : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          {labels[lid]}
                          {active && lid !== "auto" && <Check className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* 6 — TONE */}
                <Field n={6} label="Tone">
                  <div className="flex flex-wrap gap-2">
                    {TONES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTone(t)}
                        className={[
                          "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition",
                          tones.includes(t)
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                            : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        {t}
                        {tones.includes(t) && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* 7 — CONTEXT & CONSTRAINTS */}
                <Field n={7} label="Context & constraints">
                  <textarea
                    value={extra}
                    onChange={(e) => setExtra(e.target.value)}
                    rows={3}
                    placeholder="Background context, things to avoid, special requirements…"
                    className={`${inputCls} resize-y`}
                  />
                </Field>
              </>
            ) : (
              <>
                {/* IMAGE FORM */}

                {/* 1 — SUBJECT / SCENE */}
                <Field n={1} label="Subject / Scene">
                  <input
                    value={imgSubject}
                    onChange={(e) => setImgSubject(e.target.value)}
                    placeholder="a lone wolf standing on a cliff at dusk"
                    className={inputCls}
                  />
                </Field>

                {/* 2 — ART STYLE */}
                <Field n={2} label="Art Style">
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(ART_STYLE_LABELS) as ArtStyle[]).map((s) => {
                      const active = imgArtStyles.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() =>
                            setImgArtStyles((prev) =>
                              prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                            )
                          }
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                            active
                              ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/20"
                              : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          {ART_STYLE_LABELS[s]}
                          {active && <Check className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* 3 — MOOD */}
                <Field n={3} label="Mood & Atmosphere">
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(IMAGE_MOOD_LABELS) as ImageMood[]).map((m) => {
                      const active = imgMoods.includes(m);
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() =>
                            setImgMoods((prev) =>
                              prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
                            )
                          }
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                            active
                              ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/20"
                              : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          {IMAGE_MOOD_LABELS[m]}
                          {active && <Check className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* 4 — LIGHTING */}
                <Field n={4} label="Lighting">
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(LIGHTING_LABELS) as Lighting[]).map((l) => {
                      const active = imgLighting === l;
                      return (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setImgLighting(active ? null : l)}
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                            active
                              ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/20"
                              : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          {LIGHTING_LABELS[l]}
                          {active && <Check className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* 5 — COMPOSITION */}
                <Field n={5} label="Composition">
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(COMPOSITION_LABELS) as Composition[]).map((c) => {
                      const active = imgComposition === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setImgComposition(active ? null : c)}
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                            active
                              ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/20"
                              : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          {COMPOSITION_LABELS[c]}
                          {active && <Check className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* 6 — COLOR PALETTE */}
                <Field n={6} label="Color Palette">
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(COLOR_PALETTE_LABELS) as ColorPalette[]).map((p) => {
                      const active = imgColorPalette === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setImgColorPalette(p)}
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                            active
                              ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/20"
                              : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          {COLOR_PALETTE_LABELS[p]}
                          {active && p !== "auto" && <Check className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* 7 — ADDITIONAL DETAILS */}
                <Field n={7} label="Additional Details">
                  <textarea
                    value={imgExtraDetails}
                    onChange={(e) => setImgExtraDetails(e.target.value)}
                    rows={2}
                    placeholder="Mist, ancient ruins, cherry blossoms, hyperrealistic skin texture…"
                    className={`${inputCls} resize-y`}
                  />
                </Field>

                {/* 8 — NEGATIVE PROMPT */}
                <Field n={8} label="Negative Prompt (optional)">
                  <textarea
                    value={imgNegativePrompt}
                    onChange={(e) => setImgNegativePrompt(e.target.value)}
                    rows={2}
                    placeholder={`Leave blank to use default: "${DEFAULT_NEGATIVE_PROMPT}"`}
                    className={`${inputCls} resize-y`}
                  />
                </Field>
              </>
            )}

            <button
              onClick={handleGenerate}
              className={[
                "mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 active:scale-[0.99]",
                mode === "text"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-500/20"
                  : "bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-violet-500/20",
              ].join(" ")}
            >
              {mode === "text" ? (
                <><Sparkles className="h-4 w-4" /> Generate Prompt</>
              ) : (
                <><Wand2 className="h-4 w-4" /> Generate Image Prompt</>
              )}
            </button>
          </div>
        </section>

        {/* ── RIGHT: PREVIEW or RESULT ── */}
        {generated ? (
          <ResultStage
            generated={generated}
            copied={copied}
            launchHint={launchHint}
            onCopy={handleCopy}
            onOpenIn={handleOpenIn}
            mode={mode}
          />
        ) : mode === "text" ? (
          <PreviewStage
            data={data}
            role={role}
            audienceTier={audienceTier}
            effectiveFormat={effectiveFormat}
            sensitivityFlags={sensitivityFlags}
            detectedFormat={detectedFormat}
          />
        ) : (
          <ImagePreviewStage imgData={imgData} />
        )}
      </div>
    </main>
  );
}

// ─── Preview Stage ────────────────────────────────────────────────────────────

function PreviewStage({
  data,
  role,
  audienceTier,
  effectiveFormat,
  sensitivityFlags,
  detectedFormat,
}: {
  data: FormData;
  role: Role;
  audienceTier: AudienceTier;
  effectiveFormat: OutputFormat;
  sensitivityFlags: SensitivityDomain[];
  detectedFormat: OutputFormat;
}) {
  const hasInput = data.goal || data.subject || data.audience;

  return (
    <section className="space-y-6">
      {/* Active rules */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">Live Preview</h2>
        <p className="mt-1 text-sm text-slate-500">Rules apply automatically as you type.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <RulePill color="indigo">{role.label}</RulePill>
          {audienceTier !== "general" && (
            <RulePill color="violet">
              {audienceTier === "beginner" ? "Beginner audience" : audienceTier === "expert" ? "Expert audience" : "Executive audience"}
            </RulePill>
          )}
          {effectiveFormat !== "auto" && (
            <RulePill color="purple">
              {data.format === "auto" ? `Auto → ${FORMAT_META[detectedFormat].label}` : FORMAT_META[effectiveFormat].label}
            </RulePill>
          )}
          {sensitivityFlags.map((domain) => (
            <RulePill key={domain} color="amber">
              {domain.charAt(0).toUpperCase() + domain.slice(1)} disclaimer
            </RulePill>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
            <MessageSquare className="h-4 w-4 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Prompt Summary</h3>
        </div>
        {hasInput ? (
          <div className="divide-y divide-slate-100">
            <SummaryRow icon={<Target className="h-4 w-4" />} label="Goal" value={data.goal || "—"} />
            <SummaryRow icon={<Tag className="h-4 w-4" />} label="Subject" value={data.subject || "—"} />
            <SummaryRow icon={<Users className="h-4 w-4" />} label="For" value={data.audience || "—"} />
            <SummaryRow
              icon={<PencilLine className="h-4 w-4" />}
              label="Format"
              value={effectiveFormat !== "auto" ? FORMAT_META[effectiveFormat].label : "Auto"}
            />
            <SummaryRow
              icon={<Smile className="h-4 w-4" />}
              label="Tone"
              value={data.tones.length ? data.tones.join(", ") : "—"}
            />
            {data.extra && (
              <SummaryRow icon={<MessageSquare className="h-4 w-4" />} label="Extra" value={data.extra} />
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Fill in the fields on the left to see your prompt take shape here.</p>
        )}
      </div>
    </section>
  );
}

// ─── Image Preview Stage ──────────────────────────────────────────────────────

function ImagePreviewStage({ imgData }: { imgData: ImageFormData }) {
  const hasInput = imgData.subject || imgData.artStyles.length || imgData.moods.length;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">Live Preview</h2>
        <p className="mt-1 text-sm text-slate-500">Selected descriptors that will shape your image prompt.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {imgData.artStyles.map((s) => (
            <RulePill key={s} color="violet">{ART_STYLE_LABELS[s]}</RulePill>
          ))}
          {imgData.moods.map((m) => (
            <RulePill key={m} color="purple">{IMAGE_MOOD_LABELS[m]}</RulePill>
          ))}
          {imgData.lighting && (
            <RulePill color="amber">{LIGHTING_LABELS[imgData.lighting]}</RulePill>
          )}
          {imgData.composition && (
            <RulePill color="indigo">{COMPOSITION_LABELS[imgData.composition]}</RulePill>
          )}
          {imgData.colorPalette !== "auto" && (
            <RulePill color="green">{COLOR_PALETTE_LABELS[imgData.colorPalette]}</RulePill>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
            <ImageIcon className="h-4 w-4 text-violet-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Image Prompt Summary</h3>
        </div>
        {hasInput ? (
          <div className="divide-y divide-slate-100">
            <SummaryRow icon={<Target className="h-4 w-4" />} label="Scene" value={imgData.subject || "—"} />
            <SummaryRow
              icon={<PencilLine className="h-4 w-4" />}
              label="Art Style"
              value={imgData.artStyles.length ? imgData.artStyles.map((s) => ART_STYLE_LABELS[s]).join(", ") : "—"}
            />
            <SummaryRow
              icon={<Smile className="h-4 w-4" />}
              label="Mood"
              value={imgData.moods.length ? imgData.moods.map((m) => IMAGE_MOOD_LABELS[m]).join(", ") : "—"}
            />
            <SummaryRow
              icon={<Sparkles className="h-4 w-4" />}
              label="Lighting"
              value={imgData.lighting ? LIGHTING_LABELS[imgData.lighting] : "—"}
            />
            <SummaryRow
              icon={<Tag className="h-4 w-4" />}
              label="Palette"
              value={COLOR_PALETTE_LABELS[imgData.colorPalette]}
            />
          </div>
        ) : (
          <p className="text-sm text-slate-400">Fill in the fields on the left to preview your image prompt descriptors here.</p>
        )}
      </div>
    </section>
  );
}

// ─── Result Stage ─────────────────────────────────────────────────────────────

function ResultStage({
  generated,
  copied,
  launchHint,
  onCopy,
  onOpenIn,
  mode,
}: {
  generated: string;
  copied: boolean;
  launchHint: "chatgpt" | "gemini" | null;
  onCopy: () => void;
  onOpenIn: (site: "chatgpt" | "gemini") => void;
  mode: "text" | "image";
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold text-slate-900">
        {mode === "image" ? "Generated Image Prompt" : "Generated Prompt"}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {mode === "image"
          ? "Ready to paste into DALL-E, Midjourney, Stable Diffusion, or any image AI."
          : "Ready to copy or send directly to an AI chat."}
      </p>

      <div className="mt-6 space-y-3">
        <div className="max-h-[420px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-700">
          <pre className="whitespace-pre-wrap break-words">{generated}</pre>
        </div>

        {/* Copy */}
        <button
          onClick={onCopy}
          className={[
            "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-110 active:scale-[0.99]",
            mode === "text"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-500/20"
              : "bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-violet-500/20",
          ].join(" ")}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Prompt"}
        </button>

        {/* Open in AI */}
        {mode === "text" ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenIn("chatgpt")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99]"
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-[#10a37f] text-[9px] font-bold text-white">G</span>
              {launchHint === "chatgpt" ? "Opening…" : "Open in ChatGPT"}
              {launchHint !== "chatgpt" && <ExternalLink className="h-3.5 w-3.5 text-slate-400" />}
            </button>
            <button
              onClick={() => onOpenIn("gemini")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99]"
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-blue-500 to-purple-500 text-[9px] font-bold text-white">G</span>
              {launchHint === "gemini" ? "Opening…" : "Open in Gemini"}
              {launchHint !== "gemini" && <ExternalLink className="h-3.5 w-3.5 text-slate-400" />}
            </button>
          </div>
        ) : (
          <button
            onClick={() => onOpenIn("chatgpt")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99]"
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-[#10a37f] text-[9px] font-bold text-white">G</span>
            {launchHint === "chatgpt" ? "Opening…" : "Try with DALL-E in ChatGPT"}
            {launchHint !== "chatgpt" && <ExternalLink className="h-3.5 w-3.5 text-slate-400" />}
          </button>
        )}

        {launchHint === "chatgpt" && mode === "text" && (
          <p className="text-center text-xs text-slate-400">
            Prompt sent to ChatGPT — it should appear in the input field automatically.
            <br />
            If it didn't load, paste with{" "}
            <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-600">Ctrl+V</kbd>
            {" "}or{" "}
            <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-600">⌘V</kbd>
          </p>
        )}
        {launchHint === "chatgpt" && mode === "image" && (
          <p className="text-center text-xs text-slate-400">
            Prompt copied — paste it into ChatGPT with DALL-E, Midjourney, or Stable Diffusion.
          </p>
        )}
        {launchHint === "gemini" && (
          <p className="text-center text-xs text-slate-400">
            Prompt copied to clipboard — paste it in Gemini with{" "}
            <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-600">Ctrl+V</kbd>
            {" "}or{" "}
            <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-600">⌘V</kbd>
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Primitives ───────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100";

function Field({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-xs font-semibold text-indigo-600">
        {n}
      </div>
      <div className="flex-1">
        <label className="mb-2 block text-sm font-semibold text-slate-800">{label}</label>
        {children}
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[24px_110px_1fr] items-start gap-4 py-3 text-sm">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <span className="font-semibold text-slate-900">{label}</span>
      <span className="break-words text-slate-600">{value}</span>
    </div>
  );
}

const RULE_PILL_COLORS: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  violet: "bg-violet-50 text-violet-700 border border-violet-200",
  purple: "bg-purple-50 text-purple-700 border border-purple-200",
  amber:  "bg-amber-50 text-amber-700 border border-amber-200",
  green:  "bg-green-50 text-green-700 border border-green-200",
};

function RulePill({ children, color = "slate" }: { children: React.ReactNode; color?: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${RULE_PILL_COLORS[color] ?? "bg-slate-100 text-slate-600"}`}>
      {children}
    </span>
  );
}
