# Community Bank API

Projeto Integrador da disciplina **Princípios e Padrões de Arquitetura** (IFRS).
Uma API para um **Banco Comunitário**: serviços financeiros solidários para gerar trabalho
e renda em territórios de baixa renda.

| Branch | Entrega | Documento |
|--------|---------|-----------|
| `entrega-1-visao` | 1. Visão: esqueleto executável (`/`, `/health`, `/accounts` mockado) | [`docs/Entrega1_Visao.pdf`](docs/Entrega1_Visao.pdf) |
| `entrega-2-proposta-arquitetural` | 2. Proposta Arquitetural: depósito em conta, implementado em camadas | [`docs/Entrega2_Proposta_Arquitetural.pdf`](docs/Entrega2_Proposta_Arquitetural.pdf) |

## Arquitetura

Monólito modular no estilo cliente-servidor. Cada módulo de negócio tem quatro camadas, e
as dependências apontam para o domínio (Inversão de Dependência):

```
Cliente → Rota → Controller → Use Case → Domain → Repository → Dados
```

```
src/
├── app.ts · server.ts                 # como no guia da disciplina
├── main/                              # composition root (monta as dependências)
├── shared/                            # Money, DomainError, tratamento de erros HTTP
└── modules/accounts/
    ├── presentation/                  # rotas, controller, presenter
    ├── application/                   # casos de uso e DTOs
    ├── domain/                        # Account, Transaction, políticas, interface do repositório
    └── infrastructure/                # repositório em memória
```

## Rotas

| Método | Rota | Descrição |
|--------|------|-----------|
| GET  | `/` | confirma que a API responde |
| GET  | `/health` | estado básico da aplicação |
| GET  | `/accounts` | lista as contas |
| POST | `/accounts` | abre conta: `{ "ownerName": "Maria da Silva", "document": "123.456.789-09" }` |
| GET  | `/accounts/:id` | consulta a conta e o saldo |
| POST | `/accounts/:id/deposits` | **depósito**: `{ "amount": 150.75, "description": "Venda na feira" }` |

Os erros têm sempre o mesmo formato: `{ "error": { "code": "...", "message": "..." } }`.

## Como executar

Requer Node.js 18 ou superior.

```bash
npm install
npm run dev          # http://localhost:3000
```

Exemplo de uso (em outro terminal):

```bash
curl -X POST http://localhost:3000/accounts \
  -H "content-type: application/json" \
  -d '{"ownerName": "Maria da Silva", "document": "123.456.789-09"}'

# use o "id" devolvido acima
curl -X POST http://localhost:3000/accounts/<id>/deposits \
  -H "content-type: application/json" \
  -d '{"amount": 150.75, "description": "Venda na feira"}'
```

Antes de entregar:

```bash
npm test             # testes de domínio, caso de uso e HTTP
npm run typecheck
npm run build
npm start
```

A persistência é em memória nesta fase, então os dados somem quando a API reinicia.
O PostgreSQL entra nas próximas entregas sem alterar o domínio (ver ADR-06 no PDF).

## Stack

Node.js (runtime), TypeScript (linguagem), Express 5 (framework HTTP), tsx (execução em
desenvolvimento) e `node:test` (testes), conforme o guia de inicialização da disciplina.
