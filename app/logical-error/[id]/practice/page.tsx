import Link from "next/link";
import { notFound } from "next/navigation";

import { PracticeSession } from "./practice-session";
import {
  clampPracticeCount,
  getLogicalErrorById,
  pickPracticeExamples,
} from "@/lib/logical-errors";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ count?: string }>;
};

export default async function PracticePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const error = getLogicalErrorById(id);
  if (!error?.practiceable) notFound();

  const count = clampPracticeCount(id, sp.count ?? "5");
  if (count <= 0) notFound();

  const items = pickPracticeExamples(id, count);

  return (
    <div>
      <PracticeSession
        key={`${id}-${items.map((i) => i.id).join(",")}`}
        errorId={error.id}
        errorTitle={error.title}
        items={items}
      />
      <p className="mx-auto max-w-2xl px-4 pb-12 text-center text-xs text-zinc-500">
        <Link href="/" className="text-indigo-600 dark:text-indigo-400">
          Home
        </Link>
      </p>
    </div>
  );
}
