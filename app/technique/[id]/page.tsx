import Link from "next/link";
import { notFound } from "next/navigation";

import { getTechniqueById } from "@/lib/techniques";

type PageProps = { params: Promise<{ id: string }> };

export default async function TechniqueExplainPage({ params }: PageProps) {
  const { id } = await params;
  const technique = getTechniqueById(id);
  if (!technique) notFound();

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
          {technique.title}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {technique.source === "pdf" ? "From tactics PDF" : "Common logical pattern"}
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/80 p-6 dark:border-zinc-700 dark:bg-zinc-900/50">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          What it is
        </h2>
        <p className="leading-relaxed text-zinc-800 dark:text-zinc-200">
          {technique.shortDefinition}
        </p>
        <h2 className="pt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          How to spot it
        </h2>
        <p className="leading-relaxed text-zinc-800 dark:text-zinc-200">
          {technique.howToSpot}
        </p>
        <h2 className="pt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          How to rebut it
        </h2>
        <p className="leading-relaxed text-zinc-800 dark:text-zinc-200">
          {technique.howToRebut}
        </p>
        {technique.caution ? (
          <p className="border-t border-zinc-200 pt-4 text-sm text-amber-800 dark:border-zinc-600 dark:text-amber-200/90">
            Note: {technique.caution}
          </p>
        ) : null}
      </section>

      <form
        method="get"
        action={`/technique/${technique.id}/practice`}
        className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
      >
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Number of practice items (1–10)
          <input
            type="number"
            name="count"
            min={1}
            max={10}
            defaultValue={5}
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
