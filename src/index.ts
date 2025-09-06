import express from "express";
import { Config } from "./Shared/Config.js";
import { SmtpClient } from "./Infrastructure/Smtp/SmtpClient.js";
import { EmailService } from "./Application/services/EmailService.js";
import { EmailController } from "./Api/Controllers/EmailController.js";
import { errorHandler } from "./Api/Middlewares/errorHandler.js";
import { InMemoryApiKeyStore } from "./Auth/apiKeyRecord.js";
import { createApiKey } from "./Auth/apiKeys.js";
import { requireApiKey } from "./Auth/apiKeyMiddleware.js";
import { rateLimitPerKey } from "./Auth/rateLimitPerKey.js";

const config = new Config();

// SMTP
const smtp = new SmtpClient({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    ...(config.smtpUser && config.smtpPass ? { user: config.smtpUser, pass: config.smtpPass } : {})
});

const emailService = new EmailService(smtp, config.fromEmail);
const emailController = new EmailController(emailService);

// Store API keys (démo, mettre un Redis)
const keyStore = new InMemoryApiKeyStore();

// Bootstrapping: Create a testing key at startup
const bootstrap = async () => {
    const { plaintext, id } = await createApiKey(keyStore, {
        name: "local-dev",
        scopes: ["email:send"]
    });
    console.log("API Key (dev only, copy now):", plaintext, "(id:", id, ")");
};
bootstrap();

const app = express();
app.use(express.json());

// Health
app.get("/api", (_req, res) => { res.send("Welcome to the messaging API."); });

// Protect endpoint with API key
app.use(
    "/api/messaging/v1/emails",
    requireApiKey(keyStore, ["email:send"]),
    rateLimitPerKey({ windowMs: 60_000, max: 60 }) // 60 req / minute / key
);

// Routes
app.use("/api/messaging/v1/emails", emailController.router);

// Errors
app.use(errorHandler);

// Start
app.listen(config.port, () => {
    console.log(`Messaging API is listening on http://localhost:${config.port} !`)
});