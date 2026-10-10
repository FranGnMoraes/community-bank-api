import { DomainError } from "./domain-error.js";

/**
 * Valor monetário imutável, guardado em centavos inteiros.
 * Evita erros de arredondamento de ponto flutuante (0.1 + 0.2 !== 0.3).
 */
export class Money {
  private constructor(readonly cents: number) {}

  static fromCents(cents: number): Money {
    if (!Number.isSafeInteger(cents)) {
      throw new DomainError("INVALID_AMOUNT", "O valor deve ser um número inteiro de centavos.");
    }
    return new Money(cents);
  }

  static fromReais(reais: number): Money {
    if (!Number.isFinite(reais)) {
      throw new DomainError("INVALID_AMOUNT", "O valor informado não é um número válido.");
    }
    const cents = Math.round(reais * 100);
    if (Math.abs(reais * 100 - cents) > 1e-6) {
      throw new DomainError("INVALID_AMOUNT", "O valor deve ter no máximo duas casas decimais.");
    }
    return new Money(cents);
  }

  static zero(): Money {
    return new Money(0);
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  isPositive(): boolean {
    return this.cents > 0;
  }

  isGreaterThan(other: Money): boolean {
    return this.cents > other.cents;
  }
}
