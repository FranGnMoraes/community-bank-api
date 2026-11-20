import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CreateSolidarityCreditUseCase } from "../src/modules/credit/application/create-solidarity-credit.use-case.js";
import { InMemoryCreditRequestRepository } from "../src/modules/credit/infrastructure/in-memory-credit-request-repository.js";
import { SqliteCreditRequestRepository } from "../src/modules/credit/infrastructure/sqlite-credit-request-repository.js";

const clock = { now: () => new Date("2026-10-16T14:30:00Z") };
const ids = { next: () => "credit-uuid-100" };

describe("CreateSolidarityCreditUseCase (Arquitetura Hexagonal)", () => {
  it("registra solicitação com InMemoryCreditRequestRepository (Driven Adapter 1)", async () => {
    const repository = new InMemoryCreditRequestRepository();
    const useCase = new CreateSolidarityCreditUseCase(repository, ids, clock);

    const result = await useCase.execute({
      enterpriseName: "Cooperativa de Panificação Esperança",
      communityArea: "Bairro Getúlio Vargas",
      activityType: "Alimentação Comunitária",
      membersCount: 5,
      amount: 4800,
      purpose: "Compra de forno industrial a gás e formas",
      installments: 12
    });

    assert.equal(result.id, "credit-uuid-100");
    assert.equal(result.enterprise.name, "Cooperativa de Panificação Esperança");
    assert.equal(result.amount.cents, 480000);
    assert.equal(result.installments, 12);
    assert.equal(result.monthlyInstallment.cents, 40000); // 4800 / 12 = 400 reais
    assert.equal(result.interestRate, "0% a.m. (Crédito Solidário Comunitário)");
    assert.equal(result.status, "PENDING");

    const saved = await repository.findById("credit-uuid-100");
    assert.ok(saved);
    assert.equal(saved?.enterprise.name, "Cooperativa de Panificação Esperança");
  });

  it("registra solicitação com SqliteCreditRequestRepository (Driven Adapter 2 - Banco de Dados)", async () => {
    const sqliteRepo = new SqliteCreditRequestRepository(":memory:");
    const useCase = new CreateSolidarityCreditUseCase(sqliteRepo, ids, clock);

    const result = await useCase.execute({
      enterpriseName: "Marcenaria Ecológica do Bairro",
      communityArea: "Vila Castelo",
      activityType: "Artesanato em Madeira Reaproveitada",
      membersCount: 2,
      amount: 3000,
      purpose: "Compra de lixadeira de cinta e serra tico-tico",
      installments: 10
    });

    assert.equal(result.id, "credit-uuid-100");
    assert.equal(result.amount.cents, 300000);
    assert.equal(result.monthlyInstallment.cents, 30000);

    const loaded = await sqliteRepo.findById("credit-uuid-100");
    assert.ok(loaded);
    assert.equal(loaded?.enterprise.communityArea, "Vila Castelo");
    assert.equal(loaded?.amount.cents, 300000);
  });
});
