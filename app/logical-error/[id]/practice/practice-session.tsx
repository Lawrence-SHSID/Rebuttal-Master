"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { LogicalErrorExample } from "@/lib/logical-errors";

type Props = {
  errorId: string;
  errorTitle: string;
  items: LogicalErrorExample[];
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

export function PracticeSession({ errorId, errorTitle, items }: Props) {
  const count = items.length;
  const [index, setIndex] = useState(0);
  const [hasText, setHasText] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({ status: "idle" });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const current = items[index];
  const isLast = index >= count - 1;

  function readRebuttal(): string {
    return (textareaRef.current?.value ?? "").trim();
  }

  function syncHasText() {
    setHasText(readRebuttal().length > 0);
  }

  useEffect(() => {
    syncHasText();
  }, [index]);

  async function onFeedback() {
    const userRebuttal = readRebuttal();
    if (!current || !userRebuttal) return;
    setFeedback({ status: "loading" });
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          errorId,
          motionText: current.motionText,
          flawedArgument: current.flawedArgument,
          userRebuttal,
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
    if (textareaRef.current) textareaRef.current.value = "";
    setHasText(false);
    setFeedback({ status: "idle" });
  }

  if (!current) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/logical-error/${errorId}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          &larr; Setup
        </Link>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Question {index + 1} of {count}
        </span>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {errorTitle}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Spot this logical error and write a clear rebuttal.
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/60 p-5 dark:border-zinc-700 dark:bg-zinc-900/40">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Motion
        </h2>
        <p className="text-base leading-relaxed text-zinc-900 dark:text-zinc-100">
          {current.motionText}
        </p>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Flawed argument (for you to rebut)
          </h2>
          <p className="mt-2 text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
            {current.flawedArgument}
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
          ref={textareaRef}
          id="rebuttal"
          rows={8}
          defaultValue=""
          onInput={syncHasText}
          onChange={syncHasText}
          placeholder="Write in English. Name the logical error, explain why the argument fails, and use the motion."
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void onFeedback()}
          disabled={!hasText || feedback.status === "loading"}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {feedback.status === "loading" ? "Scoring..." : "Feedback"}
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
              / 10 &middot; {formatModelForUi(feedback.model)}
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
            Practice another logical error
          </Link>
        </p>
      ) : null}
    </div>
  );
}
