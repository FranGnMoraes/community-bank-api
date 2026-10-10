import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Account } from "../src/modules/accounts/domain/account.js";
import { DomainError } from "../src/shared/domain/domain-error.js";
import { Money } from "../src/shared/domain/money.js";

// Testes de domínio puros: sem Express, sem banco (testabilidade, Aula 4).
const now = new Date("2026-10-09T12:00:00Z");

function openAccount() {
  return Account.open({ id: "acc-1", ownerName: "Maria da Silva", document: "123.456.789-09", now });
}

describe("Account", () => {
  it("abre conta ativa com saldo zero e CPF só com dígitos", () => {
    const account = openAccount();
    assert.equal(account.status, "ACTIVE");
    assert.equal(account.balance.cents, 0);
    assert.equal(account.document, "12345678909");
  });

  it("recusa CPF sem 11 dígitos", () => {
    assert.throws(
      () => Account.open({ id: "x", ownerName: "Maria", document: "123", now }),
      (error: unknown) => error instanceof DomainError && error.code === "INVALID_DOCUMENT"
    );
  });

  it("depósito aumenta o saldo e fica registrado no histórico", () => {
    const account = openAccount();
    account.deposit({ transactionId: "t1", amount: Money.fromReais(150.75), description: "Feira", now });
    account.deposit({ transactionId: "t2", amount: Money.fromReais(0.1), description: "Troco", now });
    assert.equal(account.balance.cents, 15085);
    assert.equal(account.history.length, 2);
  });

  it("recusa depósito de valor zero ou negativo", () => {
    const account = openAccount();
    for (const reais of [0, -10]) {
      assert.throws(
        () => account.deposit({ transactionId: "t", amount: Money.fromReais(reais), description: "", now }),
        (error: unknown) => error instanceof DomainError && error.code === "INVALID_AMOUNT"
      );
    }
    assert.equal(account.history.length, 0);
  });

  it("recusa depósito em conta bloqueada", () => {
    const account = openAccount();
    account.block();
    assert.throws(
      () => account.deposit({ transactionId: "t", amount: Money.fromReais(10), description: "", now }),
      (error: unknown) => error instanceof DomainError && error.code === "ACCOUNT_NOT_ACTIVE"
    );
  });

  it("o histórico devolvido não permite alterar a conta por fora", () => {
    const account = openAccount();
    account.deposit({ transactionId: "t1", amount: Money.fromReais(10), description: "", now });
    const history = account.history as unknown as unknown[];
    history.pop();
    assert.equal(account.history.length, 1);
  });
});

describe("Money", () => {
  it("recusa mais de duas casas decimais", () => {
    assert.throws(() => Money.fromReais(10.005), DomainError);
  });
});
