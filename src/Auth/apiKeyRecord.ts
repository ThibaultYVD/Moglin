export type ApiKeyRecord = {
    id: string;
    salt: string;
    hash: string;
    name: string;
    scopes: string[];
    revoked: boolean;
    createdAt: Date;
}

export interface ApiKeyStore {
    getById(id: string): Promise<ApiKeyRecord | undefined>;
    save(record: ApiKeyRecord): Promise<void>;
    revoke(id: string): Promise<void>;
}

// Démo: stockage mémoire. Remplace plus tard par Prisma/SQL/Redis.
export class InMemoryApiKeyStore implements ApiKeyStore {
    private db = new Map<string, ApiKeyRecord>();
    async getById(id: string) { return this.db.get(id); }
    async save(record: ApiKeyRecord) { this.db.set(record.id, record); }
    async revoke(id: string) {
        const r = this.db.get(id); if (r) { r.revoked = true; this.db.set(id, r); }
    }
}