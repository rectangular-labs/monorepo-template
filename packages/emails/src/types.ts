export interface EmailAddress {
  name?: string;
  address: string;
}

export interface EmailAttachment {
  filename: string;
  content: string | Uint8Array;
  contentType?: string;
  encoding?: string;
}

export interface EmailOptions {
  from: string | EmailAddress;
  to: string | string[] | EmailAddress | EmailAddress[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[] | EmailAddress | EmailAddress[];
  bcc?: string | string[] | EmailAddress | EmailAddress[];
  replyTo?: string | EmailAddress;
  attachments?: EmailAttachment[];
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailDriver {
  name: string;
  send(options: EmailOptions): Promise<EmailResult>;
}

export interface EmailClient {
  send(options: EmailOptions): Promise<EmailResult>;
}

export type AwsSesConfig = {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  fromEmail?: string;
};

export type MailersendConfig = {
  apiKey: string;
};

export type NodemailerConfig = {
  host: string;
  port: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
};

export type PostmarkConfig = {
  apiKey: string;
};

export type ResendConfig = {
  apiKey: string;
};

export type SendgridConfig = {
  apiKey: string;
};

export type PlunkConfig = {
  apiKey: string;
};