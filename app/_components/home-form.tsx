"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { DebateTechnique } from "@/lib/techniques";

type Props = {
  techniques: DebateTechnique[];
};

export function HomeForm({ techniques }: Props) {
  const router = useRouter();
  const [id, setId] = useState(techniques[0]?.id ?? "");

  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Choose a technique to practice
        <select
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          value={id}
          onChange={(e) => setId(e.target.value)}
        >
          {techniques.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="rounded-lg bg-indigo-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-50"
        disabled={!id}
        onClick={() => router.push(`/technique/${id}`)}
      >
        Continue
      </button>
    </div>
  );
}
