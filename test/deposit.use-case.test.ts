import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { DepositUseCase } from "../src/modules/accounts/application/deposit.use-case.js";
import { Account } from "../src/modules/accounts/domain/account.js";
import { MaxAmountDepositPolicy } from "../src/modules/accounts/domain/deposit-policy.js";
import { InMemoryAccountRepository } from "../src/modules/accounts/infrastructure/in-memory-account-repository.js";
import { DomainError } from "../src/shared/domain/domain-error.js";
import { Money } from "../src/shared/domain/money.js";

const clock = { now: () => new Date("2026-10-09T12:00:00Z") };
const ids = { next: () => "tx-1" };

describe("DepositUseCase", () => {
  let repository: InMemoryAccountRepository;
  let useCase: DepositUseCase;

  beforeEach(async () => {
    repository = new InMemoryAccountRepository();
    await repository.save(Account.open({ id: "acc-1", ownerName: "Maria da Silva", document: "12345678909", now: clock.now() }));
    useCase = new DepositUseCase(repository, new MaxAmountDepositPolicy(Money.fromReais(1000)), ids, clock);
  });

  it("deposita e persiste o novo saldo", async () => {
    const result = await useCase.execute({ accountId: "acc-1", amount: Money.fromReais(200) });
    assert.equal(result.balanceInCents, 20000);
    const saved = await repository.findById("acc-1");
    assert.equal(saved?.balance.cents, 20000);
    assert.equal(saved?.history[0]?.description, "Depósito em conta corrente");
  });

  it("aplica a política de limite sem tocar no controller", async () => {
    await assert.rejects(
      useCase.execute({ accountId: "acc-1", amount: Money.fromReais(1000.01) }),
      (error: unknown) => error instanceof DomainError && error.code === "DEPOSIT_LIMIT_EXCEEDED"
    );
    const saved = await repository.findById("acc-1");
    assert.equal(saved?.balance.cents, 0);
  });

  it("informa conta inexistente", async () => {
    await assert.rejects(
      useCase.execute({ accountId: "nao-existe", amount: Money.fromReais(10) }),
      (error: unknown) => error instanceof DomainError && error.code === "ACCOUNT_NOT_FOUND"
    );
  });
});
