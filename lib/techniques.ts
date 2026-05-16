import techniquesData from "@/content/techniques.json";

export type TechniqueSource = "pdf" | "common";

export type DebateTechnique = {
  id: string;
  source: TechniqueSource;
  pdfNumber: number | null;
  category: string;
  title: string;
  shortDefinition: string;
  howToSpot: string;
  howToRebut: string;
  caution?: string;
};

export type TechniquesPayload = {
  version: number;
  sourcePdf: string;
  techniques: DebateTechnique[];
};

const payload = techniquesData as TechniquesPayload;

export function getTechniquesPayload(): TechniquesPayload {
  return payload;
}

export function getTechniques(): DebateTechnique[] {
  return payload.techniques;
}

export function getTechniqueById(id: string): DebateTechnique | undefined {
  return payload.techniques.find((t) => t.id === id);
}
