/** DTO de entrada para registrar a solicitação de crédito */
export interface CreateSolidarityCreditInput {
  enterpriseName: string;
  communityArea: string;
  activityType: string;
  membersCount?: number;
  amount: number;
  purpose: string;
  installments: number;
}

/** DTO de saída apresentado ao consumidor da API */
export interface CreditRequestDto {
  id: string;
  enterprise: {
    name: string;
    communityArea: string;
    activityType: string;
    membersCount: number;
  };
  amount: {
    cents: number;
    formatted: string;
  };
  purpose: string;
  installments: number;
  monthlyInstallment: {
    cents: number;
    formatted: string;
  };
  interestRate: string;
  status: string;
  createdAt: string;
}
