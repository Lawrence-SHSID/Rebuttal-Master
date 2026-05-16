import Link from "next/link";
import { notFound } from "next/navigation";

import {
  clampPracticeCount,
  getLogicalErrorById,
  getLogicalErrors,
  MAX_PRACTICE_COUNT,
} from "@/lib/logical-errors";

type PageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return getLogicalErrors().map((e) => ({ id: e.id }));
}

export default async function LogicalErrorExplainPage({ params }: PageProps) {
  const { id } = await params;
  const error = getLogicalErrorById(id);
  if (!error?.practiceable) notFound();

  const maxCount = clampPracticeCount(id, MAX_PRACTICE_COUNT);
  const defaultCount = Math.min(5, maxCount);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-12">
      <div>
        <Link
          href="/"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          ← Back
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          {error.title}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Classical logical error
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/80 p-6 dark:border-zinc-700 dark:bg-zinc-900/50">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Explanation
        </h2>
        <p className="leading-relaxed text-zinc-800 dark:text-zinc-200">
          {error.explanation}
        </p>
        <h2 className="pt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Simple way to spot it
        </h2>
        <p className="leading-relaxed text-zinc-800 dark:text-zinc-200">
          {error.simpleExplanation}
        </p>
        {error.exampleLines.length ? (
          <>
            <h2 className="pt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Example
            </h2>
            <div className="space-y-2 leading-relaxed text-zinc-800 dark:text-zinc-200">
              {error.exampleLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </>
        ) : null}
      </section>

      <form
        method="get"
        action={`/logical-error/${error.id}/practice`}
        className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Question bank: {error.exampleCount} motion{error.exampleCount === 1 ? "" : "s"}{" "}
          with this error type.
        </p>
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Number of practice items (1–{maxCount})
          <input
            type="number"
            name="count"
            min={1}
            max={maxCount}
            defaultValue={defaultCount}
            required
            className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <button
          type="submit"
          className="w-fit rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Start practice
        </button>
      </form>
    </div>
  );
}
