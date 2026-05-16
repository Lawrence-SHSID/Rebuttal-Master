import { NextResponse } from "next/server";

import { getTechniqueById } from "@/lib/techniques";
import { scoreRebuttal } from "@/lib/openrouter-feedback";

const MAX_LEN = 8000;

type Body = {
  techniqueId?: string;
  motionText?: string;
  stance?: string;
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

  const techniqueId = String(body.techniqueId ?? "").trim();
  const motionText = String(body.motionText ?? "").trim();
  const stance = body.stance === "con" ? "con" : "pro";
  const flawedArgument = String(body.flawedArgument ?? "").trim();
  const userRebuttal = String(body.userRebuttal ?? "").trim();

  if (!techniqueId || !motionText || !flawedArgument) {
    return NextResponse.json(
      { error: "techniqueId, motionText, and flawedArgument are required" },
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

  const technique = getTechniqueById(techniqueId);
  if (!technique) {
    return NextResponse.json({ error: "Unknown technique" }, { status: 400 });
  }

  try {
    const { model: usedModel, feedback } = await scoreRebuttal({
      techniqueTitle: technique.title,
      techniqueSummary: `${technique.shortDefinition} ${technique.howToSpot}`,
      motionText,
      stance,
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
          ? "Missing OPENROUTER_API_KEY. Add it to web/.env.local (see .env.example), save, then restart npm run dev. If the key is in the parent folder, use ../.env.local or rely on next.config merge."
          : msg,
      },
      { status: isKey ? 503 : 502 },
    );
  }
}
