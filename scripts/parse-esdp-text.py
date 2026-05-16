"""
Parse ESDP topic PDF from the repository root into content/esdp-motions-parsed.json.

Usage (from web/):  python scripts/parse-esdp-text.py
Requires: pip install pypdf
"""
from __future__ import annotations

import json
import re
from pathlib import Path

WEB = Path(__file__).resolve().parents[1]
REPO = WEB.parent
OUT = WEB / "content" / "esdp-motions-parsed.json"


def clean_chunk(s: str) -> str:
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"^Editor.{0,3}note:\s*", "", s, flags=re.I)
    s = re.split(r"(?i)Editor.{0,3}note:", s, maxsplit=1)[0].strip()
    return s.strip()


def extract_pdf_text() -> str:
    try:
        from pypdf import PdfReader
    except ImportError as e:
        raise SystemExit("Install pypdf: pip install pypdf") from e
    pdfs = sorted(REPO.glob("ESDP*.pdf"))
    if not pdfs:
        raise SystemExit(f"No ESDP*.pdf found under {REPO}")
    pdf_path = pdfs[0]
    r = PdfReader(str(pdf_path))
    parts = []
    for p in r.pages:
        parts.append(p.extract_text() or "")
    return "\n".join(parts)


def main() -> None:
    raw = extract_pdf_text()
    raw = re.sub(r"--- PAGE \d+ ---", "\n", raw)
    raw = re.sub(r"辩论话题题库集", "", raw)
    raw = re.sub(r"第 \d+ 页", "", raw)

    pat = re.compile(r"(?m)^\s*(\d{1,3})\s*[、,]\s*")
    parts = pat.split(raw)
    motions: list[dict] = []
    i = 1
    while i + 1 < len(parts):
        num_s, body = parts[i], parts[i + 1]
        i += 2
        try:
            n = int(num_s)
        except ValueError:
            continue
        body = clean_chunk(body)
        if len(body) < 15:
            continue
        if body.startswith("http"):
            continue
        motions.append({"n": n, "text": body})

    by_n: dict[int, str] = {}
    for m in motions:
        t = m["text"]
        if m["n"] not in by_n or len(t) > len(by_n[m["n"]]):
            by_n[m["n"]] = t

    ordered = sorted(by_n.items(), key=lambda x: x[0])
    pdf_name = sorted(REPO.glob("ESDP*.pdf"))[0].name
    out_motions = []
    for n, text in ordered:
        out_motions.append(
            {
                "id": f"esdp-2026-{n:03d}",
                "number": n,
                "text": text,
                "format": "ESDP topic bank (2026 revised)",
                "sourceName": "ESDP辩论话题集（2026修订）",
                "sourceUrl": None,
                "sourceFile": pdf_name,
            }
        )

    OUT.write_text(
        json.dumps({"version": 1, "motions": out_motions}, ensure_ascii=False, indent=2)
        + "\n",
        encoding="utf-8",
    )
    print("Wrote", len(out_motions), "motions to", OUT)


if __name__ == "__main__":
    main()
