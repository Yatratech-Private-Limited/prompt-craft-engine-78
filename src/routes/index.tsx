import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Check, Copy, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Promptsmith — craft prompts with intent" },
      { name: "description", content: "An editorial prompt builder that turns a vague idea into a structured, production-ready brief." },
      { property: "og:title", content: "Promptsmith — craft prompts with intent" },
      { property: "og:description", content: "An editorial prompt builder that turns a vague idea into a structured, production-ready brief." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  component: PromptBuilderPage,
});

const STYLES = ["Step-by-step", "Detailed", "Bullet points", "Creative"] as const;
const TONES = ["Simple", "Friendly", "Professional", "Persuasive", "Playful"] as const;

type Style = (typeof STYLES)[number];
type Tone = (typeof TONES)[number];

function buildPrompt(d: {
  goal: string;
  subject: string;
  audience: string;
  style: Style;
  tone: Tone;
  extra: string;
}) {
  const goal = d.goal.trim() || "[your request]";
  const subject = d.subject.trim() || "[topic]";
  const audience = d.audience.trim() || "[audience]";
  const extra = d.extra.trim();

  return `Act as an expert who gives practical, correct, and production-ready guidance.

Your task is to help me with the following request:
${goal}.

The main topic or subject is:
${subject}.

The output is intended for:
${audience}.

Write the answer in this style:
${d.style}.

Use this tone:
${d.tone}.
${extra ? `\nAdditional instructions:\n${extra}.\n` : ""}
Please create a high-quality final answer that:
• Directly solves the request
• Stays focused on the subject
• Matches the intended audience
• Follows the requested style and tone
• Uses practical and specific details
• Avoids generic or unnecessary explanation
• Is polished and ready to use

Return only the final answer.`;
}

const STEPS: Array<{ key: "goal" | "subject" | "audience" | "style" | "tone" | "extra"; kicker: string; label: string }> = [
  { key: "goal", kicker: "I", label: "What do you want to create?" },
  { key: "subject", kicker: "II", label: "What is the topic or subject?" },
  { key: "audience", kicker: "III", label: "Who is this for?" },
  { key: "style", kicker: "IV", label: "How should the answer be written?" },
  { key: "tone", kicker: "V", label: "Tone of voice" },
  { key: "extra", kicker: "VI", label: "Extra instructions" },
];

function PromptBuilderPage() {
  const [goal, setGoal] = useState("");
  const [subject, setSubject] = useState("");
  const [audience, setAudience] = useState("");
  const [style, setStyle] = useState<Style>("Step-by-step");
  const [tone, setTone] = useState<Tone>("Professional");
  const [extra, setExtra] = useState("");
  const [generated, setGenerated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const preview = useMemo(
    () => buildPrompt({ goal, subject, audience, style, tone, extra }),
    [goal, subject, audience, style, tone, extra],
  );

  const filled = [goal, subject, audience, extra].filter((v) => v.trim().length > 0).length + 2; // style+tone always set
  const progress = Math.round((filled / 6) * 100);

  const handleGenerate = () => {
    setGenerated(preview);
    setCopied(false);
    if (typeof document !== "undefined") {
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCopy = async () => {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main
      className="min-h-screen bg-[#0d0c0a] text-stone-200 antialiased"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* grain + glow background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(234,179,8,0.18), transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-10 sm:px-10">
        {/* topbar */}
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-stone-500">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Promptsmith
          </span>
          <span className="hidden sm:inline">No. 01 — The Builder</span>
        </div>

        {/* hero */}
        <header className="mt-16 grid gap-8 border-b border-stone-800/70 pb-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80">A craft for prompts</p>
            <h1
              className="mt-4 text-5xl leading-[0.95] tracking-tight text-stone-50 sm:text-6xl md:text-7xl"
              style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontStyle: "italic" }}
            >
              Write prompts
              <br />
              <span className="not-italic font-light text-stone-400">that actually</span>{" "}
              <span className="text-amber-300">work.</span>
            </h1>
          </div>
          <p className="text-sm leading-relaxed text-stone-400 md:col-span-4">
            Six small decisions. One structured brief. Built for people who want the model to do the right
            thing on the first try — no incantations required.
          </p>
        </header>

        {/* meta strip */}
        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 text-[11px] uppercase tracking-[0.22em] text-stone-500">
          <span>Step {filled}/6</span>
          <div className="relative h-px flex-1 min-w-[120px] bg-stone-800">
            <div
              className="absolute inset-y-0 left-0 bg-amber-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-stone-500">{progress}% drafted</span>
        </div>

        {/* main grid */}
        <div className="mt-12 grid gap-12 lg:grid-cols-12">
          {/* Builder */}
          <section className="lg:col-span-7">
            <div className="space-y-10">
              <FieldRow
                kicker={STEPS[0].kicker}
                label={STEPS[0].label}
                hint="A short phrase. The verb matters more than the noun."
              >
                <BareInput
                  value={goal}
                  onChange={setGoal}
                  placeholder="Fix backend API error"
                />
              </FieldRow>

              <FieldRow
                kicker={STEPS[1].kicker}
                label={STEPS[1].label}
                hint="Be specific. Mention the stack, the file, the symptom."
              >
                <BareInput
                  value={subject}
                  onChange={setSubject}
                  placeholder="Node.js login route returning 500 on valid creds"
                />
              </FieldRow>

              <FieldRow
                kicker={STEPS[2].kicker}
                label={STEPS[2].label}
                hint="The reader. Their level shapes the explanation."
              >
                <BareInput
                  value={audience}
                  onChange={setAudience}
                  placeholder="A backend dev, two years in"
                />
              </FieldRow>

              <FieldRow kicker={STEPS[3].kicker} label={STEPS[3].label}>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((s) => (
                    <Chip key={s} active={style === s} onClick={() => setStyle(s)}>
                      {s}
                    </Chip>
                  ))}
                </div>
              </FieldRow>

              <FieldRow kicker={STEPS[4].kicker} label={STEPS[4].label}>
                <div className="flex flex-wrap gap-2">
                  {TONES.map((t) => (
                    <Chip key={t} active={tone === t} onClick={() => setTone(t)}>
                      {t}
                    </Chip>
                  ))}
                </div>
              </FieldRow>

              <FieldRow
                kicker={STEPS[5].kicker}
                label={STEPS[5].label}
                hint="Constraints, examples, what to avoid. Optional."
              >
                <textarea
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  rows={3}
                  placeholder="Suggest likely causes, then walk through a debug sequence."
                  className="w-full resize-y border-0 border-b border-stone-800 bg-transparent py-2 text-base text-stone-100 placeholder:text-stone-600 focus:border-amber-400 focus:outline-none focus:ring-0"
                />
              </FieldRow>

              <button
                onClick={handleGenerate}
                className="group mt-4 inline-flex items-center gap-3 border-b border-amber-400/60 pb-1 text-sm uppercase tracking-[0.28em] text-amber-300 transition hover:border-amber-300 hover:text-amber-200"
              >
                <Sparkles className="h-4 w-4" />
                Forge the prompt
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </section>

          {/* Result — sticky editorial card */}
          <aside id="result" className="lg:col-span-5">
            <div className="sticky top-8">
              <div className="relative overflow-hidden rounded-sm border border-stone-800 bg-stone-950/80 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
                {/* header */}
                <div className="flex items-center justify-between border-b border-stone-800 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="text-[10px] uppercase tracking-[0.28em] text-stone-500">
                      {generated ? "Final brief" : "Live draft"}
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    disabled={!generated}
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-stone-400 transition hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                {/* body */}
                <div className="relative max-h-[70vh] overflow-y-auto">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 w-12"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(to bottom, transparent 0 22px, rgba(120,113,108,0.12) 22px 23px)",
                    }}
                  />
                  <pre
                    className="relative whitespace-pre-wrap px-6 py-6 pl-14 text-[13px] leading-[1.75] text-stone-300"
                    style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
                  >
                    {generated ?? preview}
                  </pre>
                </div>

                {/* footer */}
                <div className="flex items-center justify-between border-t border-stone-800 px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-stone-500">
                  <span>{(generated ?? preview).length} chars</span>
                  <span>{generated ? "Ready to paste" : "Updating live"}</span>
                </div>
              </div>

              <p className="mt-4 text-xs italic text-stone-500" style={{ fontFamily: "Fraunces, serif" }}>
                “A well-formed prompt is the cheapest performance boost you have.”
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function FieldRow({
  kicker,
  label,
  hint,
  children,
}: {
  kicker: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-12 md:gap-6">
      <div className="md:col-span-3">
        <div className="flex items-baseline gap-3">
          <span
            className="text-xs uppercase tracking-[0.28em] text-amber-400/70"
            style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", letterSpacing: "0.15em" }}
          >
            {kicker}
          </span>
          <span className="h-px flex-1 bg-stone-800" />
        </div>
        <h3
          className="mt-2 text-lg leading-snug text-stone-100"
          style={{ fontFamily: "Fraunces, serif", fontWeight: 400 }}
        >
          {label}
        </h3>
        {hint && <p className="mt-1 text-xs leading-relaxed text-stone-500">{hint}</p>}
      </div>
      <div className="md:col-span-9">{children}</div>
    </div>
  );
}

function BareInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border-0 border-b border-stone-800 bg-transparent py-2 text-base text-stone-100 placeholder:text-stone-600 focus:border-amber-400 focus:outline-none focus:ring-0"
    />
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-[0.15em] transition " +
        (active
          ? "border-amber-400 bg-amber-400/10 text-amber-200"
          : "border-stone-800 text-stone-400 hover:border-stone-600 hover:text-stone-200")
      }
    >
      {children}
      {active && <Check className="h-3 w-3" />}
    </button>
  );
}
