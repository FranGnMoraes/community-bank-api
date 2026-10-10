import { Money } from "../../../shared/domain/money.js";
import { Account, type AccountStatus } from "../domain/account.js";
import type { AccountRepository } from "../domain/account-repository.js";
import type { TransactionType } from "../domain/transaction.js";

/** Formato "de banco": só tipos primitivos, como seria uma linha de tabela. */
interface AccountRow {
  id: string;
  ownerName: string;
  document: string;
  status: AccountStatus;
  createdAt: string;
  transactions: {
    id: string;
    type: TransactionType;
    amountInCents: number;
    description: string;
    occurredAt: string;
  }[];
}

/**
 * Persistência em memória: escolha consciente para o protótipo (Aula 3,
 * tabela de alternativas). Guarda linhas separadas das entidades, então
 * ninguém altera o estado salvo sem passar por save(). Os dados somem
 * quando a API reinicia; o PostgreSQL entra no lugar sem mudar o domínio.
 */
export class InMemoryAccountRepository implements AccountRepository {
  private readonly rows = new Map<string, AccountRow>();

  async findById(id: string): Promise<Account | null> {
    const row = this.rows.get(id);
    return row ? toEntity(row) : null;
  }

  async findByDocument(document: string): Promise<Account | null> {
    for (const row of this.rows.values()) {
      if (row.document === document) {
        return toEntity(row);
      }
    }
    return null;
  }

  async findAll(): Promise<Account[]> {
    return [...this.rows.values()].map(toEntity);
  }

  async save(account: Account): Promise<void> {
    this.rows.set(account.id, toRow(account));
  }
}

function toRow(account: Account): AccountRow {
  return {
    id: account.id,
    ownerName: account.ownerName,
    document: account.document,
    status: account.status,
    createdAt: account.createdAt.toISOString(),
    transactions: account.history.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amountInCents: transaction.amount.cents,
      description: transaction.description,
      occurredAt: transaction.occurredAt.toISOString()
    }))
  };
}

function toEntity(row: AccountRow): Account {
  return Account.restore({
    id: row.id,
    ownerName: row.ownerName,
    document: row.document,
    status: row.status,
    createdAt: new Date(row.createdAt),
    transactions: row.transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: Money.fromCents(transaction.amountInCents),
      description: transaction.description,
      occurredAt: new Date(transaction.occurredAt)
    }))
  });
}
