import { Money } from "../../../shared/domain/money.js";
import type { Clock, IdGenerator } from "../../../shared/domain/ports.js";
import { CreditRequest } from "../domain/credit-request.js";
import type { CreditRequestRepository } from "../domain/credit-request-repository.port.js";
import { SolidarityEnterprise } from "../domain/solidarity-enterprise.js";
import type { CreateSolidarityCreditInput, CreditRequestDto } from "./credit-dto.js";
import type { CreateSolidarityCreditApplication } from "./ports/create-solidarity-credit.port.js";

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export function toCreditDto(request: CreditRequest): CreditRequestDto {
  const installmentCents = Math.round(request.amount.cents / request.installments);
  return {
    id: request.id,
    enterprise: {
      name: request.enterprise.name,
      communityArea: request.enterprise.communityArea,
      activityType: request.enterprise.activityType,
      membersCount: request.enterprise.membersCount
    },
    amount: {
      cents: request.amount.cents,
      formatted: formatCurrency(request.amount.cents)
    },
    purpose: request.purpose,
    installments: request.installments,
    monthlyInstallment: {
      cents: installmentCents,
      formatted: formatCurrency(installmentCents)
    },
    interestRate: "0% a.m. (Crédito Solidário Comunitário)",
    status: request.status,
    createdAt: request.createdAt.toISOString()
  };
}

/**
 * Caso de Uso: Solicitar Crédito Solidário
 * Implementa a Input Port (CreateSolidarityCreditApplication)
 * e consome a Output Port (CreditRequestRepository).
 */
export class CreateSolidarityCreditUseCase implements CreateSolidarityCreditApplication {
  constructor(
    private readonly repository: CreditRequestRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock
  ) {}

  async execute(input: CreateSolidarityCreditInput): Promise<CreditRequestDto> {
    const money = Money.fromReais(input.amount);

    const enterprise = new SolidarityEnterprise(
      input.enterpriseName,
      input.communityArea,
      input.activityType,
      input.membersCount ?? 1
    );

    const creditRequest = CreditRequest.create({
      id: this.idGenerator.next(),
      enterprise,
      amount: money,
      purpose: input.purpose,
      installments: input.installments,
      clock: this.clock
    });

    await this.repository.save(creditRequest);

    return toCreditDto(creditRequest);
  }
}
