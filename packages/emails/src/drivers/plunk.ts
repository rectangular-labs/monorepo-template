import type { EmailDriver, EmailOptions, EmailResult, PlunkConfig, EmailAddress } from "../types.js";

function normalizeEmailAddress(addr: string | EmailAddress): string {
  if (typeof addr === "string") return addr;
  return addr.name ? `"${addr.name}" <${addr.address}>` : addr.address;
}

function normalizeEmailAddresses(addrs?: string | string[] | EmailAddress | EmailAddress[]): string[] {
  if (!addrs) return [];
  if (Array.isArray(addrs)) {
    return addrs.map(normalizeEmailAddress);
  }
  return [normalizeEmailAddress(addrs)];
}

export function plunkDriver(config: PlunkConfig): EmailDriver {
  return {
    name: "plunk",
    async send(options: EmailOptions): Promise<EmailResult> {
      try {
        const { Plunk } = await import("@plunk/node");
        
        const plunk = new Plunk(config.apiKey);

        const toAddresses = normalizeEmailAddresses(options.to);
        
        const email = {
          from: normalizeEmailAddress(options.from),
          to: toAddresses[0], // Plunk typically sends to one recipient at a time
          subject: options.subject,
          ...(options.html && { html: options.html }),
          ...(options.text && { text: options.text }),
          ...(options.replyTo && { replyTo: normalizeEmailAddress(options.replyTo) }),
        };

        const result = await plunk.emails.send(email);
        return {
          success: true,
          messageId: result.id,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to send email via Plunk",
        };
      }
    },
  };
}