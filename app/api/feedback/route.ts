import { NextResponse } from "next/server";

import { getLogicalErrorById } from "@/lib/logical-errors";
import { scoreRebuttal } from "@/lib/openrouter-feedback";

const MAX_LEN = 8000;

type Body = {
  errorId?: string;
  motionText?: string;
  flawedArgument?: string;
  userRebuttal?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const errorId = String(body.errorId ?? "").trim();
  const motionText = String(body.motionText ?? "").trim();
  const flawedArgument = String(body.flawedArgument ?? "").trim();
  const userRebuttal = String(body.userRebuttal ?? "").trim();

  if (!errorId || !motionText || !flawedArgument) {
    return NextResponse.json(
      { error: "errorId, motionText, and flawedArgument are required" },
      { status: 400 },
    );
  }
  if (!userRebuttal) {
    return NextResponse.json(
      { error: "userRebuttal is required" },
      { status: 400 },
    );
  }
  if (userRebuttal.length > MAX_LEN || flawedArgument.length > MAX_LEN) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  const error = getLogicalErrorById(errorId);
  if (!error) {
    return NextResponse.json({ error: "Unknown logical error" }, { status: 400 });
  }

  try {
    const { model: usedModel, feedback } = await scoreRebuttal({
      errorTitle: error.title,
      errorExplanation: error.explanation,
      simpleExplanation: error.simpleExplanation,
      motionText,
      flawedArgument,
      userRebuttal,
    });
    return NextResponse.json({ model: usedModel, ...feedback });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Feedback failed";
    const isKey = msg.includes("OPENROUTER_API_KEY");
    return NextResponse.json(
      {
        error: isKey
          ? "Missing OPENROUTER_API_KEY. Add it to web/.env.local (see .env.example), save, then restart npm run dev."
          : msg,
      },
      { status: isKey ? 503 : 502 },
    );
  }
}
