import { DatabaseSync } from "node:sqlite";
import { CreditRequest } from "../domain/credit-request.js";
import type { CreditRequestRepository } from "../domain/credit-request-repository.port.js";
import { SolidarityEnterprise } from "../domain/solidarity-enterprise.js";
import { Money } from "../../../shared/domain/money.js";

/**
 * Driven Adapter (Adaptador Secundário de Saída) — Arquitetura Hexagonal.
 * Implementa a Output Port CreditRequestRepository utilizando persistência real
 * em banco de dados relacional SQLite (mecanismo nativo do Node.js).
 */
export class SqliteCreditRequestRepository implements CreditRequestRepository {
  private db: DatabaseSync;

  constructor(databasePath: string = ":memory:") {
    this.db = new DatabaseSync(databasePath);
    this.init();
  }

  private init(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS credit_requests (
        id TEXT PRIMARY KEY,
        enterprise_name TEXT NOT NULL,
        community_area TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        members_count INTEGER NOT NULL,
        amount_cents INTEGER NOT NULL,
        purpose TEXT NOT NULL,
        installments INTEGER NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        rejection_reason TEXT
      );
    `);
  }

  async save(request: CreditRequest): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO credit_requests (
        id, enterprise_name, community_area, activity_type, members_count,
        amount_cents, purpose, installments, status, created_at, rejection_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        rejection_reason = excluded.rejection_reason
    `);

    stmt.run(
      request.id,
      request.enterprise.name,
      request.enterprise.communityArea,
      request.enterprise.activityType,
      request.enterprise.membersCount,
      request.amount.cents,
      request.purpose,
      request.installments,
      request.status,
      request.createdAt.toISOString(),
      request.rejectionReason ?? null
    );
  }

  async findById(id: string): Promise<CreditRequest | null> {
    const stmt = this.db.prepare(`SELECT * FROM credit_requests WHERE id = ?`);
    const row = stmt.get(id) as Record<string, any> | undefined;
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async listAll(): Promise<CreditRequest[]> {
    const stmt = this.db.prepare(`SELECT * FROM credit_requests ORDER BY created_at DESC`);
    const rows = stmt.all() as Record<string, any>[];
    return rows.map((r) => this.mapToDomain(r));
  }

  async findByEnterpriseName(enterpriseName: string): Promise<CreditRequest[]> {
    const stmt = this.db.prepare(`SELECT * FROM credit_requests WHERE enterprise_name = ? ORDER BY created_at DESC`);
    const rows = stmt.all(enterpriseName) as Record<string, any>[];
    return rows.map((r) => this.mapToDomain(r));
  }

  private mapToDomain(row: Record<string, any>): CreditRequest {
    return CreditRequest.reconstitute({
      id: String(row.id),
      enterprise: new SolidarityEnterprise(
        String(row.enterprise_name),
        String(row.community_area),
        String(row.activity_type),
        Number(row.members_count)
      ),
      amount: Money.fromCents(Number(row.amount_cents)),
      purpose: String(row.purpose),
      installments: Number(row.installments),
      status: row.status as any,
      createdAt: new Date(String(row.created_at)),
      rejectionReason: row.rejection_reason ? String(row.rejection_reason) : undefined
    });
  }
}
