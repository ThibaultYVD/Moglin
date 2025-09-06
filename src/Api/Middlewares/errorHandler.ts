import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (error, _request, result, _next) => {
    console.log("[Error]", error);
    const msg = error instanceof Error ? error.message : "Internal Error";
    const status = msg.startsWith("Required fields") ? 400 : 500;
    result.status(status).json({ error: msg });
}