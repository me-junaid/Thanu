import { ROLE_DESCRIPTIONS } from "../../schemas/team";

export interface StaffInviteEmailParams {
  to: string;
  recipientName: string;
  inviterName: string;
  dealershipName: string;
  role: string;
  roleLabel: string;
  inviteUrl: string;
  expiresAt: string | Date;
}

/**
 * Format the 72-hour expiry timestamp into a readable date string
 */
export function formatInviteExpiryDate(expiresAt: string | Date): string {
  try {
    const date = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
    if (isNaN(date.getTime())) return "72 hours from now";
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    }) + " IST";
  } catch {
    return "72 hours from now";
  }
}

/**
 * Generate responsive, luxury HTML email for staff invitations
 * Styled with Orgetise automotive aesthetic (Linear / Apple / Porsche vibes)
 * Designed for maximum email client compatibility (Apple Mail, Gmail, Outlook)
 */
export function renderStaffInviteHtml(params: StaffInviteEmailParams): string {
  const {
    to,
    recipientName,
    inviterName,
    dealershipName,
    role,
    roleLabel,
    inviteUrl,
    expiresAt,
  } = params;

  const formattedExpiry = formatInviteExpiryDate(expiresAt);
  const roleDescription =
    ROLE_DESCRIPTIONS[role] || "Full access to showroom tools and operational workflows.";
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>You're invited to join ${dealershipName} on Orgetise</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      background-color: #f4f5f8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    table {
      border-collapse: separate;
      border-spacing: 0;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    .email-container {
      max-width: 580px;
      margin: 0 auto;
      padding: 40px 16px;
    }
    .card {
      background-color: #ffffff;
      border-radius: 20px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      overflow: hidden;
      padding: 40px 36px;
    }
    @media only screen and (max-width: 600px) {
      .card {
        padding: 28px 20px !important;
        border-radius: 16px !important;
      }
      .email-container {
        padding: 20px 8px !important;
      }
      .cta-button {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
        box-sizing: border-box !important;
      }
    }
  </style>
</head>
<body style="background-color: #f4f5f8; margin: 0; padding: 0;">
  <div class="email-container">
    
    <!-- Top Brand Header -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background-color: #09090b; color: #ffffff; padding: 8px 16px; border-radius: 100px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;">
                /// ORGETISE &nbsp;·&nbsp; SHOWROOM OS
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Main Card -->
    <div class="card">
      
      <!-- Greeting & Subject -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;">
              Team Invitation
            </div>
            <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 800; color: #09090b; letter-spacing: -0.02em; line-height: 1.25;">
              Join ${dealershipName}
            </h1>
            <p style="margin: 0 0 24px 0; font-size: 15px; color: #374151; line-height: 1.6;">
              Hello <strong>${recipientName}</strong>,
            </p>
            <p style="margin: 0 0 28px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
              <strong>${inviterName}</strong> has invited you to join their dealership team on Orgetise as <strong>${roleLabel}</strong>.
            </p>
          </td>
        </tr>
      </table>

      <!-- Showroom & Role Summary Box -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 14px; margin-bottom: 32px;">
        <tr>
          <td style="padding: 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom: 12px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; width: 35%;">
                  Showroom
                </td>
                <td style="padding-bottom: 12px; font-size: 14px; font-weight: 700; color: #111827;">
                  ${dealershipName}
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 12px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">
                  Assigned Role
                </td>
                <td style="padding-bottom: 12px;">
                  <span style="display: inline-block; background-color: #09090b; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.02em;">
                    ${roleLabel}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 12px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; vertical-align: top;">
                  Scope
                </td>
                <td style="padding-bottom: 12px; font-size: 13px; color: #4b5563; line-height: 1.4;">
                  ${roleDescription}
                </td>
              </tr>
              <tr>
                <td style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">
                  Expires In
                </td>
                <td style="font-size: 13px; font-weight: 600; color: #b45309;">
                  72 Hours (${formattedExpiry})
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Primary Call to Action Button -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
        <tr>
          <td align="center">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${inviteUrl}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="18%" stroke="f" fillcolor="#09090b">
              <w:anchorlock/>
              <center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:bold;">Accept Invitation &rarr;</center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-->
            <a href="${inviteUrl}" target="_blank" rel="noopener noreferrer" class="cta-button" style="display: inline-block; background-color: #09090b; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 15px 36px; border-radius: 12px; letter-spacing: -0.01em; box-shadow: 0 2px 8px rgba(0,0,0,0.12);">
              Accept Invitation &rarr;
            </a>
            <!--<![endif]-->
          </td>
        </tr>
      </table>

      <!-- Fallback Direct Link -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #f3f4f6; padding-top: 24px;">
        <tr>
          <td>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="margin: 0 0 20px 0; font-size: 12px; color: #2563eb; word-break: break-all; line-height: 1.4;">
              <a href="${inviteUrl}" style="color: #2563eb; text-decoration: underline;">${inviteUrl}</a>
            </p>
            <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">
              This invitation was issued for <strong>${to}</strong>. If you did not expect this invitation, you can safely ignore this email.
            </p>
          </td>
        </tr>
      </table>

    </div>

    <!-- Email Footer -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
      <tr>
        <td align="center" style="font-size: 11px; color: #9ca3af; line-height: 1.6;">
          <p style="margin: 0 0 4px 0;">
            Orgetise Technologies Pvt. Ltd. · Commercial Pre-Owned Dealership Platform
          </p>
          <p style="margin: 0;">
            &copy; ${currentYear} Orgetise. All rights reserved.
          </p>
        </td>
      </tr>
    </table>

  </div>
</body>
</html>`;
}

/**
 * Generate plaintext email version for text-only email clients
 */
export function renderStaffInvitePlainText(params: StaffInviteEmailParams): string {
  const {
    to,
    recipientName,
    inviterName,
    dealershipName,
    roleLabel,
    inviteUrl,
    expiresAt,
  } = params;

  const formattedExpiry = formatInviteExpiryDate(expiresAt);
  const currentYear = new Date().getFullYear();

  return `/// ORGETISE — PRE-OWNED AUTOMOBILE SAAS

Hello ${recipientName},

${inviterName} has invited you to join their dealership team on Orgetise.

INVITATION DETAILS:
-------------------------------------------------------
Showroom:      ${dealershipName}
Assigned Role: ${roleLabel}
Recipient:     ${to}
Validity:      72 Hours (Expires: ${formattedExpiry})
-------------------------------------------------------

To accept your invitation and set up your staff workspace, visit the link below:

${inviteUrl}

This invitation was generated for ${to}. If you were not expecting this invitation, you can safely ignore this email.

—
Orgetise Technologies Pvt. Ltd.
© ${currentYear} Orgetise · All rights reserved.
`;
}

