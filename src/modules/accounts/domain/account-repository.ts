import type { Account } from "./account.js";

/**
 * Porta de persistência. A interface pertence ao domínio, e a infraestrutura
 * a implementa (Inversão de Dependência). Trocar memória por PostgreSQL
 * não altera casos de uso nem regras de negócio.
 */
export interface AccountRepository {
  findById(id: string): Promise<Account | null>;
  findByDocument(document: string): Promise<Account | null>;
  findAll(): Promise<Account[]>;
  save(account: Account): Promise<void>;
}
