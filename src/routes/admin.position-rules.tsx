import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, RotateCcw, Save, ShieldCheck, Sparkles } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_POSITION_RULES_TEXT,
  POSITION_RULES_STORAGE_KEY,
  parsePositionRules,
} from "../prompt-engine/positionRules";

const ADMIN_USERNAME = "aashish";
const ADMIN_PASSWORD = "rootuser";
const ADMIN_SESSION_KEY = "prompt-maker.position-rules-admin";

export const Route = createFileRoute("/admin/position-rules")({
  head: () => ({
    meta: [
      { title: "Position Rules Admin" },
      {
        name: "description",
        content: "Admin portal for configuring keyword-based prompt position rules.",
      },
    ],
  }),
  component: PositionRulesAdminPage,
});

function PositionRulesAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [rulesText, setRulesText] = useState(DEFAULT_POSITION_RULES_TEXT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setIsAuthenticated(window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true");
    const savedRules = window.localStorage.getItem(POSITION_RULES_STORAGE_KEY);
    setRulesText(savedRules || DEFAULT_POSITION_RULES_TEXT);
  }, []);

  const parsedRules = useMemo(() => parsePositionRules(rulesText), [rulesText]);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      setIsAuthenticated(true);
      setAuthError(null);
      setPassword("");
      return;
    }

    setAuthError("Invalid username or password.");
  };

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:px-8">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to manage position rules.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Username
              </label>
              <input
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setAuthError(null);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Password
              </label>
              <input
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setAuthError(null);
                }}
                type="password"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                autoComplete="current-password"
              />
            </div>

            {authError && (
              <p className="text-sm font-medium text-rose-600">{authError}</p>
            )}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-110 active:scale-[0.99]"
            >
              <ShieldCheck className="h-4 w-4" />
              Login
            </button>

            <Link
              to="/"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              Back to builder
            </Link>
          </form>
        </section>
      </main>
    );
  }

  const handleSave = () => {
    window.localStorage.setItem(POSITION_RULES_STORAGE_KEY, rulesText);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleReset = () => {
    setRulesText(DEFAULT_POSITION_RULES_TEXT);
    window.localStorage.setItem(POSITION_RULES_STORAGE_KEY, DEFAULT_POSITION_RULES_TEXT);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                <h1 className="text-2xl font-bold text-slate-900">Position Rules Admin</h1>
              </div>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Set the keyword groups that decide the suggested professional position on the
                public prompt builder.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              Back to builder
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            <label className="block text-sm font-semibold text-slate-800">
              Rule list
            </label>
            <textarea
              value={rulesText}
              onChange={(event) => setRulesText(event.target.value)}
              rows={10}
              className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-xs leading-relaxed text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="Recommended Position = keyword, keyword, keyword"
            />
            <p className="text-xs text-slate-500">
              Use one rule per line. Separate the recommended position from words with
              <span className="font-mono"> = </span>
              or
              <span className="font-mono"> : </span>
              .
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-110 active:scale-[0.99]"
            >
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? "Saved" : "Save Rules"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99]"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Defaults
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Parsed Rules</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {parsedRules.length ? (
              parsedRules.map((rule) => (
                <div
                  key={rule.position}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-sm font-semibold text-slate-900">{rule.position}</p>
                  <p className="mt-1 break-words text-xs text-slate-500">
                    {rule.words.join(", ")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                No valid rules yet. Add lines like UI/UX Designer = ui, ux, design.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
