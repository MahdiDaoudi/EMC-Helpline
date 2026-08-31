import { emailTransporter } from "./email.config";

interface SendEmailOption{
    to: string;
    subject: string;
    html: string;
    attachements?: {
        filename: string;
        path?: string;
        content?: Buffer;
    }[];
}

export const sendEmail = async (emailOptions: SendEmailOption) => {
    return emailTransporter.sendMail({
        from: `"EMC HELPLINE" <${process.env.SMTP_USER}>`,
        ...emailOptions
    })
}

// async function aa() {
//     console.log("SMTP CONFIG:", {
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     secure: process.env.SMTP_SECURE,
//     user: process.env.SMTP_USER,
// });
//     await emailTransporter.verify();

// console.log("SMTP connection successful");
// }

// aa();
