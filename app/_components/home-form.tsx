"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { LogicalError } from "@/lib/logical-errors";

type Props = {
  errors: LogicalError[];
};

export function HomeForm({ errors }: Props) {
  const router = useRouter();
  const [id, setId] = useState(errors[0]?.id ?? "");

  useEffect(() => {
    if (!id) return;
    router.prefetch(`/logical-error/${id}`);
  }, [id, router]);

  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Choose a logical error to practice
        <select
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          value={id}
          onChange={(e) => setId(e.target.value)}
        >
          {errors.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </label>
      <Link
        href={id ? `/logical-error/${id}` : "#"}
        prefetch
        aria-disabled={!id}
        className="rounded-lg bg-indigo-600 px-4 py-3 text-center text-base font-semibold text-white shadow-sm transition hover:bg-indigo-500 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        onClick={(e) => {
          if (!id) e.preventDefault();
        }}
      >
        Continue
      </Link>
    </div>
  );
}
