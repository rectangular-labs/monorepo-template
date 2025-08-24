import { Buffer } from "node:buffer";
import type { EmailDriver, EmailOptions, EmailResult, SendgridConfig, EmailAddress } from "../types.js";

function normalizeEmailAddress(addr: string | EmailAddress): { email: string; name?: string } {
  if (typeof addr === "string") return { email: addr };
  return { email: addr.address, ...(addr.name && { name: addr.name }) };
}

function normalizeEmailAddresses(addrs?: string | string[] | EmailAddress | EmailAddress[]): { email: string; name?: string }[] {
  if (!addrs) return [];
  if (Array.isArray(addrs)) {
    return addrs.map(normalizeEmailAddress);
  }
  return [normalizeEmailAddress(addrs)];
}

export function sendgridDriver(config: SendgridConfig): EmailDriver {
  return {
    name: "sendgrid",
    async send(options: EmailOptions): Promise<EmailResult> {
      try {
        const sgMail = await import("@sendgrid/mail");
        
        sgMail.default.setApiKey(config.apiKey);

        const msg = {
          from: normalizeEmailAddress(options.from),
          to: normalizeEmailAddresses(options.to),
          subject: options.subject,
          ...(options.html && { html: options.html }),
          ...(options.text && { text: options.text }),
          ...(options.cc && { cc: normalizeEmailAddresses(options.cc) }),
          ...(options.bcc && { bcc: normalizeEmailAddresses(options.bcc) }),
          ...(options.replyTo && { replyTo: normalizeEmailAddress(options.replyTo) }),
          ...(options.attachments && {
            attachments: options.attachments.map(att => ({
              filename: att.filename,
              content: typeof att.content === "string" ? att.content : Buffer.from(att.content).toString("base64"),
              type: att.contentType,
              disposition: "attachment",
            })),
          }),
        };

        const result = await sgMail.default.send(msg);
        return {
          success: true,
          messageId: result[0]?.headers?.["x-message-id"] as string,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to send email via SendGrid",
        };
      }
    },
  };
}