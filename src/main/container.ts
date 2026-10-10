import { randomUUID } from "node:crypto";
import type { Clock, IdGenerator } from "../shared/domain/ports.js";
import { DepositUseCase } from "../modules/accounts/application/deposit.use-case.js";
import { GetAccountUseCase } from "../modules/accounts/application/get-account.use-case.js";
import { ListAccountsUseCase } from "../modules/accounts/application/list-accounts.use-case.js";
import { OpenAccountUseCase } from "../modules/accounts/application/open-account.use-case.js";
import type { AccountRepository } from "../modules/accounts/domain/account-repository.js";
import { DEFAULT_DEPOSIT_POLICY, type DepositPolicy } from "../modules/accounts/domain/deposit-policy.js";
import { InMemoryAccountRepository } from "../modules/accounts/infrastructure/in-memory-account-repository.js";
import { AccountsController } from "../modules/accounts/presentation/accounts.controller.js";

/**
 * Composition root: o único lugar que conhece as implementações concretas.
 * Para trocar a persistência, muda-se apenas esta função.
 */
export interface ContainerOptions {
  accountRepository?: AccountRepository;
  depositPolicy?: DepositPolicy;
  clock?: Clock;
  ids?: IdGenerator;
}

export function buildContainer(options: ContainerOptions = {}) {
  const accounts = options.accountRepository ?? new InMemoryAccountRepository();
  const policy = options.depositPolicy ?? DEFAULT_DEPOSIT_POLICY;
  const clock = options.clock ?? { now: () => new Date() };
  const ids = options.ids ?? { next: () => randomUUID() };

  const accountsController = new AccountsController(
    new OpenAccountUseCase(accounts, ids, clock),
    new ListAccountsUseCase(accounts),
    new GetAccountUseCase(accounts),
    new DepositUseCase(accounts, policy, ids, clock)
  );

  return { accountsController };
}

export type Container = ReturnType<typeof buildContainer>;
