import { OpenRouter } from "@openrouter/sdk";

import { resolveFeedbackModel } from "@/lib/model-options";

export type FeedbackInput = {
  techniqueTitle: string;
  techniqueSummary: string;
  motionText: string;
  stance: "pro" | "con";
  flawedArgument: string;
  userRebuttal: string;
};

export type FeedbackResult = {
  score: number;
  analysis: string;
  strengths: string[];
  suggestions: string[];
};

function getClient() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  return new OpenRouter({
    apiKey: key,
    appTitle: "Rebuttal Master",
  });
}

const SYSTEM = `You are an experienced English debate coach for upper-primary and middle-school students.
Return ONLY valid JSON (no markdown fences) with this shape:
{"score":<1-10 integer>,"analysis":"<2-5 sentences>","strengths":["<short>","..."],"suggestions":["<short>","..."]}
Rules:
- score: integer 1–10 for how effective the student's rebuttal is against the flawed argument, given the motion and their assigned side (pro/con).
- analysis: specific, encouraging, plain English; mention logic, clash, and whether they addressed the flaw.
- strengths / suggestions: max 4 items each, short strings.
- Do not quote the entire motion; stay under 400 words total JSON value length if possible.`;

function buildUserMessage(input: FeedbackInput): string {
  const side =
    input.stance === "pro"
      ? "Proposition (support the motion)"
      : "Opposition (oppose the motion)";
  return `Debate technique being practiced: ${input.techniqueTitle}
Technique notes: ${input.techniqueSummary}

Motion: ${input.motionText}

Student side: ${side}

Opponent's flawed argument (for practice — it deliberately misuses rhetoric or logic):
${input.flawedArgument}

Student's rebuttal:
${input.userRebuttal}

Evaluate the rebuttal and output JSON only.`;
}

function parseFeedbackJson(raw: string): FeedbackResult {
  const trimmed = raw.trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      parsed = JSON.parse(trimmed.slice(start, end + 1));
    } else {
      throw new Error("Model did not return JSON");
    }
  }
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid JSON shape");
  const o = parsed as Record<string, unknown>;
  const score = Number(o.score);
  if (!Number.isInteger(score) || score < 1 || score > 10) {
    throw new Error("Invalid score");
  }
  const analysis = String(o.analysis ?? "").trim();
  if (!analysis) throw new Error("Missing analysis");
  const strengths = Array.isArray(o.strengths)
    ? o.strengths.map((s) => String(s).trim()).filter(Boolean)
    : [];
  const suggestions = Array.isArray(o.suggestions)
    ? o.suggestions.map((s) => String(s).trim()).filter(Boolean)
    : [];
  return { score, analysis, strengths, suggestions };
}

export async function scoreRebuttal(
  input: FeedbackInput,
): Promise<{ model: string; feedback: FeedbackResult }> {
  const model = resolveFeedbackModel();
  const client = getClient();
  const res = await client.chat.send({
    chatRequest: {
      model,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildUserMessage(input) },
      ],
      maxCompletionTokens: 900,
      temperature: 0.4,
    },
  });
  const content = res.choices[0]?.message?.content;
  const text =
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content
            .map((c) => ("text" in c && c.text ? String(c.text) : ""))
            .join("")
        : "";
  if (!text) throw new Error("Empty model response");
  return { model, feedback: parseFeedbackJson(text) };
}
