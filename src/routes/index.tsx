import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  FileText,
  MessageSquare,
  PencilLine,
  Smile,
  Sparkles,
  Tag,
  Target,
  Users,
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

const STYLES = ["Short", "Detailed", "Bullet Points", "Creative"] as const;
const TONES = ["Simple", "Friendly", "Professional", "Persuasive", "Fun"] as const;

type Style = (typeof STYLES)[number];
type Tone = (typeof TONES)[number];

type FormData = {
  goal: string;
  subject: string;
  audience: string;
  styles: Style[];
  tones: Tone[];
  extra: string;
};

function buildStructuredPrompt(d: FormData) {
  const goal = d.goal.trim() || "[your request]";
  const subject = d.subject.trim() || "[topic]";
  const audience = d.audience.trim() || "[audience]";
  const extra = d.extra.trim();
  const styleStr = d.styles.length ? d.styles.join(", ") : "Detailed";
  const toneStr = d.tones.length ? d.tones.join(", ") : "Professional";

  return `Act as a senior software engineer who gives practical, correct, and production-ready guidance.

Your task is to help me with the following request:
${goal}.

The main topic or subject is:
${subject}.

The output is intended for:
${audience}.

Write the answer in this style:
${styleStr}.

Use this tone:
${toneStr}.
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

function buildNaturalPreview(d: FormData) {
  const goal = d.goal.trim();
  const subject = d.subject.trim();
  const audience = d.audience.trim();
  const extra = d.extra.trim();
  const styleStr = d.styles.length ? d.styles.join(" and ").toLowerCase() : "";
  const toneStr = d.tones.length ? d.tones.join(" and ").toLowerCase() : "";

  if (!goal && !subject && !audience) {
    return "Fill in the steps on the left to see your prompt take shape here.";
  }

  const toneStyle = [toneStr, styleStr].filter(Boolean).join(" and ");
  const pieces: string[] = [];
  pieces.push(
    `Create a ${toneStyle || "clear"} ${goal || "[request]"}${subject ? ` about ${subject.toLowerCase()}` : ""}.`,
  );
  if (audience) pieces.push(`Speak to ${audience.toLowerCase()}.`);
  if (styleStr) pieces.push(`Keep it ${styleStr}.`);
  if (extra) pieces.push(`${extra}.`);
  return pieces.join(" ");
}

function PromptBuilderPage() {
  const [goal, setGoal] = useState("");
  const [subject, setSubject] = useState("");
  const [audience, setAudience] = useState("");
  const [styles, setStyles] = useState<Style[]>(["Short", "Creative"]);
  const [tones, setTones] = useState<Tone[]>(["Friendly", "Persuasive"]);
  const [extra, setExtra] = useState("");
  const [generated, setGenerated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const data: FormData = { goal, subject, audience, styles, tones, extra };
  const natural = useMemo(() => buildNaturalPreview(data), [data]);

  const toggle = <T,>(arr: T[], v: T, setter: (next: T[]) => void) => {
    setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  const handleGenerate = () => {
    setGenerated(buildStructuredPrompt(data));
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
        {/* ============ LEFT: BUILDER ============ */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">Prompt Builder</h2>
          <p className="mt-1 text-sm text-slate-500">
            Describe what you need in a few simple steps.
          </p>

          <div className="mt-8 space-y-6">
            <Field n={1} label="What do you want to create?">
              <input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Facebook ad for my bakery"
                className={inputCls}
              />
            </Field>

            <Field n={2} label="What is the topic or subject?">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Fresh bakery products"
                className={inputCls}
              />
            </Field>

            <Field n={3} label="Who is this for?">
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Local families near Kathmandu"
                className={inputCls}
              />
            </Field>

            <Field n={4} label="How should the answer be written?">
              <div className="flex flex-wrap gap-2.5">
                {STYLES.map((s) => (
                  <Chip
                    key={s}
                    active={styles.includes(s)}
                    onClick={() => toggle(styles, s, setStyles)}
                  >
                    {s}
                  </Chip>
                ))}
              </div>
            </Field>

            <Field n={5} label="Tone">
              <div className="flex flex-wrap gap-2.5">
                {TONES.map((t) => (
                  <Chip
                    key={t}
                    active={tones.includes(t)}
                    onClick={() => toggle(tones, t, setTones)}
                  >
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
                placeholder="Generate 3 ad variations with catchy headlines"
                className={`${inputCls} resize-y`}
              />
            </Field>

            <button
              onClick={handleGenerate}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 active:scale-[0.99]"
            >
              <Sparkles className="h-4 w-4" />
              Generate Prompt
            </button>
          </div>
        </section>

        {/* ============ RIGHT: STAGE 1 or STAGE 2 ============ */}
        {generated ? (
          <ResultStage generated={generated} copied={copied} onCopy={handleCopy} />
        ) : (
          <PreviewStage data={data} natural={natural} />
        )}
      </div>
    </main>
  );
}

/* ---------- Stage 1: Live Preview ---------- */
function PreviewStage({ data, natural }: { data: FormData; natural: string }) {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">Live Preview</h2>
        <p className="mt-1 text-sm text-slate-500">See how your prompt will be structured.</p>
      </div>

      {/* Prompt Summary */}
      <Card>
        <CardHeader icon={<FileText className="h-4 w-4 text-indigo-600" />} title="Prompt Summary" />
        <div className="mt-5 divide-y divide-slate-100">
          <SummaryRow
            icon={<Target className="h-4 w-4" />}
            label="Goal"
            value={data.goal ? `Create a ${data.goal.toLowerCase()}` : "—"}
          />
          <SummaryRow
            icon={<Tag className="h-4 w-4" />}
            label="Subject"
            value={data.subject || "—"}
          />
          <SummaryRow
            icon={<Users className="h-4 w-4" />}
            label="For"
            value={data.audience || "—"}
          />
          <SummaryRow
            icon={<PencilLine className="h-4 w-4" />}
            label="Style"
            value={data.styles.length ? data.styles.join(", ") : "—"}
          />
          <SummaryRow
            icon={<Smile className="h-4 w-4" />}
            label="Tone"
            value={data.tones.length ? data.tones.join(", ") : "—"}
          />
          <SummaryRow
            icon={<FileText className="h-4 w-4" />}
            label="Extra"
            value={data.extra || "—"}
          />
        </div>
      </Card>

      {/* Prompt Preview */}
      <Card>
        <CardHeader
          icon={<MessageSquare className="h-4 w-4 text-indigo-600" />}
          title="Prompt Preview"
        />
        <p className="mt-4 text-[15px] leading-relaxed text-slate-700">{natural}</p>
      </Card>
    </section>
  );
}

/* ---------- Stage 2: Generated Result ---------- */
function ResultStage({
  generated,
  copied,
  onCopy,
}: {
  generated: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold text-slate-900">Generated Result</h2>
      <p className="mt-1 text-sm text-slate-500">Your prompt is ready to copy and use.</p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex justify-end">
          <button
            onClick={onCopy}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy to Clipboard"}
          </button>
        </div>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">
          {generated}
        </pre>
      </div>
    </section>
  );
}

/* ---------- shared bits ---------- */
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

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">{children}</div>
  );
}

function CardHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[24px_110px_1fr] items-start gap-4 py-3 text-sm">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <span className="font-semibold text-slate-900">{label}</span>
      <span className="text-slate-600">{value}</span>
    </div>
  );
}
