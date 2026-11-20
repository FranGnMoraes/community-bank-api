# Community Bank API

Projeto Integrador da disciplina **Princípios e Padrões de Arquitetura** (IFRS).
Uma API para um **Banco Comunitário**: serviços financeiros solidários para gerar trabalho
e renda em territórios de baixa renda.

| Branch | Entrega | Documento |
|--------|---------|-----------|
| `entrega-1-visao` | 1. Visão: esqueleto executável (`/`, `/health`, `/accounts` mockado) | [`docs/Entrega1_Visao.pdf`](docs/Entrega1_Visao.pdf) |
| `entrega-2-proposta-arquitetural` | 2. Proposta Arquitetural: depósito em conta, implementado em camadas | [`docs/Entrega2_Proposta_Arquitetural.pdf`](docs/Entrega2_Proposta_Arquitetural.pdf) |
| `atividade-arquitetura-hexagonal` | Atividade: Crédito Solidário em Arquitetura Hexagonal (Ports & Adapters) | [`docs/Atividade_Arquitetura_Hexagonal.pdf`](docs/Atividade_Arquitetura_Hexagonal.pdf) |
| `entrega-3-documentacao` | 3. Documentação: C4 Model (Contexto, Contêineres, Componentes) e 4 ADRs | [`docs/Entrega3_Documentacao.pdf`](docs/Entrega3_Documentacao.pdf) |
| `entrega-4-evolucao` | 4. Evolução do Projeto: Segurança de APIs e Evolução Tecnológica | [`docs/Entrega4_Evolucao_Arquitetural.pdf`](docs/Entrega4_Evolucao_Arquitetural.pdf) |
| `apresentacao-final` | Apresentação Final: Slides e Roteiro Completo do Apresentador | [`docs/Apresentacao_Final_Slides.pdf`](docs/Apresentacao_Final_Slides.pdf) · [`docs/Roteiro_Apresentacao_Final.pdf`](docs/Roteiro_Apresentacao_Final.pdf) |

## Arquitetura

Monólito modular no estilo cliente-servidor. Cada módulo de negócio tem quatro camadas, e
as dependências apontam para o domínio (Inversão de Dependência):

```
Cliente → Rota → Controller → Use Case → Domain → Repository → Dados
```

```
src/
├── app.ts · server.ts                 # inicialização da aplicação Express
├── main/                              # composition root (monta as dependências)
├── shared/                            # Money, DomainError, tratamento de erros HTTP
├── modules/accounts/                  # Módulo Contas (organizado em 4 camadas)
│   ├── presentation/                  # rotas, controller, presenter
│   ├── application/                   # casos de uso e DTOs
│   ├── domain/                        # Account, Transaction, políticas, interface do repositório
│   └── infrastructure/                # repositório em memória
└── modules/credit/                    # Módulo Crédito Solidário (Arquitetura Hexagonal)
    ├── domain/                        # CreditRequest, SolidarityEnterprise, CreditRequestRepository (Output Port)
    ├── application/                   # Use cases e CreateSolidarityCreditApplication (Input Port)
    ├── infrastructure/                # SqliteCreditRequestRepository (Driven Adapter DB) e InMemory
    └── presentation/                  # SolidarityCreditController (Driving Adapter) e rotas
```

### Fluxo Hexagonal (Ports & Adapters) no Módulo de Crédito:
```
[Cliente HTTP / Postman]
       │
       ▼
[Driving Adapter: SolidarityCreditController]
       │
       ▼ (invoca através da Input Port)
[Input Port: CreateSolidarityCreditApplication]
       │
       ▼
[Use Case: CreateSolidarityCreditUseCase] ── coordena ──► [Domínio: CreditRequest, SolidarityEnterprise]
       │
       ▼ (invoca através da Output Port)
[Output Port: CreditRequestRepository]
       │
       ▼
[Driven Adapter: SqliteCreditRequestRepository]
       │
       ▼
[Banco de Dados: SQLite / community_bank.sqlite]
```

## Rotas

| Método | Rota | Descrição | Módulo / Padrão |
|--------|------|-----------|-----------------|
| GET  | `/` | confirma que a API responde | Core |
| GET  | `/health` | estado básico da aplicação | Core |
| GET  | `/accounts` | lista as contas correntes | Contas (Camadas) |
| POST | `/accounts` | abre conta: `{ "ownerName": "...", "document": "..." }` | Contas (Camadas) |
| GET  | `/accounts/:id` | consulta a conta e o saldo | Contas (Camadas) |
| POST | `/accounts/:id/deposits` | **depósito**: `{ "amount": 150.75, "description": "..." }` | Contas (Camadas) |
| POST | `/credit/solidarity` | **solicitação de crédito solidário** para empreendimentos | Crédito (Hexagonal) |
| GET  | `/credit/solidarity` | lista solicitações de crédito solidário | Crédito (Hexagonal) |
| GET  | `/credit/solidarity/:id` | consulta detalhes da solicitação de crédito | Crédito (Hexagonal) |

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
