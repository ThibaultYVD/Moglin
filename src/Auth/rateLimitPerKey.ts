import type { RequestHandler } from "express";

export function rateLimitPerKey(options: {
    windowMs: number;
    max: number;
}): RequestHandler {
    const hits = new Map<string, { count: number, resetAt: number }>();

    return (req, res, next) => {
        const key = req.apiKeyId ?? req.ip
        const now = Date.now();
        const record = hits.get(key);

        if (!record || record.resetAt < now) {
            hits.set(key, { count: 1, resetAt: now + options.windowMs });
            return next();
        }
        record.count += 1;

        if (record.count > options.max) {
            const retryAfter = Math.ceil((record.resetAt - now) / 1000);
            res.setHeader("Retry-After", retryAfter.toString());
            return res.status(429).json({ error: "Too many requests" });
        }
        next();
    }
}