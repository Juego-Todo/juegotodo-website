"""One-off helper: dump raw sheet rows to JSON for the TypeScript importer."""
from __future__ import annotations

import json
from pathlib import Path

import openpyxl

SRC = Path("data/imports/jt-record-for-latayanology.xlsx")
OUT = Path("data/imports/jt-record-for-latayanology.raw.json")


def main() -> None:
    wb = openpyxl.load_workbook(SRC, data_only=True)
    payload = {}
    for name in wb.sheetnames:
        ws = wb[name]
        rows = []
        for row in ws.iter_rows(values_only=True):
            rows.append([("" if c is None else c) for c in row])
        payload[name] = rows
    OUT.write_text(json.dumps(payload, ensure_ascii=False, default=str), encoding="utf-8")
    print(f"wrote {OUT} sheets={len(payload)}")


if __name__ == "__main__":
    main()
