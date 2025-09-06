import type { RequestHandler } from "express";
import type { ApiKeyStore } from "./apiKeyRecord.js";
import { verifyApiKey } from "./apiKeys.js";
import { error } from "console";

declare module "express-serve-static-core" {
    interface Request {
        apiKeyId?: string;
        apiKeyScopes?: string[];
    }
}

export function requireApiKey(
    store: ApiKeyStore,
    requiredScopes: string[] = []
): RequestHandler {
    return async (req, res, next) => {
        try {
            const header = req.header("x-api-key") || req.header("authorization");
            const result = await verifyApiKey(store, header);
            if (!result.ok) return res.status(401).json({ error: "Invalid API key" });

            // Scopes
            const scopes = result.record.scopes || [];
            const missing = requiredScopes.filter(s => !scopes.includes(s));
            if (missing.length) return res.status(403).json({ error: "Insufficient scope", missing });

            // Attach to request
            req.apiKeyId = result.record.id;
            req.apiKeyScopes = scopes;
            next();
        } catch (error) {
            next(error);
        }
    }
}