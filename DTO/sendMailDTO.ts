export interface SendMailDTO {
  requestId: string | number | string[];
  options: MailInterface;
}

interface MailInterface {
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  text?: string;
  html?: string;
}
