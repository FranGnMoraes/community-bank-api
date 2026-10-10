import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, describe, it } from "node:test";
import type { Server } from "node:http";
import { buildContainer } from "../src/main/container.js";
import { createApp } from "../src/main/create-app.js";

// Teste de ponta a ponta do fluxo Cliente → Controller → Use Case → Domain → Repository.
describe("HTTP /accounts", () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    server = createApp(buildContainer()).listen(0);
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

  it("abre conta, deposita e consulta saldo", async () => {
    const opened = await post("/accounts", { ownerName: "Maria da Silva", document: "123.456.789-09" });
    assert.equal(opened.status, 201);

    const deposit = await post(`/accounts/${opened.body.id}/deposits`, { amount: 150.75, description: "Venda na feira" });
    assert.equal(deposit.status, 201);
    assert.equal(deposit.body.balanceText, "R$ 150,75");

    const account = await (await fetch(`${baseUrl}/accounts/${opened.body.id}`)).json();
    assert.equal(account.balance, 150.75);
  });

  it("responde erros no mesmo formato", async () => {
    const notFound = await post("/accounts/nao-existe/deposits", { amount: 10 });
    assert.equal(notFound.status, 404);
    assert.equal(notFound.body.error.code, "ACCOUNT_NOT_FOUND");

    const invalid = await post("/accounts/nao-existe/deposits", { amount: "dez" });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.error.code, "VALIDATION_ERROR");
  });

  it("recusa CPF duplicado", async () => {
    await post("/accounts", { ownerName: "João Pereira", document: "98765432100" });
    const duplicated = await post("/accounts", { ownerName: "João P.", document: "987.654.321-00" });
    assert.equal(duplicated.status, 409);
  });
});
