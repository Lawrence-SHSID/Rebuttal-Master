export default function LogicalErrorLoading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12">
      <div className="h-4 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-9 w-3/4 max-w-md animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-48 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      <p className="text-center text-sm text-zinc-500">Loading…</p>
    </div>
  );
}
