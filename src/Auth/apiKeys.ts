import crypto from "crypto";
import type { ApiKeyRecord, ApiKeyStore } from "./apiKeyRecord.js";

const KEY_PREFIX = "ak_live";
const KEY_PREFIX_TEST = "ak_test";

function randBase32(bytes: number) {
    return crypto.randomBytes(bytes).toString("base64url");
}

function scryptHash(secret: string, salt: Buffer) {
    return crypto.scryptSync(secret, salt, 64);
}

export async function createApiKey(
    store: ApiKeyStore,
    params: { name: string, scopes: string[] }
): Promise<{ plaintext: string; id: string }> {
    const id = randBase32(10);
    const secret = randBase32(24);
    const plaintext = `${KEY_PREFIX}_${id}.${secret}`;

    const salt = crypto.randomBytes(16);
    const hash = scryptHash(secret, salt);

    const record: ApiKeyRecord = {
        id,
        salt: salt.toString("base64"),
        hash: hash.toString("base64"),
        name: params.name,
        scopes: params.scopes,
        revoked: false,
        createdAt: new Date(),
    };

    await store.save(record);
    return { plaintext, id };
}

export function parseApiKey(raw?: string): { id: string; secret: string } | null {
    if (!raw) return null;

    const token = raw.trim();
    const cleaned = token.startsWith("ApiKey ") ? token.slice(7).trim() : token;
    const [prefixId, secret] = cleaned.split(".");

    if (!prefixId || !secret) return null;
    if (!prefixId.startsWith(`${KEY_PREFIX}_`)) return null;

    const id = prefixId.slice(`${KEY_PREFIX}_`.length);

    if (!id || !secret) return null;
    return { id, secret };
}

export async function verifyApiKey(
    store: ApiKeyStore,
    raw?: string
): Promise<{ ok: true; record: ApiKeyRecord } | { ok: false; reason: string }> {
    const parsed = parseApiKey(raw)
    if (!parsed) return { ok: false, reason: "invalid" };

    const record = await store.getById(parsed.id);
    if (!record || record.revoked) return { ok: false, reason: "invalid" };

    const salt = Buffer.from(record.salt, "base64");
    const expected = Buffer.from(record.hash, "base64");
    const actual = scryptHash(parsed.secret, salt);

    if (
        expected.length === actual.length &&
        crypto.timingSafeEqual(expected, actual)
    ) {
        return { ok: true, record: record };
    }
    return { ok: false, reason: "invalid" };
}