import express from "express";

export const app = express();

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

// Esqueleto do sistema (Entrega 1): dados mockados, ainda sem camadas.
// A rota existe para validar a estrutura executável de ponta a ponta.
const accounts = [
  { id: "1", ownerName: "Maria da Silva", balance: 150 },
  { id: "2", ownerName: "João Pereira", balance: 0 }
];

app.get("/accounts", (_request, response) => {
  return response.status(200).json(accounts);
});
