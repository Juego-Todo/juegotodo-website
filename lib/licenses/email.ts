import { addNotification } from "@/lib/commerce/storage";

const EMAIL_LOG_KEY = "juego-todo.license.email-log";

export async function sendLicenseSubmissionConfirmation(
  userId: string,
  userEmail: string,
  fullName: string,
) {
  await addNotification(userId, {
    title: "License Application Received",
    body: `Your JTGC license application for ${fullName} was submitted successfully and is pending admin review.`,
  });

  if (typeof window === "undefined") {
    return;
  }

  try {
    const raw = window.localStorage.getItem(EMAIL_LOG_KEY);
    const log = raw ? (JSON.parse(raw) as Array<{ to: string; subject: string; sentAt: string }>) : [];
    log.unshift({
      to: userEmail,
      subject: "JTGC License Application Received",
      sentAt: new Date().toISOString(),
    });
    window.localStorage.setItem(EMAIL_LOG_KEY, JSON.stringify(log.slice(0, 20)));
  } catch {
    // Ignore demo email log failures.
  }
}
