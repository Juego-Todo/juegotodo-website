import { addNotification } from "@/lib/commerce/storage";
import { sendLicenseSubmissionEmail } from "@/lib/platform/email";

export async function sendLicenseSubmissionConfirmation(
  userId: string,
  userEmail: string,
  fullName: string,
) {
  await addNotification(userId, {
    title: "License Application Received",
    body: `Your JTGC license application for ${fullName} was submitted successfully and is pending admin review.`,
  });

  try {
    await sendLicenseSubmissionEmail(userId, userEmail, fullName);
  } catch {
    // Notification already recorded in-app.
  }
}
