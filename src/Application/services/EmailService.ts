import type { SendEmailDto } from "../../Shared/types.ts";
import type { ISmtpClient } from "../../Infrastructure/Smtp/SmtpClient.ts";

export class EmailService {
    constructor(private readonly smtp: ISmtpClient, private readonly from: string) { }

    async send(dto: SendEmailDto) {
        if (!dto.to || !dto.subject || (!dto.text && !dto.html)) {
            throw new Error("Required fields: to, subject and (text or html).");
        }
        const payload = {
            from: this.from,
            to: dto.to,
            subject: dto.subject,
            ...(dto.cc !== undefined ? { cc: dto.cc } : {}),
            ...(dto.bcc !== undefined ? { bcc: dto.bcc } : {}),
            ...(dto.text !== undefined ? { text: dto.text } : {}),
            ...(dto.html !== undefined ? { html: dto.html } : {}),
        };

        return this.smtp.send(payload);
    }
}