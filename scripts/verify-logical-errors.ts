import {
  clampPracticeCount,
  getExamplesForError,
  getLogicalErrors,
  pickPracticeExamples,
} from "../lib/logical-errors";

const list = getLogicalErrors();
console.log("practiceable:", list.length);
console.log("ids:", list.map((e) => e.id).join(", "));

const strawId = "straw-man-attack";
console.log("straw pool:", getExamplesForError(strawId).length);
console.log("straw clamp(10):", clampPracticeCount(strawId, 10));
console.log(
  "straw pick(2) ids:",
  pickPracticeExamples(strawId, 2).map((e) => e.id).join(", "),
);

console.log(
  "circular pick(5):",
  pickPracticeExamples("circular-reasoning", 5).length,
);

console.log("OK");
