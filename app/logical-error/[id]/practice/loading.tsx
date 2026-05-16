export default function PracticeLoading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12">
      <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-8 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-48 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      <p className="text-center text-sm text-zinc-500">Loading practice…</p>
    </div>
  );
}
