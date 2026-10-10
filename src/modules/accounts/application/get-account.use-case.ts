import { DomainError } from "../../../shared/domain/domain-error.js";
import type { AccountRepository } from "../domain/account-repository.js";
import type { AccountOutput } from "./account-dto.js";
import { toAccountOutput } from "./mappers.js";

export class GetAccountUseCase {
  constructor(private readonly accounts: AccountRepository) {}

  async execute(accountId: string): Promise<AccountOutput> {
    const account = await this.accounts.findById(accountId);
    if (!account) {
      throw new DomainError("ACCOUNT_NOT_FOUND", "Conta não encontrada.");
    }
    return toAccountOutput(account);
  }
}
