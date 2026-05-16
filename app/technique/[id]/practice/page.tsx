import Link from "next/link";
import { notFound } from "next/navigation";

import { PracticeSession } from "./practice-session";
import { getTechniqueById } from "@/lib/techniques";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ count?: string }>;
};

function clampCount(raw: string | undefined): number {
  const n = Number.parseInt(String(raw ?? "5"), 10);
  if (Number.isNaN(n)) return 5;
  return Math.min(10, Math.max(1, n));
}

export default async function PracticePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const technique = getTechniqueById(id);
  if (!technique) notFound();
  const count = clampCount(sp.count);

  return (
    <div>
      <PracticeSession
        key={`${technique.id}-${count}`}
        techniqueId={technique.id}
        techniqueTitle={technique.title}
        count={count}
      />
      <p className="mx-auto max-w-2xl px-4 pb-12 text-center text-xs text-zinc-500">
        <Link href="/" className="text-indigo-600 dark:text-indigo-400">
          Home
        </Link>
      </p>
    </div>
  );
}
