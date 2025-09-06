import "dotenv/config";

export class Config {
    readonly port: number;
    readonly smtpHost: string;
    readonly smtpPort: number;
    readonly smtpSecure: boolean;
    readonly smtpUser?: string | undefined;
    readonly smtpPass?: string | undefined;
    readonly fromEmail: string;

    constructor(env = process.env) {
        this.port = Number(env.PORT ?? 3000);
        this.smtpHost = (env.SMTP_HOST ?? "");
        this.smtpPort = Number(env.SMTP_PORT ?? 587);
        this.smtpSecure = (env.SMTP_SECURE ?? "false") === "true";
        this.smtpUser = env.SMTP_USER ?? undefined;
        this.smtpPass = env.SMTP_PASS ?? undefined;
        this.fromEmail = env.FROM_EMAIL ?? "";

        this.validate();
    }

    private validate() {
        const missing: string[] = [];
        if (!this.smtpHost) missing.push("SMTP_HOST");
        if (!this.smtpPort) missing.push("SMTP_PORT");
        if (!this.fromEmail) missing.push("FROM_EMAIL");
        if (missing.length) {
            throw new Error(
                `Missing environment variables: ${missing.join(", ")}. Please check your .env.`
            );
        }
    }
}