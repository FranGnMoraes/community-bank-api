import { Router } from "express";
import type { AccountsController } from "./accounts.controller.js";

export function accountsRoutes(controller: AccountsController): Router {
  const router = Router();

  router.get("/", controller.list);
  router.post("/", controller.open);
  router.get("/:id", controller.show);
  router.post("/:id/deposits", controller.deposit);

  return router;
}
