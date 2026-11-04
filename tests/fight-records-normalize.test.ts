import assert from "node:assert/strict";
import test from "node:test";
import { normalizePersonName, parseFlexibleDate } from "../lib/fight-records/normalize.ts";

test("parseFlexibleDate reads month names, slash dates, and blank values", () => {
  assert.equal(parseFlexibleDate("June 6, 2006"), "2006-06-06");
  assert.equal(parseFlexibleDate("AUGUST 31, 2025"), "2025-08-31");
  assert.equal(parseFlexibleDate("6/20/2009"), "2009-06-20");
  assert.equal(parseFlexibleDate("05/05/06"), "2006-05-05");
  assert.equal(parseFlexibleDate(""), null);
  assert.equal(parseFlexibleDate("   "), null);
  assert.equal(parseFlexibleDate("N/A"), null);
  assert.equal(parseFlexibleDate("n/a"), null);
  assert.equal(parseFlexibleDate("NONE"), null);
  assert.equal(parseFlexibleDate("none"), null);
  assert.equal(parseFlexibleDate(null), null);
});

test("normalizePersonName drops middle initials from the given name", () => {
  assert.equal(normalizePersonName("Juan M.", "Dela Cruz"), "juan dela cruz");
  assert.equal(normalizePersonName("Maria O Santos", "Reyes"), "maria santos reyes");
  assert.equal(normalizePersonName("Ana", "B. Lopez"), "ana b lopez");
});
