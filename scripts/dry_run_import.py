"""Dry-run importer mirroring scripts/import-fight-cards.ts for local verification."""
from __future__ import annotations

import json
import re
from collections import defaultdict
from datetime import datetime
from pathlib import Path

RAW = Path("data/imports/jt-record-for-latayanology.raw.json")
OUT = Path("data/imports/import-preview.json")

EVENT_SHEETS = [
    ("Marikina Barrio Brawls -1", "MARIKINA BRAWLS 1 FIGHTERS", "Barrio Brawls", "marikina-barrio-brawls-1"),
    ("Marikina Barrio Brawls -2", "Marikina Barrio Brawls 2 fighte", "Barrio Brawls", "marikina-barrio-brawls-2"),
    ("sta.lucia barrio brawls 1", "sta.lucia barrio brawls 1 fight", "Barrio Brawls / UGB / Blaze FC", "sta-lucia-barrio-brawls-1-ugb45-blaze9"),
    ("NEW BREED 1", "NEW BREED 1 FIGHTERS", "New Breed", "new-breed-1"),
    ("sta.lucia barrio brawls 2 ", "sta.lucia barrio brawls 2 fight", "Barrio Brawls / UGB / Blaze FC", "sta-lucia-barrio-brawls-2-ugb46-blaze10"),
]


def blank(v):
    if v is None:
        return True
    t = str(v).strip()
    return t == "" or t.upper() in {"N/A", "NA", "NONE", "-", "—"}


def clean(v):
    if blank(v):
        return ""
    return re.sub(r"\s+", " ", str(v)).strip()


def title_case(v):
    return " ".join(p[:1].upper() + p[1:].lower() if p else "" for p in clean(v).split(" "))


def normalize_name(first, last):
    first_tokens = [
        t
        for t in re.sub(r"[^\w\s.]", " ", clean(first).lower(), flags=re.UNICODE).split()
        if t and not re.fullmatch(r"[a-z]\.?", t)
    ]
    last_tokens = re.sub(r"[^\w\s]", " ", clean(last).lower(), flags=re.UNICODE).split()
    return " ".join(first_tokens + last_tokens).strip()


def normalize_gym(v):
    return re.sub(r"\s+", " ", re.sub(r"[^\w\s]", " ", clean(v).lower(), flags=re.UNICODE)).strip()


def parse_date(v):
    if isinstance(v, datetime):
        return v.date().isoformat()
    t = clean(v)
    if not t:
        return None
    m = re.match(r"^(\d{4})-(\d{2})-(\d{2})", t)
    if m:
        return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    for fmt in ("%B %d, %Y", "%b %d, %Y", "%m/%d/%Y", "%m/%d/%y", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(t.split(".")[0], fmt).date().isoformat()
        except ValueError:
            pass
    return None


def detect_shift(rows):
    for row in rows[:12]:
        a = clean(row[0] if len(row) > 0 else "").upper()
        b = clean(row[1] if len(row) > 1 else "").upper()
        if "BLUE CORNER" in a or "BOUT #" in a or "MINOR" in a or "AMATEUR" in a:
            return 0
        if "BLUE CORNER" in b or "BOUT #" in b or "MINOR" in b or "AMATEUR" in b or "UGB" in b:
            return 1
    return 0


def detect_category(text):
    u = text.upper()
    if "MINOR" in u:
        return "minor"
    if "FEMALE" in u or "WOMEN" in u:
        return "female"
    if "PRO " in u:
        return "pro"
    if "AMATEUR" in u:
        return "amateur"
    return ""


def fieldish(label):
    u = label.upper()
    keys = [
        "FIRST NAME", "LAST NAME", "NICKNAME", "CAGE NAME", "DATE OF BIRTH", "ASSOCIATION",
        "CITY", "HEIGHT", "WEIGHT", "PICTURE", "SOCIAL MEDIA", "FIGHTER PICTURE", "RESULT",
        "PROFESSIONAL OR AMATEUR", "WINNER", "METHOD", "ROUND", "REFEREE", "CURRENT FIGHT RECORD",
        "COACH",
    ]
    return any(k in u for k in keys) or u == "TIME" or u == "RECORD"


def parse_header(text):
    raw = str(text or "")
    lines = [clean(x) for x in re.split(r"[\n\r]+", raw) if clean(x)]
    if len(lines) == 1:
        # Some exports flatten newlines into spaces.
        monthish = re.search(
            r"((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s*\d{4})",
            lines[0],
            re.I,
        )
        if monthish:
            before = clean(lines[0][: monthish.start()])
            after = clean(lines[0][monthish.end() :])
            lines = [p for p in [before, monthish.group(1), after] if p]
    name = lines[0] if lines else "Untitled Event"
    event_date = None
    venue = ""
    for line in lines[1:]:
        maybe = parse_date(line.split("/")[0].strip())
        if not event_date and maybe:
            event_date = maybe
            rest = clean("/".join(line.split("/")[1:])) if "/" in line else ""
            if rest and not parse_date(rest):
                venue = rest
            continue
        if not venue:
            venue = line
    return name, event_date, venue


def parse_event(sheet_name, rows, series, source_key):
    shift = detect_shift(rows)
    header_text = clean(rows[0][shift] if rows and len(rows[0]) > shift else "") or clean(rows[0][0] if rows else "")
    name, event_date, venue = parse_header(header_text)
    bouts = []
    category = ""
    division = ""
    i = 1
    while i < len(rows):
        row = rows[i]
        def c(idx):
            return clean(row[idx] if len(row) > idx else "")

        c0, c1, c2, c3 = c(shift), c(shift + 1), c(shift + 2), c(shift + 3)
        if not any([c0, c1, c2]):
            i += 1
            continue
        if "BLUE" not in c0.upper() and "BLUE" not in c1.upper() and detect_category(f"{c0} {c1} {c2}"):
            category = detect_category(f"{c0} {c1}")
            division = c2 or c3
            i += 1
            continue
        blue_at = shift if "BLUE CORNER" in c0.upper() else (shift + 1 if "BLUE CORNER" in c1.upper() else -1)
        if blue_at < 0:
            i += 1
            continue
        label_col = blue_at + 1
        red_col = blue_at + 2
        bout_label_raw = clean(row[label_col] if len(row) > label_col else "")
        format_m = re.search(r"(\d+\s*-?\s*MINS?\s*/\s*\d+\s*-?\s*ROUNDS?)", bout_label_raw, re.I)
        fmt = re.sub(r"\s+", " ", format_m.group(1)) if format_m else ""
        blue, red = {}, {}
        blue_win = red_win = method = round_ = time_ = referee = ""
        blue_rec = red_rec = ""
        j = i + 1
        while j < len(rows):
            r = rows[j]
            left = clean(r[blue_at] if len(r) > blue_at else "")
            label = clean(r[label_col] if len(r) > label_col else "")
            right = clean(r[red_col] if len(r) > red_col else "")
            if "BLUE CORNER" in left.upper() or "BLUE CORNER" in right.upper():
                break
            if not any([left, label, right]):
                if j > i + 22:
                    break
                j += 1
                continue
            if not fieldish(label) and detect_category(f"{left} {label}") and "BLUE" not in left.upper():
                break
            f = label.upper()
            if "FIRST NAME" in f:
                blue["firstName"], red["firstName"] = left, right
            elif "LAST NAME" in f:
                blue["lastName"], red["lastName"] = left, right
            elif "NICKNAME" in f or "CAGE NAME" in f:
                blue["nickname"], red["nickname"] = left, right
            elif "DATE OF BIRTH" in f:
                blue["dob"], red["dob"] = parse_date(r[blue_at] if len(r) > blue_at else ""), parse_date(r[red_col] if len(r) > red_col else "")
            elif "ASSOCIATION" in f or "GYM" in f or "TEAM" in f:
                blue["gym"], red["gym"] = left, right
            elif "CITY" in f:
                blue["hometown"], red["hometown"] = left, right
            elif "HEIGHT" in f:
                blue["height"], red["height"] = left, right
            elif "WEIGHT" in f:
                blue["weight"], red["weight"] = left, right
            elif "PICTURE" in f or "SOCIAL MEDIA" in f:
                if left.startswith("http"):
                    blue["photo"] = left
                if right.startswith("http"):
                    red["photo"] = right
            elif "WINNER" in f:
                blue_win, red_win = left, right
            elif "METHOD" in f:
                method = left or right
            elif "ROUND" in f:
                round_ = left or right
            elif f == "TIME" or f.startswith("TIME"):
                time_ = left or right
            elif "REFEREE" in f:
                referee = left or right
            elif "CURRENT FIGHT RECORD" in f or f == "RECORD":
                blue_rec, red_rec = left, right
                j += 1
                break
            j += 1

        def mk(side):
            first = title_case(side.get("firstName", ""))
            last = title_case(side.get("lastName", ""))
            return {
                "firstName": first,
                "lastName": last,
                "displayName": f"{first} {last}".strip(),
                "nickname": clean(side.get("nickname", "")).strip('"'),
                "gym": clean(side.get("gym", "")),
                "hometown": clean(side.get("hometown", "")),
                "height": clean(side.get("height", "")).strip('"'),
                "weightClass": clean(side.get("weight", "")),
                "photoSourceUrl": clean(side.get("photo", "")),
                "dateOfBirth": side.get("dob"),
                "normalizedName": normalize_name(first, last),
                "normalizedGym": normalize_gym(side.get("gym", "")),
            }

        bw, rw = blue_win.lower() == "yes", red_win.lower() == "yes"
        if (bw and rw) or "draw" in method.lower():
            br, rr, method = "draw", "draw", method or "Draw"
        elif bw and not rw:
            br, rr = "win", "loss"
        elif rw and not bw:
            br, rr = "loss", "win"
        else:
            br, rr = "", ""
        parts = []
        for corner, fighter, result, rec in (("blue", mk(blue), br, blue_rec), ("red", mk(red), rr, red_rec)):
            if fighter["normalizedName"]:
                parts.append({"corner": corner, "fighter": fighter, "result": result, "recordAtTime": clean(rec)})
        if parts:
            order = len(bouts) + 1
            bouts.append({
                "boutOrder": order,
                "boutLabel": bout_label_raw or f"Bout {order}",
                "category": category,
                "division": division,
                "weightClass": parts[0]["fighter"]["weightClass"] or division,
                "format": fmt,
                "method": clean(method),
                "round": clean(round_),
                "timeRemaining": clean(time_),
                "referee": clean(referee),
                "sourceKey": f"{source_key}-bout-{order}",
                "participants": parts,
            })
        i = max(j, i + 1)

    return {
        "name": name,
        "eventDate": event_date,
        "venue": venue,
        "series": series,
        "sourceKey": source_key,
        "sheetName": sheet_name,
        "bouts": bouts,
    }


def parse_summary(event_key, rows):
    out = []
    for row in rows[1:]:
        first = clean(row[1] if len(row) > 1 else "")
        last = clean(row[2] if len(row) > 2 else "")
        if not first and not last:
            continue
        out.append({
            "eventSourceKey": event_key,
            "firstName": title_case(first),
            "lastName": title_case(last),
            "corner": clean(row[3] if len(row) > 3 else "").lower(),
            "wins": int(float(row[4] or 0)),
            "losses": int(float(row[5] or 0)),
            "draws": int(float(row[6] or 0)),
            "normalizedName": normalize_name(first, last),
        })
    return out


def main():
    raw = json.loads(RAW.read_text(encoding="utf-8"))
    events = []
    summaries = []
    for card, fighters, series, key in EVENT_SHEETS:
        events.append(parse_event(card, raw[card], series, key))
        if fighters in raw:
            summaries.extend(parse_summary(key, raw[fighters]))

    fighters_map = {}
    for event in events:
        for bout in event["bouts"]:
            for p in bout["participants"]:
                f = p["fighter"]
                key = f"{f['normalizedName']}||{f['normalizedGym']}"
                if key in fighters_map:
                    fighters_map[key]["occurrences"] += 1
                else:
                    fighters_map[key] = {"key": key, "fighter": f, "occurrences": 1, "ambiguousMatches": []}

    # ambiguous: same name different gym
    by_name = defaultdict(list)
    for item in fighters_map.values():
        by_name[item["fighter"]["normalizedName"]].append(item)
    review = []
    for name, items in by_name.items():
        if len(items) > 1:
            for item in items:
                item["ambiguousMatches"] = [
                    {"displayName": o["fighter"]["displayName"], "gym": o["fighter"]["gym"]}
                    for o in items if o is not item
                ]
                review.append(item)

    computed = defaultdict(lambda: {"wins": 0, "losses": 0, "draws": 0})
    for event in events:
        for bout in event["bouts"]:
            for p in bout["participants"]:
                n = p["fighter"]["normalizedName"]
                if p["result"] == "win":
                    computed[n]["wins"] += 1
                elif p["result"] == "loss":
                    computed[n]["losses"] += 1
                elif p["result"] == "draw":
                    computed[n]["draws"] += 1

    latest = {}
    for row in summaries:
        latest[row["normalizedName"]] = row
    mismatches = []
    for name, sheet in latest.items():
        calc = computed[name]
        if (calc["wins"], calc["losses"], calc["draws"]) != (sheet["wins"], sheet["losses"], sheet["draws"]):
            mismatches.append({
                "eventSourceKey": sheet["eventSourceKey"],
                "fighterName": f"{sheet['firstName']} {sheet['lastName']}".strip(),
                "corner": sheet["corner"],
                "sheet": {"wins": sheet["wins"], "losses": sheet["losses"], "draws": sheet["draws"]},
                "computed": calc,
            })

    preview = {
        "events": events,
        "fighters": list(fighters_map.values()),
        "summaries": summaries,
        "mismatches": mismatches,
        "reviewQueue": review,
        "totals": {
            "events": len(events),
            "bouts": sum(len(e["bouts"]) for e in events),
            "participants": sum(len(b["participants"]) for e in events for b in e["bouts"]),
            "uniqueFighters": len(fighters_map),
        },
    }
    OUT.write_text(json.dumps(preview, indent=2, ensure_ascii=False), encoding="utf-8")

    print("=== JT Fight Card Import Preview ===")
    print(f"Events: {preview['totals']['events']}")
    print(f"Bouts: {preview['totals']['bouts']}")
    print(f"Participants: {preview['totals']['participants']}")
    print(f"Unique fighters: {preview['totals']['uniqueFighters']}")
    print(f"Review-queue fighters: {len(review)}")
    print(f"Record mismatches vs summary tabs: {len(mismatches)}")
    print("\n-- Events --")
    for e in events:
        print(f"- {e['sourceKey']}: {e['name']} | {e['eventDate'] or 'no-date'} | {e['venue'] or 'no-venue'} | bouts={len(e['bouts'])}")
    print("\n-- Mismatch list --")
    if not mismatches:
        print("(none)")
    for m in mismatches:
        s, c = m["sheet"], m["computed"]
        print(f"- {m['fighterName']} @ {m['eventSourceKey']}: sheet {s['wins']}-{s['losses']}-{s['draws']} vs computed {c['wins']}-{c['losses']}-{c['draws']}")
    print("\n-- Admin review queue --")
    if not review:
        print("(none)")
    for r in review:
        amb = "; ".join(f"{a['displayName']} [{a['gym'] or 'no gym'}]" for a in r["ambiguousMatches"])
        print(f"- {r['fighter']['displayName']} / {r['fighter']['gym'] or '(no gym)'} ambiguous with: {amb}")
    print(f"\nWrote {OUT}")


if __name__ == "__main__":
    main()
