import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, describe, it } from "node:test";
import type { Server } from "node:http";
import { buildContainer } from "../src/main/container.js";
import { createApp } from "../src/main/create-app.js";
import { InMemoryCreditRequestRepository } from "../src/modules/credit/infrastructure/in-memory-credit-request-repository.js";

describe("HTTP /credit/solidarity (Driving Adapter)", () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    const container = buildContainer({
      creditRepository: new InMemoryCreditRequestRepository()
    });
    server = createApp(container).listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  after(() => {
    server.close();
  });

  async function post(path: string, body: unknown) {
    const response = await fetch(baseUrl + path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    return { status: response.status, body: await response.json() };
  }

  async function get(path: string) {
    const response = await fetch(baseUrl + path);
    return { status: response.status, body: await response.json() };
  }

  it("cria solicitação de crédito solidário com sucesso (HTTP 201)", async () => {
    const response = await post("/credit/solidarity", {
      enterpriseName: "Mulheres Rendeiras da Lagoa",
      communityArea: "Vila Mangueira",
      activityType: "Artesanato e Renda de Bilro",
      membersCount: 6,
      amount: 2500,
      purpose: "Aquisição de linhas de algodão puro e almofadas",
      installments: 10
    });

    assert.equal(response.status, 201);
    assert.ok(response.body.id);
    assert.equal(response.body.enterprise.name, "Mulheres Rendeiras da Lagoa");
    assert.equal(response.body.amount.cents, 250000);
    assert.equal(response.body.installments, 10);
    assert.equal(response.body.monthlyInstallment.cents, 25000);
    assert.equal(response.body.status, "PENDING");
  });

  it("retorna 400 para dados obrigatórios ausentes", async () => {
    const response = await post("/credit/solidarity", {
      enterpriseName: "",
      communityArea: "Centro",
      activityType: "Artesanato",
      amount: 1000,
      purpose: "Compra",
      installments: 5
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, "VALIDATION_ERROR");
  });

  it("retorna 422 ao exceder o teto solidário de R$ 15.000,00", async () => {
    const response = await post("/credit/solidarity", {
      enterpriseName: "Oficina Mecânica Comunitária",
      communityArea: "Bairro Industrial",
      activityType: "Serviços Mecânicos",
      membersCount: 3,
      amount: 20000,
      purpose: "Compra de elevador automotivo hidráulico",
      installments: 24
    });

    assert.equal(response.status, 422);
    assert.equal(response.body.error.code, "CREDIT_LIMIT_EXCEEDED");
  });

  it("retorna 422 para atividade não elegível", async () => {
    const response = await post("/credit/solidarity", {
      enterpriseName: "Casa de Apostas do Bairro",
      communityArea: "Bairro Central",
      activityType: "Jogos_de_azar e apostas",
      amount: 5000,
      purpose: "Compra de máquinas caça-níqueis",
      installments: 12
    });

    assert.equal(response.status, 422);
    assert.equal(response.body.error.code, "ENTERPRISE_NOT_ELIGIBLE");
  });

  it("lista solicitações cadastradas via GET /credit/solidarity", async () => {
    await post("/credit/solidarity", {
      enterpriseName: "Sabão Artesanal Ecológico",
      communityArea: "Vila Progresso",
      activityType: "Produtos de Limpeza Caseiros",
      membersCount: 2,
      amount: 1200,
      purpose: "Compra de óleos vegetais reciclados e soda",
      installments: 6
    });

    const getRes = await get("/credit/solidarity");
    assert.equal(getRes.status, 200);
    assert.ok(Array.isArray(getRes.body));
    assert.ok(getRes.body.length >= 1);
  });
});
