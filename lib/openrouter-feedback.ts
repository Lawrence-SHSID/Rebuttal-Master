import { OpenRouter } from "@openrouter/sdk";

import { resolveFeedbackModel } from "@/lib/model-options";

export type FeedbackInput = {
  errorTitle: string;
  errorExplanation: string;
  simpleExplanation: string;
  motionText: string;
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
- score: integer 1–10 for how effectively the student identifies and rebuts the logical error in the opponent's argument, given the motion.
- analysis: specific, encouraging, plain English; mention whether they named the flaw, explained the gap in reasoning, and used the motion.
- strengths / suggestions: max 4 items each, short strings.
- Do not quote the entire motion; stay under 400 words total JSON value length if possible.`;

function buildUserMessage(input: FeedbackInput): string {
  return `Logical error being practiced: ${input.errorTitle}
Explanation: ${input.errorExplanation}
How to spot it: ${input.simpleExplanation}

Motion: ${input.motionText}

Opponent's flawed argument (contains the logical error above):
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
