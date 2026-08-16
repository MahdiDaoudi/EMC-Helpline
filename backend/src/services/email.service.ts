import nodemailer from "nodemailer";
import { env } from "../config/env";

export type EmailAttachment = {
  filename: string;
  content: Buffer | string;
  contentType?: string;
};

export async function sendPlatformReportEmail({
  to,
  subject,
  html,
  text,
  attachments = [],
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
}) {
  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth:
      env.smtpUser && env.smtpPassword
        ? {
            user: env.smtpUser,
            pass: env.smtpPassword,
          }
        : undefined,
  });

  const info = await transporter.sendMail({
    from: env.smtpFrom,
    to,
    subject,
    text,
    html,
    attachments,
  });

  return {
    accepted: Array.isArray(info.accepted) ? info.accepted : [],
    rejected: Array.isArray(info.rejected) ? info.rejected : [],
    response: info.response,
    messageId: info.messageId,
    hasError: Boolean(info.rejected?.length),
  };
}
