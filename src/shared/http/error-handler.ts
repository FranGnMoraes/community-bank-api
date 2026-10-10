import type { ErrorRequestHandler } from "express";
import { DomainError } from "../domain/domain-error.js";
import { ValidationError } from "./http-error.js";

/**
 * Tratamento de erro único para toda a API (integridade conceitual, Aula 3):
 * toda falha sai no mesmo formato { error: { code, message } }.
 */
const STATUS_BY_CODE: Record<string, number> = {
  ACCOUNT_NOT_FOUND: 404,
  DOCUMENT_ALREADY_REGISTERED: 409,
  ACCOUNT_NOT_ACTIVE: 422,
  DEPOSIT_LIMIT_EXCEEDED: 422
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ValidationError) {
    return response.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message } });
  }
  if (error instanceof DomainError) {
    const status = STATUS_BY_CODE[error.code] ?? 400;
    return response.status(status).json({ error: { code: error.code, message: error.message } });
  }
  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({ error: { code: "INVALID_JSON", message: "O corpo da requisição não é um JSON válido." } });
  }

  console.error(error);
  return response.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Erro inesperado. Tente novamente." } });
};
