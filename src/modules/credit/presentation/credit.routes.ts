import { Router } from "express";
import type { SolidarityCreditController } from "./solidarity-credit.controller.js";

/** Rotas Express para o módulo de Crédito Solidário */
export function creditRoutes(controller: SolidarityCreditController): Router {
  const router = Router();
  router.post("/solidarity", controller.create);
  router.get("/solidarity", controller.list);
  router.get("/solidarity/:id", controller.getById);
  return router;
}
