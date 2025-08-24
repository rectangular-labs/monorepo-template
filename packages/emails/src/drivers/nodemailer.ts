import type { EmailDriver, EmailOptions, EmailResult, NodemailerConfig, EmailAddress } from "../types.js";

function normalizeEmailAddress(addr: string | EmailAddress): string {
  if (typeof addr === "string") return addr;
  return addr.name ? `"${addr.name}" <${addr.address}>` : addr.address;
}

function normalizeEmailAddresses(addrs?: string | string[] | EmailAddress | EmailAddress[]): string | string[] {
  if (!addrs) return [];
  if (Array.isArray(addrs)) {
    return addrs.map(normalizeEmailAddress);
  }
  return normalizeEmailAddress(addrs);
}

export function nodemailerDriver(config: NodemailerConfig): EmailDriver {
  return {
    name: "nodemailer",
    async send(options: EmailOptions): Promise<EmailResult> {
      try {
        const nodemailer = await import("nodemailer");
        
        const transporter = nodemailer.default.createTransporter({
          host: config.host,
          port: config.port,
          secure: config.secure,
          auth: config.auth,
        });

        const mailOptions = {
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
              content: att.content,
              contentType: att.contentType,
              encoding: att.encoding,
            })),
          }),
        };

        const info = await transporter.sendMail(mailOptions);
        return {
          success: true,
          messageId: info.messageId,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to send email via Nodemailer",
        };
      }
    },
  };
}