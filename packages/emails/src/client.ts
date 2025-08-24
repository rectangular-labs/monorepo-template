import type { EmailClient, EmailDriver, EmailOptions, EmailResult } from "./types.js";

export interface EmailClientConfig {
  driver: EmailDriver;
}

class EmailClientImpl implements EmailClient {
  constructor(private driver: EmailDriver) {}

  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      return await this.driver.send(options);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
}

export function createEmailClient(config: EmailClientConfig): EmailClient {
  return new EmailClientImpl(config.driver);
}