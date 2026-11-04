/**
 * Import JT Latayanology fight cards from the official spreadsheet export.
 *
 * Usage:
 *   npx tsx scripts/import-fight-cards.ts --dry-run
 *   npx tsx scripts/import-fight-cards.ts --dry-run --xlsx data/imports/jt-record-for-latayanology.xlsx
 *
 * The script prefers a pre-exported JSON workbook (via scripts/_export_sheet_json.py)
 * so it can run without a native xlsx dependency. Pass --xlsx to regenerate JSON first.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { loadRawWorkbookFromJsonFile, parseWorkbook } from "../lib/fight-records/parse-fight-cards";

const ROOT = process.cwd();
const DEFAULT_XLSX = path.join(ROOT, "data/imports/jt-record-for-latayanology.xlsx");
const DEFAULT_JSON = path.join(ROOT, "data/imports/jt-record-for-latayanology.raw.json");
const PREVIEW_OUT = path.join(ROOT, "data/imports/import-preview.json");

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

function getArg(name: string) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function ensureJsonFromXlsx(xlsxPath: string, jsonPath: string) {
  const helper = path.join(ROOT, "scripts/_export_sheet_json.py");
  const result = spawnSync("python", [helper], {
    cwd: ROOT,
    encoding: "utf8",
    env: {
      ...process.env,
    },
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "Failed to export xlsx via Python openpyxl.");
  }
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Expected JSON export at ${jsonPath}`);
  }
  console.log(result.stdout.trim());
  console.log(`source xlsx: ${xlsxPath}`);
}

function main() {
  const dryRun = hasFlag("--dry-run") || !hasFlag("--apply");
  const xlsxPath = getArg("--xlsx") || DEFAULT_XLSX;
  const jsonPath = getArg("--json") || DEFAULT_JSON;

  if (hasFlag("--xlsx") || !fs.existsSync(jsonPath)) {
    if (!fs.existsSync(xlsxPath)) {
      throw new Error(`Missing spreadsheet export: ${xlsxPath}`);
    }
    ensureJsonFromXlsx(xlsxPath, jsonPath);
  }

  const raw = loadRawWorkbookFromJsonFile(jsonPath);
  const preview = parseWorkbook(raw);
  fs.writeFileSync(PREVIEW_OUT, JSON.stringify(preview, null, 2), "utf8");

  console.log("\n=== JT Fight Card Import Preview ===");
  console.log(`Events: ${preview.totals.events}`);
  console.log(`Bouts: ${preview.totals.bouts}`);
  console.log(`Participants: ${preview.totals.participants}`);
  console.log(`Unique fighters: ${preview.totals.uniqueFighters}`);
  console.log(`Review-queue fighters: ${preview.reviewQueue.length}`);
  console.log(`Record mismatches vs summary tabs: ${preview.mismatches.length}`);

  console.log("\n-- Events --");
  for (const event of preview.events) {
    console.log(
      `- ${event.sourceKey}: ${event.name} | ${event.eventDate || "no-date"} | ${event.venue || "no-venue"} | bouts=${event.bouts.length}`,
    );
  }

  console.log("\n-- Mismatch list (sheet summary vs computed W-L-D) --");
  if (preview.mismatches.length === 0) {
    console.log("(none)");
  } else {
    for (const row of preview.mismatches) {
      console.log(
        `- ${row.fighterName} @ ${row.eventSourceKey}: sheet ${row.sheet.wins}-${row.sheet.losses}-${row.sheet.draws} vs computed ${row.computed.wins}-${row.computed.losses}-${row.computed.draws}`,
      );
    }
  }

  console.log("\n-- Admin review queue (same normalized name, different gym) --");
  if (preview.reviewQueue.length === 0) {
    console.log("(none)");
  } else {
    for (const row of preview.reviewQueue) {
      console.log(
        `- ${row.fighter.displayName} / ${row.fighter.gym || "(no gym)"} ambiguous with: ${row.ambiguousMatches
          .map((match) => `${match.displayName} [${match.gym || "no gym"}]`)
          .join("; ")}`,
      );
    }
  }

  console.log(`\nWrote ${PREVIEW_OUT}`);
  if (dryRun) {
    console.log("Dry-run only. No database writes.");
    return;
  }

  console.log("Apply mode is reserved for the admin import API (service role).");
}

main();
