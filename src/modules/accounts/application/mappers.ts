import type { Account } from "../domain/account.js";
import type { AccountOutput } from "./account-dto.js";

export function toAccountOutput(account: Account): AccountOutput {
  return {
    id: account.id,
    ownerName: account.ownerName,
    status: account.status,
    balanceInCents: account.balance.cents,
    createdAt: account.createdAt
  };
}
