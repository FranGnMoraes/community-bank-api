import type { AccountRepository } from "../domain/account-repository.js";
import type { AccountOutput } from "./account-dto.js";
import { toAccountOutput } from "./mappers.js";

export class ListAccountsUseCase {
  constructor(private readonly accounts: AccountRepository) {}

  async execute(): Promise<AccountOutput[]> {
    const accounts = await this.accounts.findAll();
    return accounts.map(toAccountOutput);
  }
}
