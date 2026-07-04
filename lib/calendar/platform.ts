import type { CalendarEntry, EventHealthChecks } from "@/data/calendar-entries";

export function formatEventLocation(entry: CalendarEntry) {
  const { location } = entry;
  return [location.country, location.region, location.city, location.venue].filter(Boolean).join(" · ");
}

export function formatLocationStack(entry: CalendarEntry) {
  const { location } = entry;
  return {
    line1: location.country.toUpperCase(),
    line2: location.region.toUpperCase(),
    line3: location.city.toUpperCase(),
    line4: location.venue.toUpperCase(),
  };
}

export function getMapLinks(entry: CalendarEntry) {
  const query = encodeURIComponent(
    entry.location.venueAddress ||
      `${entry.location.venue}, ${entry.location.city}, ${entry.location.country}`,
  );
  const coords =
    entry.location.latitude != null && entry.location.longitude != null
      ? `${entry.location.latitude},${entry.location.longitude}`
      : null;

  return {
    googleMaps: coords
      ? `https://www.google.com/maps/search/?api=1&query=${coords}`
      : `https://www.google.com/maps/search/?api=1&query=${query}`,
    openMaps: coords ? `https://maps.apple.com/?ll=${coords}` : `https://maps.apple.com/?q=${query}`,
    directions: `https://www.google.com/maps/dir/?api=1&destination=${query}`,
    coordinates: coords,
    address: entry.location.venueAddress || `${entry.location.venue}, ${entry.location.city}`,
  };
}

export function computeEventHealth(entry: CalendarEntry) {
  const checks: Array<{ label: string; complete: boolean; key: keyof EventHealthChecks | "ticketSales" | "fighterRegistration" }> = [
    { label: "Venue Confirmed", complete: entry.operations.health.venueConfirmed, key: "venueConfirmed" },
    { label: "Officials Assigned", complete: entry.operations.health.officialsAssigned, key: "officialsAssigned" },
    { label: "Medical Team Assigned", complete: entry.operations.health.medicalTeamAssigned, key: "medicalTeamAssigned" },
    { label: "Security Confirmed", complete: entry.operations.health.securityConfirmed, key: "securityConfirmed" },
    {
      label: "Ticket Sales",
      complete: entry.operations.capacity.maximum > 0 && entry.operations.ticketsSold / entry.operations.capacity.maximum >= 0.5,
      key: "ticketSales",
    },
    {
      label: "Fighter Registration",
      complete: entry.operations.capacity.maximum > 0 && entry.operations.capacity.registered / entry.operations.capacity.maximum >= 0.6,
      key: "fighterRegistration",
    },
    { label: "Sponsorship Complete", complete: entry.operations.health.sponsorshipComplete, key: "sponsorshipComplete" },
    { label: "Livestream Configured", complete: entry.operations.health.livestreamConfigured, key: "livestreamConfigured" },
    { label: "GAB Sanction Status", complete: entry.operations.health.gabSanctionComplete, key: "gabSanctionComplete" },
  ];

  const score = Math.round((checks.filter((check) => check.complete).length / checks.length) * 100);
  return { checks, score };
}

export function getOccupancyPercent(entry: CalendarEntry) {
  const { maximum, registered } = entry.operations.capacity;
  if (maximum <= 0) return 0;
  return Math.min(100, Math.round((registered / maximum) * 100));
}

export function getTicketSalesPercent(entry: CalendarEntry) {
  const { maximum } = entry.operations.capacity;
  if (maximum <= 0) return 0;
  return Math.min(100, Math.round((entry.operations.ticketsSold / maximum) * 100));
}

export function getTotalOfficials(entry: CalendarEntry) {
  const officials = entry.operations.officials;
  return (
    officials.referees +
    officials.judges +
    officials.doctors +
    officials.timekeepers +
    officials.scorekeepers +
    officials.ringAnnouncers +
    officials.photographers +
    officials.videographers +
    officials.security +
    officials.medicalTeam +
    officials.grandCouncilRep
  );
}

export const workflowStages = [
  "planning",
  "draft",
  "internal_review",
  "council_approval",
  "gab_sanction",
  "published",
  "registration_open",
  "fight_card_finalized",
  "tickets_on_sale",
  "live",
  "results_published",
  "certificates_issued",
  "archived",
] as const;
