import { DomainError } from "../../../shared/domain/domain-error.js";
import { Money } from "../../../shared/domain/money.js";
import type { Clock } from "../../../shared/domain/ports.js";
import { SolidarityEnterprise } from "./solidarity-enterprise.js";

export type CreditStatus = "PENDING" | "APPROVED" | "REJECTED";

/** Limite máximo para microcrédito solidário comunitário (R$ 15.000,00) */
export const MAX_SOLIDARITY_CREDIT = Money.fromReais(15000);

/**
 * Entidade de Domínio: Solicitação de Crédito Solidário
 * Concentra as regras essenciais de concessão:
 * - Taxa de juros 0% (princípio de banco comunitário de desenvolvimento)
 * - Teto de microcrédito solidário
 * - Validação de prazo e elegibilidade do coletivo
 */
export class CreditRequest {
  private constructor(
    readonly id: string,
    readonly enterprise: SolidarityEnterprise,
    readonly amount: Money,
    readonly purpose: string,
    readonly installments: number,
    private _status: CreditStatus,
    readonly createdAt: Date,
    private _rejectionReason?: string
  ) {}

  static create(params: {
    id: string;
    enterprise: SolidarityEnterprise;
    amount: Money;
    purpose: string;
    installments: number;
    clock: Clock;
  }): CreditRequest {
    if (!params.amount.isPositive()) {
      throw new DomainError("INVALID_AMOUNT", "O valor solicitado deve ser maior que zero.");
    }

    if (params.amount.isGreaterThan(MAX_SOLIDARITY_CREDIT)) {
      throw new DomainError(
        "CREDIT_LIMIT_EXCEEDED",
        "O valor solicitado excede o limite máximo para crédito solidário de R$ 15.000,00."
      );
    }

    if (!params.enterprise.isEligible()) {
      throw new DomainError(
        "ENTERPRISE_NOT_ELIGIBLE",
        "O empreendimento solidário não atende aos critérios de elegibilidade comunitária."
      );
    }

    if (!params.purpose || params.purpose.trim().length < 5) {
      throw new DomainError(
        "INVALID_PURPOSE",
        "A finalidade do crédito deve ser descrita detalhadamente (mínimo 5 caracteres)."
      );
    }

    if (!Number.isInteger(params.installments) || params.installments < 1 || params.installments > 36) {
      throw new DomainError(
        "INVALID_INSTALLMENTS",
        "O número de parcelas deve ser um número inteiro entre 1 e 36 meses."
      );
    }

    return new CreditRequest(
      params.id,
      params.enterprise,
      params.amount,
      params.purpose.trim(),
      params.installments,
      "PENDING",
      params.clock.now()
    );
  }

  static reconstitute(props: {
    id: string;
    enterprise: SolidarityEnterprise;
    amount: Money;
    purpose: string;
    installments: number;
    status: CreditStatus;
    createdAt: Date;
    rejectionReason?: string;
  }): CreditRequest {
    return new CreditRequest(
      props.id,
      props.enterprise,
      props.amount,
      props.purpose,
      props.installments,
      props.status,
      props.createdAt,
      props.rejectionReason
    );
  }

  get status(): CreditStatus {
    return this._status;
  }

  get rejectionReason(): string | undefined {
    return this._rejectionReason;
  }

  approve(): void {
    if (this._status !== "PENDING") {
      throw new DomainError("INVALID_STATE_TRANSITION", `Não é possível aprovar uma solicitação com status '${this._status}'.`);
    }
    this._status = "APPROVED";
  }

  reject(reason: string): void {
    if (this._status !== "PENDING") {
      throw new DomainError("INVALID_STATE_TRANSITION", `Não é possível rejeitar uma solicitação com status '${this._status}'.`);
    }
    this._status = "REJECTED";
    this._rejectionReason = reason;
  }
}
