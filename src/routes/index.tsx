import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";

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

const STYLES = ["Step-by-step", "Detailed", "Bullet Points", "Creative"] as const;
const TONES = ["Simple", "Friendly", "Professional", "Persuasive", "Fun"] as const;

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

  const handleGenerate = () => {
    setGenerated(preview);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            AI Prompt Builder
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Turn a vague idea into a clear, structured prompt in seconds.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Builder */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900">Prompt Builder</h2>
            <p className="mt-1 text-sm text-slate-500">
              Describe what you need in a few simple steps.
            </p>

            <div className="mt-6 space-y-6">
              <Field n={1} label="What do you want to create?">
                <input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Fix backend API error"
                  className={inputCls}
                />
              </Field>

              <Field n={2} label="What is the topic or subject?">
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Node.js login API returning 500 error"
                  className={inputCls}
                />
              </Field>

              <Field n={3} label="Who is this for?">
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Beginner backend developer"
                  className={inputCls}
                />
              </Field>

              <Field n={4} label="How should the answer be written?">
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((s) => (
                    <Chip key={s} active={style === s} onClick={() => setStyle(s)}>
                      {s}
                    </Chip>
                  ))}
                </div>
              </Field>

              <Field n={5} label="Tone">
                <div className="flex flex-wrap gap-2">
                  {TONES.map((t) => (
                    <Chip key={t} active={tone === t} onClick={() => setTone(t)}>
                      {t}
                    </Chip>
                  ))}
                </div>
              </Field>

              <Field n={6} label="Extra instructions">
                <textarea
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  rows={3}
                  placeholder="e.g. Explain possible causes and how to debug"
                  className={`${inputCls} resize-y`}
                />
              </Field>

              <button
                onClick={handleGenerate}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:shadow-indigo-500/30 hover:brightness-110 active:scale-[0.99]"
              >
                <Sparkles className="h-4 w-4" />
                Generate Prompt
              </button>
            </div>
          </section>

          {/* Result */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {generated ? "Generated Result" : "Live Preview"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {generated
                    ? "Your prompt is ready to copy and use."
                    : "See how your prompt will be structured."}
                </p>
              </div>
              <button
                onClick={handleCopy}
                disabled={!generated}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy to Clipboard"}
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/60 p-5">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">
                {generated ?? preview}
              </pre>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100";

function Field({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-600">
        {n}
      </div>
      <div className="flex-1">
        <label className="mb-2 block text-sm font-medium text-slate-800">{label}</label>
        {children}
      </div>
    </div>
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
        "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition " +
        (active
          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
          : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50")
      }
    >
      {children}
      {active && <Check className="h-3.5 w-3.5" />}
    </button>
  );
}
