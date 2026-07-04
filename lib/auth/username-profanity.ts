const BLOCKED_USERNAME_TERMS = [
  "admin",
  "moderator",
  "official",
  "juegotodo",
  "support",
  "staff",
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "dick",
  "pussy",
  "cunt",
  "nigger",
  "nigga",
  "faggot",
  "retard",
  "whore",
  "slut",
  "bastard",
  "porn",
  "sex",
  "nazi",
  "rape",
] as const;

function normalizeForProfanityScan(value: string) {
  return value
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/_/g, "")
    .replace(/[^a-z]/g, "");
}

function termMatches(scanned: string, term: string) {
  if (term.length <= 3) {
    return scanned === term;
  }

  return scanned.includes(term);
}

export function getUsernameProfanityError(value: string) {
  const scanned = normalizeForProfanityScan(value);

  if (!scanned) {
    return null;
  }

  for (const term of BLOCKED_USERNAME_TERMS) {
    if (termMatches(scanned, term)) {
      return "That username is not allowed. Please choose a respectful handle.";
    }
  }

  return null;
}
