import type { Request, Response } from "express";
import { Money } from "../../../shared/domain/money.js";
import { ValidationError } from "../../../shared/http/http-error.js";
import type { DepositUseCase } from "../application/deposit.use-case.js";
import type { GetAccountUseCase } from "../application/get-account.use-case.js";
import type { ListAccountsUseCase } from "../application/list-accounts.use-case.js";
import type { OpenAccountUseCase } from "../application/open-account.use-case.js";
import { presentAccount, presentDeposit } from "./account.presenter.js";

/**
 * Controller (Aula 6): extrai parâmetros, valida o formato da entrada,
 * chama o caso de uso e escolhe o status HTTP. Não contém regra de negócio
 * e não acessa o repositório diretamente.
 */
export class AccountsController {
  constructor(
    private readonly openAccount: OpenAccountUseCase,
    private readonly listAccounts: ListAccountsUseCase,
    private readonly getAccount: GetAccountUseCase,
    private readonly depositUseCase: DepositUseCase
  ) {}

  list = async (_request: Request, response: Response) => {
    const accounts = await this.listAccounts.execute();
    return response.status(200).json(accounts.map(presentAccount));
  };

  open = async (request: Request, response: Response) => {
    const { ownerName, document } = request.body ?? {};
    if (typeof ownerName !== "string" || typeof document !== "string") {
      throw new ValidationError("Informe ownerName e document (CPF) como texto.");
    }
    const account = await this.openAccount.execute({ ownerName, document });
    return response.status(201).location(`/accounts/${account.id}`).json(presentAccount(account));
  };

  show = async (request: Request<{ id: string }>, response: Response) => {
    const account = await this.getAccount.execute(request.params.id);
    return response.status(200).json(presentAccount(account));
  };

  deposit = async (request: Request<{ id: string }>, response: Response) => {
    const { amount, description } = request.body ?? {};
    if (typeof amount !== "number") {
      throw new ValidationError("Informe amount como número, em reais. Exemplo: 150.75");
    }
    if (description !== undefined && typeof description !== "string") {
      throw new ValidationError("description, quando enviado, deve ser texto.");
    }
    const result = await this.depositUseCase.execute({
      accountId: request.params.id,
      amount: Money.fromReais(amount),
      description
    });
    return response.status(201).json(presentDeposit(result));
  };
}
