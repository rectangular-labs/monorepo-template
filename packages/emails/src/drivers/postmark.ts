import { Buffer } from "node:buffer";
import type { EmailDriver, EmailOptions, EmailResult, PostmarkConfig, EmailAddress } from "../types.js";

function normalizeEmailAddress(addr: string | EmailAddress): string {
  if (typeof addr === "string") return addr;
  return addr.name ? `"${addr.name}" <${addr.address}>` : addr.address;
}

function normalizeEmailAddresses(addrs?: string | string[] | EmailAddress | EmailAddress[]): string {
  if (!addrs) return "";
  if (Array.isArray(addrs)) {
    return addrs.map(normalizeEmailAddress).join(",");
  }
  return normalizeEmailAddress(addrs);
}

export function postmarkDriver(config: PostmarkConfig): EmailDriver {
  return {
    name: "postmark",
    async send(options: EmailOptions): Promise<EmailResult> {
      try {
        const { ServerClient } = await import("postmark");
        
        const client = new ServerClient(config.apiKey);

        const email = {
          From: normalizeEmailAddress(options.from),
          To: normalizeEmailAddresses(options.to),
          Subject: options.subject,
          ...(options.html && { HtmlBody: options.html }),
          ...(options.text && { TextBody: options.text }),
          ...(options.cc && { Cc: normalizeEmailAddresses(options.cc) }),
          ...(options.bcc && { Bcc: normalizeEmailAddresses(options.bcc) }),
          ...(options.replyTo && { ReplyTo: normalizeEmailAddress(options.replyTo) }),
          ...(options.attachments && {
            Attachments: options.attachments.map(att => ({
              Name: att.filename,
              Content: typeof att.content === "string" ? att.content : Buffer.from(att.content).toString("base64"),
              ContentType: att.contentType || "application/octet-stream",
            })),
          }),
        };

        const result = await client.sendEmail(email);
        return {
          success: true,
          messageId: result.MessageID,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to send email via Postmark",
        };
      }
    },
  };
}