import type { NextFunction, Request, Response } from "express";
import { ValidationError } from "../../../shared/http/http-error.js";
import type { ListSolidarityCreditUseCase } from "../application/list-solidarity-credit.use-case.js";
import type { CreateSolidarityCreditApplication } from "../application/ports/create-solidarity-credit.port.js";

/**
 * Driving Adapter (Adaptador Primário / de Entrada) — Arquitetura Hexagonal.
 * Converte requisições HTTP Express para o contrato puro da Input Port
 * (CreateSolidarityCreditApplication), isolando o núcleo de detalhes de transporte.
 */
export class SolidarityCreditController {
  constructor(
    private readonly createCreditPort: CreateSolidarityCreditApplication,
    private readonly listCreditUseCase?: ListSolidarityCreditUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        enterpriseName,
        communityArea,
        activityType,
        membersCount,
        amount,
        purpose,
        installments
      } = req.body ?? {};

      if (!enterpriseName || typeof enterpriseName !== "string" || enterpriseName.trim() === "") {
        throw new ValidationError("O campo 'enterpriseName' é obrigatório.");
      }
      if (!communityArea || typeof communityArea !== "string" || communityArea.trim() === "") {
        throw new ValidationError("O campo 'communityArea' é obrigatório.");
      }
      if (!activityType || typeof activityType !== "string" || activityType.trim() === "") {
        throw new ValidationError("O campo 'activityType' é obrigatório.");
      }
      if (typeof amount !== "number" || isNaN(amount)) {
        throw new ValidationError("O campo 'amount' deve ser um número válido.");
      }
      if (!purpose || typeof purpose !== "string" || purpose.trim().length < 5) {
        throw new ValidationError("O campo 'purpose' é obrigatório e deve ter no mínimo 5 caracteres.");
      }
      if (typeof installments !== "number" || !Number.isInteger(installments) || installments < 1) {
        throw new ValidationError("O campo 'installments' deve ser um número inteiro positivo de parcelas.");
      }

      const result = await this.createCreditPort.execute({
        enterpriseName: enterpriseName.trim(),
        communityArea: communityArea.trim(),
        activityType: activityType.trim(),
        membersCount: membersCount !== undefined ? Number(membersCount) : 1,
        amount,
        purpose: purpose.trim(),
        installments
      });

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.listCreditUseCase) {
        res.status(200).json([]);
        return;
      }
      const list = await this.listCreditUseCase.execute();
      res.status(200).json(list);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.listCreditUseCase) {
        res.status(404).json({
          error: { code: "CREDIT_REQUEST_NOT_FOUND", message: "Solicitação de crédito não encontrada." }
        });
        return;
      }
      const id = req.params.id as string;
      const item = await this.listCreditUseCase.getById(id);
      if (!item) {
        res.status(404).json({
          error: { code: "CREDIT_REQUEST_NOT_FOUND", message: "Solicitação de crédito não encontrada." }
        });
        return;
      }
      res.status(200).json(item);
    } catch (err) {
      next(err);
    }
  };
}
