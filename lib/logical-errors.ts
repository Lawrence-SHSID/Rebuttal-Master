import errorsData from "@/content/logical-errors.json";
import examplesData from "@/content/logical-error-examples.json";

export type LogicalError = {
  id: string;
  title: string;
  explanation: string;
  simpleExplanation: string;
  exampleLines: string[];
  exampleCount: number;
  practiceable: boolean;
};

export type LogicalErrorExample = {
  id: string;
  errorId: string;
  motionText: string;
  flawedArgument: string;
};

type LogicalErrorsPayload = { errors: LogicalError[] };
type LogicalErrorExamplesPayload = { examples: LogicalErrorExample[] };

export const MAX_PRACTICE_COUNT = 10;

const errorsPayload = errorsData as LogicalErrorsPayload;
const examplesPayload = examplesData as LogicalErrorExamplesPayload;

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function getAllLogicalErrors(): LogicalError[] {
  return errorsPayload.errors;
}

/** Logical errors that have at least one practice example (7 of 8; excludes Circular Reasoning). */
export function getLogicalErrors(): LogicalError[] {
  return errorsPayload.errors.filter((e) => e.practiceable);
}

export function getLogicalErrorById(id: string): LogicalError | undefined {
  return errorsPayload.errors.find((e) => e.id === id);
}

export function isPracticeableErrorId(id: string): boolean {
  return getLogicalErrorById(id)?.practiceable === true;
}

export function getExamplesForError(errorId: string): LogicalErrorExample[] {
  return examplesPayload.examples.filter((e) => e.errorId === errorId);
}

export function getExampleCountForError(errorId: string): number {
  return getLogicalErrorById(errorId)?.exampleCount ?? 0;
}

/** Clamp requested count to 1–10 and to the number of examples available for this error. */
export function clampPracticeCount(errorId: string, count: number | string): number {
  const parsed = Number.parseInt(String(count), 10);
  const requested = Number.isNaN(parsed) ? 5 : parsed;
  const bounded = Math.min(MAX_PRACTICE_COUNT, Math.max(1, requested));
  const available = getExampleCountForError(errorId);
  if (available <= 0) return 0;
  return Math.min(bounded, available);
}

/** Random sample without replacement from the example pool for one logical error. */
export function pickPracticeExamples(
  errorId: string,
  count: number,
): LogicalErrorExample[] {
  const take = clampPracticeCount(errorId, count);
  if (take <= 0) return [];
  return shuffle(getExamplesForError(errorId)).slice(0, take);
}
