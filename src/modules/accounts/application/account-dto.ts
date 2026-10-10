/**
 * DTOs de saída da camada de aplicação. Expõem só o que o cliente precisa,
 * sem vazar a entidade de domínio (Aula 6, DTO).
 */
export interface AccountOutput {
  id: string;
  ownerName: string;
  status: string;
  balanceInCents: number;
  createdAt: Date;
}

export interface DepositOutput {
  transactionId: string;
  accountId: string;
  amountInCents: number;
  balanceInCents: number;
  occurredAt: Date;
}
