import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Money } from "../src/shared/domain/money.js";
import { DomainError } from "../src/shared/domain/domain-error.js";
import { SolidarityEnterprise } from "../src/modules/credit/domain/solidarity-enterprise.js";
import { CreditRequest } from "../src/modules/credit/domain/credit-request.js";

const fixedClock = { now: () => new Date("2026-10-15T10:00:00Z") };

describe("SolidarityEnterprise (Domínio)", () => {
  it("cria empreendimento solidário válido", () => {
    const enterprise = new SolidarityEnterprise(
      "Costureiras Unidas da Vila",
      "Bairro Humaitá",
      "Costura e Confecção Sustentável",
      4
    );

    assert.equal(enterprise.name, "Costureiras Unidas da Vila");
    assert.equal(enterprise.communityArea, "Bairro Humaitá");
    assert.equal(enterprise.activityType, "Costura e Confecção Sustentável");
    assert.equal(enterprise.membersCount, 4);
    assert.equal(enterprise.isEligible(), true);
  });

  it("recusa nome vazio ou em branco", () => {
    assert.throws(
      () => new SolidarityEnterprise("", "Bairro Centro", "Artesanato", 2),
      (err: any) => err instanceof DomainError && err.code === "INVALID_ENTERPRISE_NAME"
    );
  });

  it("recusa quantidade de integrantes menor que 1", () => {
    assert.throws(
      () => new SolidarityEnterprise("Horta Comunitária", "Bairro Sul", "Agricultura", 0),
      (err: any) => err instanceof DomainError && err.code === "INVALID_MEMBERS_COUNT"
    );
  });

  it("identifica atividade não elegível para apoio solidário", () => {
    const speculative = new SolidarityEnterprise("Fundo Rápido", "Centro", "Especulação Financeira", 2);
    assert.equal(speculative.isEligible(), false);
  });
});

describe("CreditRequest (Domínio)", () => {
  const validEnterprise = new SolidarityEnterprise("Horta Sol da Terra", "Bairro Navegantes", "Agricultura Familiar", 3);

  it("cria solicitação de crédito com status PENDING e juros zero", () => {
    const request = CreditRequest.create({
      id: "req-1",
      enterprise: validEnterprise,
      amount: Money.fromReais(3000),
      purpose: "Compra de sementes orgânicas e mangueiras para irrigação",
      installments: 12,
      clock: fixedClock
    });

    assert.equal(request.id, "req-1");
    assert.equal(request.status, "PENDING");
    assert.equal(request.amount.cents, 300000);
    assert.equal(request.installments, 12);
    assert.equal(request.createdAt.toISOString(), "2026-10-15T10:00:00.000Z");
  });

  it("recusa solicitação com valor zero ou negativo", () => {
    assert.throws(
      () =>
        CreditRequest.create({
          id: "req-2",
          enterprise: validEnterprise,
          amount: Money.fromReais(0),
          purpose: "Capital de giro",
          installments: 6,
          clock: fixedClock
        }),
      (err: any) => err instanceof DomainError && err.code === "INVALID_AMOUNT"
    );
  });

  it("recusa solicitação acima do teto de microcrédito solidário (R$ 15.000,00)", () => {
    assert.throws(
      () =>
        CreditRequest.create({
          id: "req-3",
          enterprise: validEnterprise,
          amount: Money.fromReais(15000.01),
          purpose: "Expansão de galpão fabril",
          installments: 24,
          clock: fixedClock
        }),
      (err: any) => err instanceof DomainError && err.code === "CREDIT_LIMIT_EXCEEDED"
    );
  });

  it("recusa solicitação para empreendimento com atividade não elegível", () => {
    const badEnterprise = new SolidarityEnterprise("Jogos do Povo", "Vila", "Jogos_de_azar", 2);
    assert.throws(
      () =>
        CreditRequest.create({
          id: "req-4",
          enterprise: badEnterprise,
          amount: Money.fromReais(2000),
          purpose: "Aquisição de mesas",
          installments: 10,
          clock: fixedClock
        }),
      (err: any) => err instanceof DomainError && err.code === "ENTERPRISE_NOT_ELIGIBLE"
    );
  });

  it("permite aprovação e rejeição de solicitação pendente", () => {
    const reqApproved = CreditRequest.create({
      id: "req-app",
      enterprise: validEnterprise,
      amount: Money.fromReais(1000),
      purpose: "Material de apoio",
      installments: 5,
      clock: fixedClock
    });

    reqApproved.approve();
    assert.equal(reqApproved.status, "APPROVED");

    assert.throws(
      () => reqApproved.reject("Tarde demais"),
      (err: any) => err instanceof DomainError && err.code === "INVALID_STATE_TRANSITION"
    );
  });
});
