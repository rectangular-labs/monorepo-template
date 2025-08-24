import type { EmailDriver, EmailOptions, EmailResult, AwsSesConfig, EmailAddress } from "../types.js";

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

export function awsSesDriver(config: AwsSesConfig): EmailDriver {
  return {
    name: "aws-ses",
    async send(options: EmailOptions): Promise<EmailResult> {
      try {
        const { SESv2Client, SendEmailCommand } = await import("@aws-sdk/client-sesv2");
        
        const client = new SESv2Client({
          region: config.region,
          ...(config.accessKeyId && config.secretAccessKey && {
            credentials: {
              accessKeyId: config.accessKeyId,
              secretAccessKey: config.secretAccessKey,
            },
          }),
        });

        const toAddresses = normalizeEmailAddresses(options.to);
        const ccAddresses = normalizeEmailAddresses(options.cc);
        const bccAddresses = normalizeEmailAddresses(options.bcc);

        const command = new SendEmailCommand({
          FromEmailAddress: config.fromEmail || normalizeEmailAddress(options.from),
          Destination: {
            ToAddresses: toAddresses,
            ...(ccAddresses.length > 0 && { CcAddresses: ccAddresses }),
            ...(bccAddresses.length > 0 && { BccAddresses: bccAddresses }),
          },
          Content: {
            Simple: {
              Subject: {
                Data: options.subject,
                Charset: "UTF-8",
              },
              Body: {
                ...(options.html && {
                  Html: {
                    Data: options.html,
                    Charset: "UTF-8",
                  },
                }),
                ...(options.text && {
                  Text: {
                    Data: options.text,
                    Charset: "UTF-8",
                  },
                }),
              },
            },
          },
          ...(options.replyTo && {
            ReplyToAddresses: [normalizeEmailAddress(options.replyTo)],
          }),
        });

        const result = await client.send(command);
        return {
          success: true,
          messageId: result.MessageId,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to send email via AWS SES",
        };
      }
    },
  };
}