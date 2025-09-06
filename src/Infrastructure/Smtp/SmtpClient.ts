import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export interface ISmtpClient {
    send(input: {
        from: string;
        to: string | string[];
        cc?: string | string[];
        bcc?: string | string[];
        subject: string;
        text?: string;
        html?: string;
    }): Promise<{ messageId: string }>;
}

export class SmtpClient implements ISmtpClient {
    private transporter: Transporter;

    constructor(options: {
        host: string;
        port: number;
        secure: boolean;
        user?: string;
        pass?: string;
    }) {
        const auth =
            options.user && options.pass
                ? `${encodeURIComponent(options.user)}:${encodeURIComponent(options.pass)}@`
                : "";
        const protocol = options.secure ? "smtps" : "smtp";
        const smtpUrl = `${protocol}://${auth}${options.host}:${options.port}`;
        this.transporter = nodemailer.createTransport(smtpUrl);
    }

    async send(input: {
        from: string;
        to: string | string[];
        cc?: string | string[];
        bcc?: string | string[];
        subject: string;
        text?: string;
        html?: string;
    }): Promise<{ messageId: string; }> {
        const info = await this.transporter.sendMail({
            from: input.from,
            to: input.to,
            cc: input.cc,
            bcc: input.bcc,
            subject: input.subject,
            text: input.text,
            html: input.html,
        });
        return { messageId: info.messageId };
    }
}