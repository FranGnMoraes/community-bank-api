/** Erro de formato da requisição (corpo inválido, campo faltando). */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
