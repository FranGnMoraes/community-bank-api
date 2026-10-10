import type { Money } from "../../../shared/domain/money.js";

export type TransactionType = "DEPOSIT";

/**
 * Lançamento na conta. É imutável: depois de registrado, não é alterado
 * nem apagado. Isso atende ao driver de auditabilidade.
 */
export interface Transaction {
  readonly id: string;
  readonly type: TransactionType;
  readonly amount: Money;
  readonly description: string;
  readonly occurredAt: Date;
}
