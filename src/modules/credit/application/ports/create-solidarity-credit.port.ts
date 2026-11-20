import type { CreateSolidarityCreditInput, CreditRequestDto } from "../credit-dto.js";

/**
 * Porta Primária (Input Port) — Arquitetura Hexagonal.
 * Contrato puro que define a operação de criação de crédito solidário,
 * desacoplando o caso de uso de controladores HTTP (Express), CLI ou mensageria.
 */
export interface CreateSolidarityCreditApplication {
  execute(input: CreateSolidarityCreditInput): Promise<CreditRequestDto>;
}
