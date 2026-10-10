import { DomainError } from "../../../shared/domain/domain-error.js";
import { Money } from "../../../shared/domain/money.js";
import type { Transaction } from "./transaction.js";

export type AccountStatus = "ACTIVE" | "BLOCKED";

interface AccountProps {
  id: string;
  ownerName: string;
  document: string;
  status: AccountStatus;
  createdAt: Date;
  transactions: Transaction[];
}

/**
 * Conta corrente do banco comunitário.
 *
 * O saldo não é um campo editável: é calculado a partir dos lançamentos
 * (ideia inspirada em Event Sourcing, Aula 1). Assim, todo valor no saldo
 * tem um lançamento que o explica.
 */
export class Account {
  private readonly transactions: Transaction[];

  private constructor(private readonly props: AccountProps) {
    this.transactions = [...props.transactions];
  }

  static open(input: { id: string; ownerName: string; document: string; now: Date }): Account {
    const ownerName = input.ownerName.trim();
    if (ownerName.length < 3) {
      throw new DomainError("INVALID_OWNER_NAME", "O nome do titular deve ter pelo menos 3 letras.");
    }
    const document = input.document.replace(/\D/g, "");
    if (document.length !== 11) {
      throw new DomainError("INVALID_DOCUMENT", "O CPF deve ter 11 dígitos.");
    }
    return new Account({
      id: input.id,
      ownerName,
      document,
      status: "ACTIVE",
      createdAt: input.now,
      transactions: []
    });
  }

  static restore(props: AccountProps): Account {
    return new Account(props);
  }

  get id(): string {
    return this.props.id;
  }

  get ownerName(): string {
    return this.props.ownerName;
  }

  get document(): string {
    return this.props.document;
  }

  get status(): AccountStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get balance(): Money {
    return this.transactions.reduce((total, transaction) => total.add(transaction.amount), Money.zero());
  }

  get history(): readonly Transaction[] {
    return [...this.transactions];
  }

  deposit(input: { transactionId: string; amount: Money; description: string; now: Date }): Transaction {
    if (this.props.status !== "ACTIVE") {
      throw new DomainError("ACCOUNT_NOT_ACTIVE", "Só é possível depositar em uma conta ativa.");
    }
    if (!input.amount.isPositive()) {
      throw new DomainError("INVALID_AMOUNT", "O valor do depósito deve ser maior que zero.");
    }

    const transaction: Transaction = Object.freeze({
      id: input.transactionId,
      type: "DEPOSIT",
      amount: input.amount,
      description: input.description,
      occurredAt: input.now
    });
    this.transactions.push(transaction);
    return transaction;
  }

  block(): void {
    this.props.status = "BLOCKED";
  }
}
