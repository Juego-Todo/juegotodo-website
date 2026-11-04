import json
import openpyxl

wb = openpyxl.load_workbook("data/imports/jt-record-for-latayanology.xlsx", data_only=True)
for name in wb.sheetnames:
    ws = wb[name]
    print("\n====", name, "dims", ws.dimensions, "====")
    for i, row in enumerate(ws.iter_rows(min_row=1, max_row=35, values_only=True), 1):
        vals = [("" if c is None else str(c)[:60]) for c in row[:14]]
        if any(v.strip() for v in vals):
            print(f"{i:02d}", json.dumps(vals, ensure_ascii=False))
