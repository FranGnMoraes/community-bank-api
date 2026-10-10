import type { AccountOutput, DepositOutput } from "../application/account-dto.js";

/**
 * Presenter (Aula 6, Humble Object): prepara o que o cliente vai exibir.
 * O domínio sabe que saldo é número; a apresentação decide como ele aparece.
 */
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatCents(cents: number): string {
  // Intl usa espaço não separável entre "R$" e o número; trocamos por espaço comum.
  return brl.format(cents / 100).replace(/ /g, " ");
}

export function presentAccount(account: AccountOutput) {
  return {
    id: account.id,
    ownerName: account.ownerName,
    status: account.status,
    balance: account.balanceInCents / 100,
    balanceText: formatCents(account.balanceInCents),
    negativeBalance: account.balanceInCents < 0,
    createdAt: account.createdAt.toISOString()
  };
}

export function presentDeposit(deposit: DepositOutput) {
  return {
    transactionId: deposit.transactionId,
    accountId: deposit.accountId,
    amount: deposit.amountInCents / 100,
    amountText: formatCents(deposit.amountInCents),
    balance: deposit.balanceInCents / 100,
    balanceText: formatCents(deposit.balanceInCents),
    occurredAt: deposit.occurredAt.toISOString(),
    message: `Depósito de ${formatCents(deposit.amountInCents)} realizado com sucesso.`
  };
}
