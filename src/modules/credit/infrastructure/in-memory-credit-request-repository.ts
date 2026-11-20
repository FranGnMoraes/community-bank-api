import type { CreditRequest } from "../domain/credit-request.js";
import type { CreditRequestRepository } from "../domain/credit-request-repository.port.js";

/**
 * Driven Adapter Alternativo em Memória — Arquitetura Hexagonal.
 * Permite isolamento cirúrgico para testes de unidade rápidos sem I/O de disco.
 */
export class InMemoryCreditRequestRepository implements CreditRequestRepository {
  private items = new Map<string, CreditRequest>();

  async save(request: CreditRequest): Promise<void> {
    this.items.set(request.id, request);
  }

  async findById(id: string): Promise<CreditRequest | null> {
    return this.items.get(id) ?? null;
  }

  async listAll(): Promise<CreditRequest[]> {
    return Array.from(this.items.values());
  }

  async findByEnterpriseName(name: string): Promise<CreditRequest[]> {
    return Array.from(this.items.values()).filter(
      (req) => req.enterprise.name.toLowerCase() === name.toLowerCase()
    );
  }
}
