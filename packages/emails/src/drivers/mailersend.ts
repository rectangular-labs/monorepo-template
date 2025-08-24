import type { EmailDriver, EmailOptions, EmailResult, MailersendConfig, EmailAddress } from "../types.js";

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

export function mailersendDriver(config: MailersendConfig): EmailDriver {
  return {
    name: "mailersend",
    async send(options: EmailOptions): Promise<EmailResult> {
      try {
        const { MailerSend, EmailParams, Sender, Recipient } = await import("mailersend");
        
        const mailerSend = new MailerSend({
          apiKey: config.apiKey,
        });

        const fromAddr = normalizeEmailAddress(options.from);
        const sentFrom = new Sender(fromAddr.email, fromAddr.name);

        const toAddresses = normalizeEmailAddresses(options.to);
        const recipients = toAddresses.map(addr => new Recipient(addr.email, addr.name));

        const emailParams = new EmailParams()
          .setFrom(sentFrom)
          .setTo(recipients)
          .setSubject(options.subject);

        if (options.html) {
          emailParams.setHtml(options.html);
        }

        if (options.text) {
          emailParams.setText(options.text);
        }

        if (options.cc) {
          const ccAddresses = normalizeEmailAddresses(options.cc);
          const ccRecipients = ccAddresses.map(addr => new Recipient(addr.email, addr.name));
          emailParams.setCc(ccRecipients);
        }

        if (options.bcc) {
          const bccAddresses = normalizeEmailAddresses(options.bcc);
          const bccRecipients = bccAddresses.map(addr => new Recipient(addr.email, addr.name));
          emailParams.setBcc(bccRecipients);
        }

        if (options.replyTo) {
          const replyToAddr = normalizeEmailAddress(options.replyTo);
          emailParams.setReplyTo(new Recipient(replyToAddr.email, replyToAddr.name));
        }

        const result = await mailerSend.email.send(emailParams);
        return {
          success: true,
          messageId: result.headers?.["x-message-id"] as string,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to send email via MailerSend",
        };
      }
    },
  };
}