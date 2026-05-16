import Link from "next/link";

export default function TechniqueNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Technique not found
      </h1>
      <Link
        href="/"
        className="text-indigo-600 underline dark:text-indigo-400"
      >
        Back to home
      </Link>
    </div>
  );
}
