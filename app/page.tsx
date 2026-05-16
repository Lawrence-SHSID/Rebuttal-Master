import Link from "next/link";

import { HomeForm } from "@/app/_components/home-form";
import { getTechniques } from "@/lib/techniques";

export default function Home() {
  const techniques = getTechniques();

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-16 sm:py-24">
      <div className="flex w-full max-w-2xl flex-col items-center gap-10 text-center sm:items-stretch sm:text-left">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            Rebuttal Master
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Practice English rebuttals
          </h1>
          <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Pick a debate tactic, read how it works, then answer flawed
            arguments on real motions. Get AI feedback on your rebuttal.
          </p>
        </div>
        <HomeForm techniques={techniques} />
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-500 sm:text-left">
          Feedback uses NVIDIA Nemotron 3 Super via OpenRouter — add{" "}
          <code className="rounded bg-zinc-200 px-1 py-0.5 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
            OPENROUTER_API_KEY
          </code>{" "}
          in{" "}
          <code className="rounded bg-zinc-200 px-1 py-0.5 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
            .env.local
          </code>
          . Optional: set{" "}
          <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">OPENROUTER_MODEL</code>{" "}
          to override the default model id. See{" "}
          <Link
            className="text-indigo-600 underline hover:text-indigo-500 dark:text-indigo-400"
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noreferrer"
          >
            openrouter.ai/keys
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
