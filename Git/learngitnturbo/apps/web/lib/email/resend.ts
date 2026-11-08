import {
  type StaffInviteEmailParams,
  renderStaffInviteHtml,
  renderStaffInvitePlainText,
} from "./templates/staff-invite-email";

export interface SendStaffInviteEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Modular Resend email adapter for Orgetise Showroom OS.
 * Dispatches branded transaction emails via Resend's REST API.
 * Gracefully degrades if RESEND_API_KEY is missing or invalid in local development.
 */
export async function sendStaffInviteEmail(
  params: StaffInviteEmailParams
): Promise<SendStaffInviteEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Orgetise Showroom OS <onboarding@resend.dev>";

  // Development / sandbox fallback when RESEND_API_KEY is not yet supplied
  if (!apiKey) {
    console.warn(
      `[Resend] RESEND_API_KEY is not configured. Skipping automated email delivery for ${params.to}.`
    );
    console.info(`[Resend] Direct invite link generated: ${params.inviteUrl}`);
    return {
      success: false,
      error: "RESEND_API_KEY is not configured in environment variables.",
    };
  }

  try {
    const subject = `${params.inviterName} invited you to join ${params.dealershipName} on Orgetise`;
    const html = renderStaffInviteHtml(params);
    const text = renderStaffInvitePlainText(params);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [params.to],
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      let errorDetail = `HTTP ${res.status} ${res.statusText}`;
      try {
        const errorJson = await res.json();
        errorDetail =
          errorJson.message ||
          errorJson.name ||
          JSON.stringify(errorJson) ||
          errorDetail;
      } catch {
        // Fallback to text status
      }

      console.error(
        `[Resend] Failed to send staff invite email to ${params.to}: ${errorDetail}`
      );
      return {
        success: false,
        error: errorDetail,
      };
    }

    const data = (await res.json()) as { id: string };
    console.info(
      `[Resend] Staff invite email successfully dispatched to ${params.to} (Message ID: ${data.id})`
    );

    return {
      success: true,
      messageId: data.id,
    };
  } catch (err: any) {
    const errorMsg =
      err?.message || "An unexpected error occurred while communicating with Resend.";
    console.error(`[Resend] Network exception while sending staff invite:`, err);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

