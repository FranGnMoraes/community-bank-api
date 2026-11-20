import { DomainError } from "../../../shared/domain/domain-error.js";

/**
 * Entidade de Domínio: Empreendimento Solidário
 * Representa um coletivo, cooperativa familiar ou negócio comunitário.
 */
export class SolidarityEnterprise {
  constructor(
    readonly name: string,
    readonly communityArea: string,
    readonly activityType: string,
    readonly membersCount: number = 1
  ) {
    if (!name || name.trim().length === 0) {
      throw new DomainError("INVALID_ENTERPRISE_NAME", "O nome do empreendimento solidário é obrigatório.");
    }
    if (!communityArea || communityArea.trim().length === 0) {
      throw new DomainError("INVALID_COMMUNITY_AREA", "A comunidade ou território de atuação é obrigatória.");
    }
    if (!activityType || activityType.trim().length === 0) {
      throw new DomainError("INVALID_ACTIVITY_TYPE", "O tipo de atividade produtiva é obrigatório.");
    }
    if (!Number.isInteger(membersCount) || membersCount < 1) {
      throw new DomainError("INVALID_MEMBERS_COUNT", "O empreendimento deve possuir ao menos 1 integrante.");
    }
  }

  /**
   * Avalia elegibilidade para microcrédito solidário:
   * Prioriza economia popular, produção local, agricultura familiar, artesanato e serviços comunitários.
   * Rejeita atividades puramente especulativas ou lesivas à comunidade.
   */
  isEligible(): boolean {
    const disallowedTerms = ["especulacao", "armas", "jogos_de_azar", "jogo", "piramide", "agiotagem", "aposta"];
    const normalizedActivity = this.activityType
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
    return !disallowedTerms.some((term) => normalizedActivity.includes(term));
  }
}
