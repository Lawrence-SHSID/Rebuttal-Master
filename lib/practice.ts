import flawTemplatesData from "@/content/flaw-templates.json";
import motionsData from "@/content/motions.json";

export type Stance = "pro" | "con";

export type Motion = {
  id: string;
  text: string;
  format: string;
  sourceName: string;
  sourceUrl: string | null;
  number?: number;
  sourceFile?: string;
};

export type PracticeItem = {
  id: string;
  techniqueId: string;
  motionId: string;
  stance: Stance;
  flawedArgument: string;
};

type MotionsPayload = { version: number; motions: Motion[] };
type FlawTemplatesPayload = {
  version: number;
  templates: Record<string, string[]>;
};

const motionsPayload = motionsData as MotionsPayload;
const flawPayload = flawTemplatesData as FlawTemplatesPayload;

const motions = motionsPayload.motions;
const motionById = new Map(motions.map((m) => [m.id, m]));
const templatesByTechnique = flawPayload.templates;

/** Short label for embedding flawed args; strip trailing punctuation to avoid "media., I" */
function clipMotion(s: string, n = 110): string {
  const t = s.replace(/\s+/g, " ").trim().replace(/[.!?]+$/g, "");
  return t.length <= n ? t : `${t.slice(0, n - 3)}...`;
}

/** Fisher–Yates shuffle copy */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getMotions(): Motion[] {
  return motions;
}

export function getEsdpMotions(): Motion[] {
  return motions.filter((m) => m.id.startsWith("esdp-"));
}

export function getWsdaImpromptuMotions(): Motion[] {
  return motions.filter((m) => m.id.startsWith("wsda-impromptu-"));
}

export function getMotionById(id: string): Motion | undefined {
  return motionById.get(id);
}

function buildItem(
  techniqueId: string,
  motion: Motion,
  motionIndex: number,
): PracticeItem {
  const lines = templatesByTechnique[techniqueId];
  if (!lines?.length) {
    throw new Error(`Missing flaw templates for technique ${techniqueId}`);
  }
  const template = lines[motionIndex % lines.length];
  const flawedArgument = template.replaceAll(
    "__M__",
    clipMotion(motion.text),
  );
  return {
    id: `${techniqueId}::${motion.id}::${motionIndex % lines.length}`,
    techniqueId,
    motionId: motion.id,
    stance: motionIndex % 2 === 0 ? "pro" : "con",
    flawedArgument,
  };
}

/** All (motion × template-variant) items for one technique — used for full pool / sampling. */
export function getItemsForTechnique(techniqueId: string): PracticeItem[] {
  return motions.map((motion, i) => buildItem(techniqueId, motion, i));
}

/**
 * Pick up to `count` practice items (1–10). Motions are shuffled so different runs mix ESDP and international topics.
 * Pool size = all motions (~300+), so 10 unique items are usually available without repetition.
 */
export function pickPracticeItems(
  techniqueId: string,
  count: number,
): PracticeItem[] {
  const n = Math.min(10, Math.max(1, Math.floor(count)));
  const shuffledMotions = shuffle(motions);
  return shuffledMotions.slice(0, n).map((motion, i) => buildItem(techniqueId, motion, i));
}

export function hydrateItem(item: PracticeItem): {
  item: PracticeItem;
  motion: Motion;
} {
  const motion = motionById.get(item.motionId);
  if (!motion) {
    throw new Error(`Missing motion ${item.motionId}`);
  }
  return { item, motion };
}
