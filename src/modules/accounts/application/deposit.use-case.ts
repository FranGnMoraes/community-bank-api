import { DomainError } from "../../../shared/domain/domain-error.js";
import type { Money } from "../../../shared/domain/money.js";
import type { Clock, IdGenerator } from "../../../shared/domain/ports.js";
import type { AccountRepository } from "../domain/account-repository.js";
import type { DepositPolicy } from "../domain/deposit-policy.js";
import type { DepositOutput } from "./account-dto.js";

export interface DepositInput {
  accountId: string;
  amount: Money;
  description?: string;
}

/**
 * Caso de uso "Depositar em conta corrente".
 * Coordena o fluxo; as regras ficam na entidade Account e na DepositPolicy.
 */
export class DepositUseCase {
  constructor(
    private readonly accounts: AccountRepository,
    private readonly policy: DepositPolicy,
    private readonly ids: IdGenerator,
    private readonly clock: Clock
  ) {}

  async execute(input: DepositInput): Promise<DepositOutput> {
    const account = await this.accounts.findById(input.accountId);
    if (!account) {
      throw new DomainError("ACCOUNT_NOT_FOUND", "Conta não encontrada.");
    }

    this.policy.check(input.amount);

    const transaction = account.deposit({
      transactionId: this.ids.next(),
      amount: input.amount,
      description: input.description?.trim() || "Depósito em conta corrente",
      now: this.clock.now()
    });

    await this.accounts.save(account);

    return {
      transactionId: transaction.id,
      accountId: account.id,
      amountInCents: transaction.amount.cents,
      balanceInCents: account.balance.cents,
      occurredAt: transaction.occurredAt
    };
  }
}
