import { DomainError } from "../../../shared/domain/domain-error.js";
import type { Clock, IdGenerator } from "../../../shared/domain/ports.js";
import { Account } from "../domain/account.js";
import type { AccountRepository } from "../domain/account-repository.js";
import type { AccountOutput } from "./account-dto.js";
import { toAccountOutput } from "./mappers.js";

export interface OpenAccountInput {
  ownerName: string;
  document: string;
}

export class OpenAccountUseCase {
  constructor(
    private readonly accounts: AccountRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock
  ) {}

  async execute(input: OpenAccountInput): Promise<AccountOutput> {
    const account = Account.open({
      id: this.ids.next(),
      ownerName: input.ownerName,
      document: input.document,
      now: this.clock.now()
    });

    const existing = await this.accounts.findByDocument(account.document);
    if (existing) {
      throw new DomainError("DOCUMENT_ALREADY_REGISTERED", "Já existe uma conta para este CPF.");
    }

    await this.accounts.save(account);
    return toAccountOutput(account);
  }
}
