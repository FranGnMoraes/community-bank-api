import { DomainError } from "../../../shared/domain/domain-error.js";
import { Money } from "../../../shared/domain/money.js";

/**
 * Política de depósito (padrão Strategy). Uma regra nova, como um limite
 * diferente para empreendimentos solidários, vira uma nova implementação,
 * sem alterar controller nem caso de uso.
 */
export interface DepositPolicy {
  check(amount: Money): void;
}

export class MaxAmountDepositPolicy implements DepositPolicy {
  constructor(private readonly maxAmount: Money) {}

  check(amount: Money): void {
    if (amount.isGreaterThan(this.maxAmount)) {
      throw new DomainError(
        "DEPOSIT_LIMIT_EXCEEDED",
        "O depósito passa do limite por operação. Procure o gerente da sua conta."
      );
    }
  }
}

/** Limite operacional por depósito: R$ 5.000,00. */
export const DEFAULT_DEPOSIT_POLICY = new MaxAmountDepositPolicy(Money.fromCents(500_000));
