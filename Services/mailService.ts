import nodemailer, { Transporter } from 'nodemailer';
import logger from '../Logger/logger';
import { SendMailDTO } from '../DTO/sendMailDTO';

export default class MailService {
  private static instance: MailService;
  private transporter: Transporter;

  private constructor() {
    this.transporter = nodemailer.createTransport({});
  }

  static getInstance() {
    if (!MailService.instance) {
      MailService.instance = new MailService();
    }
    return MailService.instance;
  }

  async createConnection() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_TLS === 'yes',
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendMail(sendMailDTO: SendMailDTO) {
    try {
      const { requestId, options } = sendMailDTO;

      const info = await this.transporter.sendMail({
        from: `"Softoo HR" ${process.env.SMTP_MAIL || options.from}`,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      logger.info(`${requestId} - Mail sent successfully!!`);
      logger.info(
        `${requestId} - [MailResponse]=${info.response} [MessageID]=${info.messageId}`
      );

      return info;
    } catch (error) {
      const { requestId } = sendMailDTO;

      logger.error(`${requestId} - Failed to send mail: ${error}`);
      throw error;
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info('Connection verified successfully!');
    } catch (error) {
      logger.error(`Failed to verify connection: ${error}`);
      throw error;
    }
  }

  getTransporter() {
    return this.transporter;
  }
}
