/** Fontes de tempo e de identificadores injetáveis, para os testes serem previsíveis. */
export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  next(): string;
}
