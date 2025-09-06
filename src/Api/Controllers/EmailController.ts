import { Router } from "express";
import type { EmailService } from "../../Application/services/EmailService.js";
import type { SendEmailDto } from "../../Shared/types.js";

export class EmailController {
    public readonly router = Router();

    constructor(private readonly service: EmailService) {
        this.router.post("/send", this.send);
    }

    private send = async (req: any, res: any, next: any) => {
        try {
            const body = req.body as SendEmailDto;
            const result = await this.service.send(body);
            res.status(200).json({ message: "Email sent.", messageId: result.messageId });
        } catch (error) {
            next(error);
        }
    }
}