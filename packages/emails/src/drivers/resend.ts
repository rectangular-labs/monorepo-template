import { Buffer } from "node:buffer";
import type { EmailDriver, EmailOptions, EmailResult, ResendConfig, EmailAddress } from "../types.js";

function normalizeEmailAddress(addr: string | EmailAddress): string | { name?: string; email: string } {
  if (typeof addr === "string") return addr;
  return { email: addr.address, ...(addr.name && { name: addr.name }) };
}

function normalizeEmailAddresses(addrs?: string | string[] | EmailAddress | EmailAddress[]): (string | { name?: string; email: string })[] {
  if (!addrs) return [];
  if (Array.isArray(addrs)) {
    return addrs.map(normalizeEmailAddress);
  }
  return [normalizeEmailAddress(addrs)];
}

export function resendDriver(config: ResendConfig): EmailDriver {
  return {
    name: "resend",
    async send(options: EmailOptions): Promise<EmailResult> {
      try {
        const { Resend } = await import("resend");
        
        const resend = new Resend(config.apiKey);

        const email = {
          from: normalizeEmailAddress(options.from),
          to: normalizeEmailAddresses(options.to),
          subject: options.subject,
          ...(options.html && { html: options.html }),
          ...(options.text && { text: options.text }),
          ...(options.cc && { cc: normalizeEmailAddresses(options.cc) }),
          ...(options.bcc && { bcc: normalizeEmailAddresses(options.bcc) }),
          ...(options.replyTo && { reply_to: normalizeEmailAddress(options.replyTo) }),
          ...(options.attachments && {
            attachments: options.attachments.map(att => ({
              filename: att.filename,
              content: typeof att.content === "string" ? Buffer.from(att.content) : Buffer.from(att.content),
              contentType: att.contentType,
            })),
          }),
        };

        const result = await resend.emails.send(email);
        
        if (result.error) {
          return {
            success: false,
            error: result.error.message,
          };
        }

        return {
          success: true,
          messageId: result.data?.id,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to send email via Resend",
        };
      }
    },
  };
}