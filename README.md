# Community Bank API

Projeto Integrador da disciplina **Princípios e Padrões de Arquitetura** (IFRS).
Uma API para um **Banco Comunitário**: serviços financeiros solidários para gerar trabalho
e renda em territórios de baixa renda.

## Entrega 1 — Visão

Esta branch tem o **esqueleto executável** do sistema. Ainda há pouca funcionalidade,
mas a estrutura já roda de ponta a ponta, como recomenda a Aula 4:

| Método | Rota        | Objetivo                                  |
|--------|-------------|-------------------------------------------|
| GET    | `/`         | confirmar que a API está respondendo      |
| GET    | `/health`   | verificar o estado básico da aplicação    |
| GET    | `/accounts` | listar contas (dados mockados)            |

O documento da Visão (contexto, stakeholders, drivers, ASRs, cenários de qualidade e
utility tree) está em [`docs/Entrega1_Visao.pdf`](docs/Entrega1_Visao.pdf).

## Como executar

Requer Node.js 18 ou superior.

```bash
npm install
npm run dev          # desenvolvimento, com reload automático
```

Em outro terminal:

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
curl http://localhost:3000/accounts
```

Antes de entregar:

```bash
npm run typecheck
npm run build
npm start
```

## Stack

Node.js (runtime), TypeScript (linguagem), Express 5 (framework HTTP) e tsx (execução em
desenvolvimento), conforme o guia de inicialização da disciplina.
