import type {
  FighterMatchCandidate,
  ImportedBoutDraft,
  ImportedEventDraft,
  ImportedFighterDraft,
  ImportedParticipantDraft,
  ImportPreview,
  RecordMismatch,
  SheetSummaryRow,
} from "./import-types";
import {
  cleanText,
  detectCategory,
  isBlankish,
  normalizeGym,
  normalizePersonName,
  parseFlexibleDate,
  slugifyFighter,
  titleCaseName,
} from "./normalize";

type RawWorkbook = Record<string, unknown[][]>;

const EVENT_SHEETS: Array<{
  fightCard: string;
  fighters: string;
  series: string;
  sourceKey: string;
}> = [
  {
    fightCard: "Marikina Barrio Brawls -1",
    fighters: "MARIKINA BRAWLS 1 FIGHTERS",
    series: "Barrio Brawls",
    sourceKey: "marikina-barrio-brawls-1",
  },
  {
    fightCard: "Marikina Barrio Brawls -2",
    fighters: "Marikina Barrio Brawls 2 fighte",
    series: "Barrio Brawls",
    sourceKey: "marikina-barrio-brawls-2",
  },
  {
    fightCard: "sta.lucia barrio brawls 1",
    fighters: "sta.lucia barrio brawls 1 fight",
    series: "Barrio Brawls / UGB / Blaze FC",
    sourceKey: "sta-lucia-barrio-brawls-1-ugb45-blaze9",
  },
  {
    fightCard: "NEW BREED 1",
    fighters: "NEW BREED 1 FIGHTERS",
    series: "New Breed",
    sourceKey: "new-breed-1",
  },
  {
    fightCard: "sta.lucia barrio brawls 2 ",
    fighters: "sta.lucia barrio brawls 2 fight",
    series: "Barrio Brawls / UGB / Blaze FC",
    sourceKey: "sta-lucia-barrio-brawls-2-ugb46-blaze10",
  },
];

function cell(row: unknown[] | undefined, index: number): unknown {
  if (!row || index < 0 || index >= row.length) return "";
  return row[index];
}

function detectShift(rows: unknown[][]): number {
  for (const row of rows.slice(0, 12)) {
    const a = cleanText(cell(row, 0)).toUpperCase();
    const b = cleanText(cell(row, 1)).toUpperCase();
    if (a.includes("BLUE CORNER") || a.includes("BOUT #") || a.includes("MINOR") || a.includes("AMATEUR")) {
      return 0;
    }
    if (b.includes("BLUE CORNER") || b.includes("BOUT #") || b.includes("MINOR") || b.includes("AMATEUR") || b.includes("UGB")) {
      return 1;
    }
  }
  return 0;
}

function parseEventHeader(text: string): { name: string; eventDate: string | null; venue: string } {
  let lines = text
    .split(/\n+/)
    .map((line) => cleanText(line))
    .filter(Boolean);

  if (lines.length === 1) {
    const monthish = lines[0].match(
      /((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s*\d{4})/i,
    );
    if (monthish && monthish.index != null) {
      const before = cleanText(lines[0].slice(0, monthish.index));
      const after = cleanText(lines[0].slice(monthish.index + monthish[0].length));
      lines = [before, monthish[0], after].filter(Boolean);
    }
  }

  const name = lines[0] || "Untitled Event";
  let eventDate: string | null = null;
  let venue = "";
  for (const line of lines.slice(1)) {
    const monthLead = line.match(
      /^((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2},\s*\d{4})\b/i,
    );
    const dateSource = monthLead?.[1] || line.split("/")[0]?.trim() || line;
    const maybeDate = parseFlexibleDate(dateSource);
    if (!eventDate && maybeDate) {
      eventDate = maybeDate;
      const afterMonth = monthLead ? cleanText(line.slice(monthLead[0].length).replace(/^[/\-–—]\s*/, "")) : "";
      const rest = line.includes("/") ? cleanText(line.split("/").slice(1).join("/")) : afterMonth;
      if (rest && !parseFlexibleDate(rest)) venue = rest;
      continue;
    }
    if (!venue) venue = line;
  }
  return { name, eventDate, venue };
}

function labelLooksLikeField(label: string): boolean {
  const upper = label.toUpperCase();
  return (
    upper.includes("FIRST NAME") ||
    upper.includes("LAST NAME") ||
    upper.includes("NICKNAME") ||
    upper.includes("CAGE NAME") ||
    upper.includes("DATE OF BIRTH") ||
    upper.includes("ASSOCIATION") ||
    upper.includes("CITY") ||
    upper.includes("HEIGHT") ||
    upper.includes("WEIGHT") ||
    upper.includes("PICTURE") ||
    upper.includes("SOCIAL MEDIA") ||
    upper.includes("FIGHTER PICTURE") ||
    upper.includes("RESULT") ||
    upper.includes("PROFESSIONAL OR AMATEUR") ||
    upper.includes("WINNER") ||
    upper.includes("METHOD") ||
    upper.includes("ROUND") ||
    upper === "TIME" ||
    upper.includes("REFEREE") ||
    upper.includes("CURRENT FIGHT RECORD") ||
    upper === "RECORD" ||
    upper.includes("COACH")
  );
}

function buildFighter(partial: Partial<ImportedFighterDraft>): ImportedFighterDraft {
  const firstName = titleCaseName(cleanText(partial.firstName));
  const lastName = titleCaseName(cleanText(partial.lastName));
  const displayName = cleanText(`${firstName} ${lastName}`);
  return {
    firstName,
    lastName,
    displayName,
    nickname: cleanText(partial.nickname).replace(/^"|"$/g, ""),
    gym: cleanText(partial.gym),
    hometown: cleanText(partial.hometown),
    height: cleanText(partial.height).replace(/^"|"$/g, ""),
    weightClass: cleanText(partial.weightClass),
    photoSourceUrl: cleanText(partial.photoSourceUrl),
    dateOfBirth: partial.dateOfBirth ?? null,
    normalizedName: normalizePersonName(firstName, lastName),
    normalizedGym: normalizeGym(partial.gym || ""),
  };
}

function parseWinner(blueYes: string, redYes: string, method: string): {
  blue: ImportedParticipantDraft["result"];
  red: ImportedParticipantDraft["result"];
  method: string;
} {
  const blue = blueYes.toLowerCase() === "yes";
  const red = redYes.toLowerCase() === "yes";
  const methodText = cleanText(method);
  if (blue && red) {
    return { blue: "draw", red: "draw", method: methodText || "Draw" };
  }
  if (methodText.toLowerCase().includes("draw")) {
    return { blue: "draw", red: "draw", method: methodText };
  }
  if (blue && !red) return { blue: "win", red: "loss", method: methodText };
  if (red && !blue) return { blue: "loss", red: "win", method: methodText };
  return { blue: "", red: "", method: methodText };
}

function parseFightCardSheet(
  sheetName: string,
  rows: unknown[][],
  meta: { series: string; sourceKey: string },
): ImportedEventDraft {
  const shift = detectShift(rows);
  const headerText = cleanText(cell(rows[0], shift)) || cleanText(cell(rows[0], 0));
  const header = parseEventHeader(headerText);

  const bouts: ImportedBoutDraft[] = [];
  let currentCategory: ImportedBoutDraft["category"] = "";
  let currentDivision = "";
  let i = 1;

  while (i < rows.length) {
    const row = rows[i] ?? [];
    const c0 = cleanText(cell(row, shift));
    const c1 = cleanText(cell(row, shift + 1));
    const c2 = cleanText(cell(row, shift + 2));
    const c3 = cleanText(cell(row, shift + 3));

    if (!c0 && !c1 && !c2) {
      i += 1;
      continue;
    }

    // Category / division header rows
    if (!c0.toUpperCase().includes("BLUE") && !c1.toUpperCase().includes("BLUE") && detectCategory(`${c0} ${c1} ${c2}`)) {
      currentCategory = detectCategory(`${c0} ${c1}`);
      currentDivision = cleanText(c2 || c3);
      i += 1;
      continue;
    }

    const blueCornerAt = c0.toUpperCase().includes("BLUE CORNER")
      ? shift
      : c1.toUpperCase().includes("BLUE CORNER")
        ? shift + 1
        : -1;

    if (blueCornerAt < 0) {
      i += 1;
      continue;
    }

    const labelCol = blueCornerAt + 1;
    const redCol = blueCornerAt + 2;
    const boutLabelRaw = cleanText(cell(row, labelCol));
    const boutLabelMatch = boutLabelRaw.match(/BOUT\s*#?\s*([0-9]+)?/i);
    const boutLabel = boutLabelMatch ? cleanText(boutLabelRaw.split(/\s{2,}/)[0] || boutLabelRaw) : boutLabelRaw;
    const formatMatch = boutLabelRaw.match(/(\d+\s*-?\s*MINS?\s*\/\s*\d+\s*-?\s*ROUNDS?)/i);
    const format = formatMatch ? formatMatch[1].replace(/\s+/g, " ") : "";

    const blue: Partial<ImportedFighterDraft> = {};
    const red: Partial<ImportedFighterDraft> = {};
    let blueWinner = "";
    let redWinner = "";
    let method = "";
    let round = "";
    let timeRemaining = "";
    let referee = "";
    let blueRecord = "";
    let redRecord = "";

    let j = i + 1;
    while (j < rows.length) {
      const r = rows[j] ?? [];
      const left = cleanText(cell(r, blueCornerAt));
      const label = cleanText(cell(r, labelCol));
      const right = cleanText(cell(r, redCol));

      if (left.toUpperCase().includes("BLUE CORNER") || right.toUpperCase().includes("BLUE CORNER")) {
        break;
      }
      if (!left && !label && !right) {
        // blank separator inside bout — keep scanning a little
        if (j > i + 22) break;
        j += 1;
        continue;
      }

      // Next category header ends bout
      if (!labelLooksLikeField(label) && detectCategory(`${left} ${label}`) && !left.toUpperCase().includes("BLUE")) {
        break;
      }

      const field = label.toUpperCase();
      if (field.includes("FIRST NAME")) {
        blue.firstName = left;
        red.firstName = right;
      } else if (field.includes("LAST NAME")) {
        blue.lastName = left;
        red.lastName = right;
      } else if (field.includes("NICKNAME") || field.includes("CAGE NAME")) {
        blue.nickname = left;
        red.nickname = right;
      } else if (field.includes("DATE OF BIRTH")) {
        blue.dateOfBirth = parseFlexibleDate(cell(r, blueCornerAt));
        red.dateOfBirth = parseFlexibleDate(cell(r, redCol));
      } else if (field.includes("ASSOCIATION") || field.includes("GYM") || field.includes("TEAM")) {
        blue.gym = left;
        red.gym = right;
      } else if (field.includes("CITY")) {
        blue.hometown = left;
        red.hometown = right;
      } else if (field.includes("HEIGHT")) {
        blue.height = left;
        red.height = right;
      } else if (field.includes("WEIGHT")) {
        blue.weightClass = left;
        red.weightClass = right;
      } else if (field.includes("PICTURE") || field.includes("SOCIAL MEDIA") || field.includes("FIGHTER PICTURE")) {
        if (!isBlankish(left) && String(left).startsWith("http")) blue.photoSourceUrl = left;
        if (!isBlankish(right) && String(right).startsWith("http")) red.photoSourceUrl = right;
      } else if (field.includes("WINNER")) {
        blueWinner = left;
        redWinner = right;
      } else if (field.includes("METHOD")) {
        method = left || right;
      } else if (field === "ROUND" || field.includes("ROUND")) {
        round = left || right;
      } else if (field === "TIME" || field.startsWith("TIME")) {
        timeRemaining = left || right;
      } else if (field.includes("REFEREE")) {
        referee = left || right;
      } else if (field.includes("CURRENT FIGHT RECORD") || field === "RECORD") {
        blueRecord = left;
        redRecord = right;
      }

      j += 1;
      if (field.includes("CURRENT FIGHT RECORD") || field === "RECORD") {
        break;
      }
    }

    const outcomes = parseWinner(blueWinner, redWinner, method);
    const boutOrder = bouts.length + 1;
    const participants: ImportedParticipantDraft[] = [
      {
        corner: "blue",
        fighter: buildFighter(blue),
        result: outcomes.blue,
        recordAtTime: cleanText(blueRecord),
      },
      {
        corner: "red",
        fighter: buildFighter(red),
        result: outcomes.red,
        recordAtTime: cleanText(redRecord),
      },
    ].filter((participant): participant is ImportedParticipantDraft => Boolean(participant.fighter.normalizedName));

    if (participants.length > 0) {
      bouts.push({
        boutOrder,
        boutLabel: boutLabel || `Bout ${boutOrder}`,
        category: currentCategory,
        division: currentDivision,
        weightClass: cleanText(participants[0]?.fighter.weightClass || currentDivision),
        format,
        method: outcomes.method,
        round: cleanText(round),
        timeRemaining: cleanText(timeRemaining),
        referee: cleanText(referee),
        sourceKey: `${meta.sourceKey}-bout-${boutOrder}`,
        participants,
      });
    }

    i = Math.max(j, i + 1);
  }

  return {
    name: header.name,
    eventDate: header.eventDate,
    venue: header.venue,
    series: meta.series,
    sourceKey: meta.sourceKey,
    sheetName,
    bouts,
  };
}

function parseSummarySheet(eventSourceKey: string, rows: unknown[][]): SheetSummaryRow[] {
  const out: SheetSummaryRow[] = [];
  for (const row of rows.slice(1)) {
    const firstName = cleanText(cell(row, 1));
    const lastName = cleanText(cell(row, 2));
    if (!firstName && !lastName) continue;
    out.push({
      eventSourceKey,
      firstName: titleCaseName(firstName),
      lastName: titleCaseName(lastName),
      corner: cleanText(cell(row, 3)).toLowerCase(),
      wins: Number(cell(row, 4) || 0) || 0,
      losses: Number(cell(row, 5) || 0) || 0,
      draws: Number(cell(row, 6) || 0) || 0,
      normalizedName: normalizePersonName(firstName, lastName),
    });
  }
  return out;
}

function mergeFighters(events: ImportedEventDraft[]): FighterMatchCandidate[] {
  const map = new Map<string, FighterMatchCandidate>();

  for (const event of events) {
    for (const bout of event.bouts) {
      for (const participant of bout.participants) {
        const fighter = participant.fighter;
        const key = `${fighter.normalizedName}||${fighter.normalizedGym}`;
        const softKey = fighter.normalizedName;
        const existingExact = map.get(key);
        if (existingExact) {
          existingExact.occurrences += 1;
          if (!existingExact.fighter.photoSourceUrl && fighter.photoSourceUrl) {
            existingExact.fighter.photoSourceUrl = fighter.photoSourceUrl;
          }
          if (!existingExact.fighter.dateOfBirth && fighter.dateOfBirth) {
            existingExact.fighter.dateOfBirth = fighter.dateOfBirth;
          }
          continue;
        }

        const ambiguous = [...map.values()].filter(
          (candidate) =>
            candidate.fighter.normalizedName === softKey &&
            candidate.fighter.normalizedGym !== fighter.normalizedGym,
        );

        map.set(key, {
          key,
          fighter,
          occurrences: 1,
          ambiguousMatches: ambiguous.map((candidate) => ({
            slug: slugifyFighter(candidate.fighter.displayName),
            displayName: candidate.fighter.displayName,
            gym: candidate.fighter.gym,
          })),
        });
      }
    }
  }

  return [...map.values()];
}

function computeRecordsFromEvents(events: ImportedEventDraft[]) {
  const records = new Map<string, { wins: number; losses: number; draws: number; name: string }>();
  for (const event of events) {
    for (const bout of event.bouts) {
      for (const participant of bout.participants) {
        const key = participant.fighter.normalizedName;
        const current = records.get(key) || {
          wins: 0,
          losses: 0,
          draws: 0,
          name: participant.fighter.displayName,
        };
        if (participant.result === "win") current.wins += 1;
        if (participant.result === "loss") current.losses += 1;
        if (participant.result === "draw") current.draws += 1;
        records.set(key, current);
      }
    }
  }
  return records;
}

function findMismatches(events: ImportedEventDraft[], summaries: SheetSummaryRow[]): RecordMismatch[] {
  const computed = computeRecordsFromEvents(events);
  const latestByName = new Map<string, SheetSummaryRow>();
  for (const row of summaries) {
    // Keep the last snapshot for a name (later events overwrite earlier).
    latestByName.set(row.normalizedName, row);
  }

  const mismatches: RecordMismatch[] = [];
  for (const [name, sheet] of latestByName) {
    const calc = computed.get(name) || { wins: 0, losses: 0, draws: 0, name: sheet.firstName };
    if (calc.wins !== sheet.wins || calc.losses !== sheet.losses || calc.draws !== sheet.draws) {
      mismatches.push({
        eventSourceKey: sheet.eventSourceKey,
        fighterName: `${sheet.firstName} ${sheet.lastName}`.trim(),
        corner: sheet.corner,
        sheet: { wins: sheet.wins, losses: sheet.losses, draws: sheet.draws },
        computed: { wins: calc.wins, losses: calc.losses, draws: calc.draws },
      });
    }
  }
  return mismatches;
}

export function parseWorkbook(raw: RawWorkbook): ImportPreview {
  const events: ImportedEventDraft[] = [];
  const summaries: SheetSummaryRow[] = [];

  for (const meta of EVENT_SHEETS) {
    const cardRows = raw[meta.fightCard];
    if (!cardRows) {
      throw new Error(`Missing fight-card sheet: ${meta.fightCard}`);
    }
    events.push(parseFightCardSheet(meta.fightCard, cardRows, meta));

    const summaryRows = raw[meta.fighters];
    if (summaryRows) {
      summaries.push(...parseSummarySheet(meta.sourceKey, summaryRows));
    }
  }

  const fighters = mergeFighters(events);
  const reviewQueue = fighters.filter((fighter) => fighter.ambiguousMatches.length > 0);
  const mismatches = findMismatches(events, summaries);
  const boutCount = events.reduce((sum, event) => sum + event.bouts.length, 0);
  const participantCount = events.reduce(
    (sum, event) => sum + event.bouts.reduce((inner, bout) => inner + bout.participants.length, 0),
    0,
  );

  return {
    events,
    fighters,
    summaries,
    mismatches,
    reviewQueue,
    totals: {
      events: events.length,
      bouts: boutCount,
      participants: participantCount,
      uniqueFighters: fighters.length,
    },
  };
}

export function loadRawWorkbookFromJsonFile(filePath: string): RawWorkbook {
  // Lazy require to keep Next edge bundles lean when unused.
  const fs = require("node:fs") as typeof import("node:fs");
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as RawWorkbook;
}
