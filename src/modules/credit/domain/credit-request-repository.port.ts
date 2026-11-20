import type { CreditRequest } from "./credit-request.js";

/**
 * Porta Secundária (Output Port) — Arquitetura Hexagonal.
 * Declara o contrato necessário para persistência das solicitações de crédito,
 * sem vincular o domínio a ORM, SQL ou biblioteca de banco específica.
 */
export interface CreditRequestRepository {
  save(request: CreditRequest): Promise<void>;
  findById(id: string): Promise<CreditRequest | null>;
  listAll(): Promise<CreditRequest[]>;
  findByEnterpriseName(enterpriseName: string): Promise<CreditRequest[]>;
}
