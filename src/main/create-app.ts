import express from "express";
import { accountsRoutes } from "../modules/accounts/presentation/accounts.routes.js";
import { errorHandler } from "../shared/http/error-handler.js";
import type { Container } from "./container.js";

export function createApp(container: Container) {
  const app = express();

  app.use(express.json());

  app.get("/", (_request, response) => {
    return response.status(200).json({
      message: "Community Bank API"
    });
  });

  app.get("/health", (_request, response) => {
    return response.status(200).json({
      status: "ok"
    });
  });

  app.use("/accounts", accountsRoutes(container.accountsController));

  app.use(errorHandler);

  return app;
}
