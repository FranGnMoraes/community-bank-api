import type { CreditRequestRepository } from "../domain/credit-request-repository.port.js";
import type { CreditRequestDto } from "./credit-dto.js";
import { toCreditDto } from "./create-solidarity-credit.use-case.js";

/** Caso de uso para listagem de solicitações de crédito */
export class ListSolidarityCreditUseCase {
  constructor(private readonly repository: CreditRequestRepository) {}

  async execute(): Promise<CreditRequestDto[]> {
    const requests = await this.repository.listAll();
    return requests.map(toCreditDto);
  }

  async getById(id: string): Promise<CreditRequestDto | null> {
    const request = await this.repository.findById(id);
    return request ? toCreditDto(request) : null;
  }
}
