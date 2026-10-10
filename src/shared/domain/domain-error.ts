/**
 * Erro de regra de negócio. A camada de apresentação traduz o código
 * para um status HTTP; o domínio não sabe nada sobre HTTP.
 */
export class DomainError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "DomainError";
  }
}
