"""Parse Classical Logical Errors + Logical_Error_Examples docx -> content/*.json"""
from __future__ import annotations

import json
import re
import unicodedata
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
WEB = REPO / "web"
CLASSICAL_DOCX = REPO / "Classical Logical Errors.docx"
EXAMPLES_DOCX = REPO / "Logical_Error_Examples.docx"
OUT_ERRORS = WEB / "content" / "logical-errors.json"
OUT_EXAMPLES = WEB / "content" / "logical-error-examples.json"

W_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

ERROR_CATALOG: list[tuple[str, str]] = [
    ("Straw Man Attack", "straw-man-attack"),
    ("Hasty Generalization", "hasty-generalization"),
    ("False Cause", "false-cause"),
    ("Slippery Slope", "slippery-slope"),
    ("Black-or-White Thinking", "black-or-white-thinking"),
    ("Circular Reasoning", "circular-reasoning"),
    ("Overstatement / Exaggeration", "overstatement-exaggeration"),
    ("Missing Link", "missing-link"),
]

TITLE_BY_ID = {eid: title for title, eid in ERROR_CATALOG}
ID_BY_TITLE = {title: eid for title, eid in ERROR_CATALOG}


def normalize_text(s: str) -> str:
    s = unicodedata.normalize("NFKC", s)
    s = (
        s.replace("\u2019", "'")
        .replace("\u2018", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\uff02", '"')
    )
    s = re.sub(r"\s+", " ", s).strip()
    return s


def docx_paragraphs(path: Path) -> list[str]:
    if not path.is_file():
        raise SystemExit(f"Missing file: {path}")
    with zipfile.ZipFile(path) as zf:
        xml = zf.read("word/document.xml")
    root = ET.fromstring(xml)
    paras: list[str] = []
    for p in root.iter(f"{W_NS}p"):
        parts = [t.text or "" for t in p.iter(f"{W_NS}t")]
        line = normalize_text("".join(parts))
        if line:
            paras.append(line)
    return paras


def slugify(text: str, max_len: int = 48) -> str:
    s = text.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = s.strip("-")
    return s[:max_len].strip("-") or "item"


def parse_classical_errors(paras: list[str]) -> list[dict]:
    titles = [t for t, _ in ERROR_CATALOG]
    header = {"name of logical error", "explanation", "simple explanation", "example"}
    indices: list[int] = []
    for i, line in enumerate(paras):
        if line in titles:
            indices.append(i)
    if len(indices) != len(titles):
        found = {paras[i] for i in indices}
        missing = [t for t in titles if t not in found]
        raise SystemExit(f"Classical doc: expected 8 errors, missing: {missing}")

    records: list[dict] = []
    for idx, start in enumerate(indices):
        title = paras[start]
        _, error_id = next(x for x in ERROR_CATALOG if x[0] == title)
        end = indices[idx + 1] if idx + 1 < len(indices) else len(paras)
        body = paras[start + 1 : end]
        if len(body) < 2:
            raise SystemExit(f"Classical doc: not enough fields for {title}")
        explanation = body[0]
        simple_explanation = body[1]
        example_lines = body[2:]
        records.append(
            {
                "id": error_id,
                "title": title,
                "explanation": explanation,
                "simpleExplanation": simple_explanation,
                "exampleLines": example_lines,
            }
        )
    return records


def match_error_prefix(line: str) -> tuple[str, str, str] | None:
    for title, error_id in ERROR_CATALOG:
        prefix = f"{title}:"
        if line.startswith(prefix):
            argument = normalize_text(line[len(prefix) :])
            return error_id, title, argument
    return None


def parse_examples(paras: list[str]) -> list[dict]:
    if not paras:
        return []
    start = 1 if paras[0].lower().startswith("logical error examples") else 0

    examples: list[dict] = []
    current_motion: str | None = None
    motion_slug = "motion"

    for line in paras[start:]:
        matched = match_error_prefix(line)
        if matched:
            error_id, _title, flawed_argument = matched
            if not current_motion:
                raise SystemExit(f"Example before any motion: {line[:80]}")
            ex_id = f"{motion_slug}-{error_id}"
            if any(e["id"] == ex_id for e in examples):
                ex_id = f"{ex_id}-{len(examples)}"
            examples.append(
                {
                    "id": ex_id,
                    "errorId": error_id,
                    "motionText": current_motion,
                    "flawedArgument": flawed_argument,
                }
            )
        else:
            current_motion = line
            motion_slug = slugify(line)

    return examples


def attach_counts(errors: list[dict], examples: list[dict]) -> list[dict]:
    counts: dict[str, int] = {eid: 0 for _, eid in ERROR_CATALOG}
    for ex in examples:
        counts[ex["errorId"]] = counts.get(ex["errorId"], 0) + 1
    enriched: list[dict] = []
    for err in errors:
        n = counts.get(err["id"], 0)
        enriched.append(
            {
                **err,
                "exampleCount": n,
                "practiceable": n > 0,
            }
        )
    return enriched


def main() -> None:
    classical_paras = docx_paragraphs(CLASSICAL_DOCX)
    example_paras = docx_paragraphs(EXAMPLES_DOCX)

    errors = attach_counts(
        parse_classical_errors(classical_paras),
        parse_examples(example_paras),
    )
    examples = parse_examples(example_paras)

    OUT_ERRORS.parent.mkdir(parents=True, exist_ok=True)
    OUT_ERRORS.write_text(
        json.dumps({"errors": errors}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    OUT_EXAMPLES.write_text(
        json.dumps({"examples": examples}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    practiceable = sum(1 for e in errors if e["practiceable"])
    print(f"Wrote {OUT_ERRORS.relative_to(REPO)} ({len(errors)} errors, {practiceable} practiceable)")
    print(f"Wrote {OUT_EXAMPLES.relative_to(REPO)} ({len(examples)} examples)")
    for err in errors:
        print(f"  {err['id']}: {err['exampleCount']} examples")


if __name__ == "__main__":
    main()
