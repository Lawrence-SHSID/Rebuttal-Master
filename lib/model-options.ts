/**
 * Default OpenRouter model for rebuttal feedback (NVIDIA Nemotron 3 Super).
 * Override anytime with env OPENROUTER_MODEL (e.g. nvidia/nemotron-3-super-120b-a12b:free).
 */
export const FEEDBACK_MODEL_DEFAULT = "nvidia/nemotron-3-super-120b-a12b";

export const FEEDBACK_MODEL_LABEL = "NVIDIA Nemotron 3 Super";

export function resolveFeedbackModel(): string {
  const fromEnv = process.env.OPENROUTER_MODEL?.trim();
  return fromEnv || FEEDBACK_MODEL_DEFAULT;
}
