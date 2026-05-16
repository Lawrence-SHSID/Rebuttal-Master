"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { hydrateItem, pickPracticeItems } from "@/lib/practice";

type Props = {
  techniqueId: string;
  techniqueTitle: string;
  count: number;
};

type FeedbackState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "ok";
      score: number;
      analysis: string;
      strengths: string[];
      suggestions: string[];
      model: string;
    }
  | { status: "error"; message: string };

function formatModelForUi(modelId: string): string {
  if (modelId.includes("nemotron-3-super")) {
    return "NVIDIA Nemotron 3 Super";
  }
  return modelId;
}

export function PracticeSession({
  techniqueId,
  techniqueTitle,
  count,
}: Props) {
  const items = useMemo(
    () => pickPracticeItems(techniqueId, count),
    [techniqueId, count],
  );
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>({ status: "idle" });

  const current = items[index];
  const hydrated = useMemo(() => {
    if (!current) return null;
    return hydrateItem(current);
  }, [current]);

  const isLast = index >= items.length - 1;

  async function onFeedback() {
    if (!hydrated || !draft.trim()) return;
    setFeedback({ status: "loading" });
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          techniqueId,
          motionText: hydrated.motion.text,
          stance: hydrated.item.stance,
          flawedArgument: hydrated.item.flawedArgument,
          userRebuttal: draft.trim(),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        score?: number;
        analysis?: string;
        strengths?: string[];
        suggestions?: string[];
        model?: string;
      };
      if (!res.ok) {
        setFeedback({
          status: "error",
          message: data.error ?? `Request failed (${res.status})`,
        });
        return;
      }
      setFeedback({
        status: "ok",
        score: data.score ?? 0,
        analysis: data.analysis ?? "",
        strengths: data.strengths ?? [],
        suggestions: data.suggestions ?? [],
        model: data.model ?? "",
      });
    } catch {
      setFeedback({ status: "error", message: "Network error" });
    }
  }

  function nextQuestion() {
    if (isLast) return;
    setIndex((i) => i + 1);
    setDraft("");
    setFeedback({ status: "idle" });
  }

  if (!hydrated) {
    return null;
  }

  const { motion, item } = hydrated;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/technique/${techniqueId}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          ← Technique & setup
        </Link>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Question {index + 1} of {items.length}
        </span>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {techniqueTitle}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Motion source: {motion.sourceName}
          {motion.sourceUrl ? (
            <>
              {" · "}
              <a
                href={motion.sourceUrl}
                className="text-indigo-600 underline dark:text-indigo-400"
                target="_blank"
                rel="noreferrer"
              >
                link
              </a>
            </>
          ) : null}
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/60 p-5 dark:border-zinc-700 dark:bg-zinc-900/40">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Motion
        </h2>
        <p className="text-base leading-relaxed text-zinc-900 dark:text-zinc-100">
          {motion.text}
        </p>
        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
          Your side:{" "}
          {item.stance === "pro"
            ? "Proposition — defend the motion"
            : "Opposition — argue against the motion"}
        </p>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Opponent&apos;s flawed argument (for you to rebut)
          </h2>
          <p className="mt-2 text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
            {item.flawedArgument}
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="rebuttal"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Your rebuttal
        </label>
        <textarea
          id="rebuttal"
          rows={8}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write in English. Point out the flaw, use the motion, and stay respectful."
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onFeedback}
          disabled={!draft.trim() || feedback.status === "loading"}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {feedback.status === "loading" ? "Scoring…" : "Feedback"}
        </button>
        {feedback.status === "ok" ? (
          <button
            type="button"
            onClick={nextQuestion}
            disabled={isLast}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            {isLast ? "Finished" : "Next question"}
          </button>
        ) : null}
      </div>

      {feedback.status === "error" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {feedback.message}
        </p>
      ) : null}

      {feedback.status === "ok" ? (
        <section className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/30">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">
              {feedback.score}
            </span>
            <span className="text-sm text-emerald-800/80 dark:text-emerald-200/80">
              / 10 · {formatModelForUi(feedback.model)}
            </span>
          </div>
          <p className="leading-relaxed text-zinc-900 dark:text-zinc-100">
            {feedback.analysis}
          </p>
          {feedback.strengths.length ? (
            <div>
              <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                Strengths
              </h3>
              <ul className="mt-1 list-inside list-disc text-sm text-zinc-800 dark:text-zinc-200">
                {feedback.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {feedback.suggestions.length ? (
            <div>
              <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                Suggestions
              </h3>
              <ul className="mt-1 list-inside list-disc text-sm text-zinc-800 dark:text-zinc-200">
                {feedback.suggestions.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {isLast && feedback.status === "ok" ? (
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Session complete.{" "}
          <Link href="/" className="font-medium text-indigo-600 dark:text-indigo-400">
            Practice another technique
          </Link>
        </p>
      ) : null}
    </div>
  );
}
