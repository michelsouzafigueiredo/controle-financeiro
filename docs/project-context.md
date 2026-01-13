# Project Context: Open Source Financial Planner (Local-First)

## 1. Visão Geral do Projeto

O objetivo é desenvolver um **Planejador Financeiro Desktop Open Source** focado em privacidade e propriedade de dados ("Local-First").
Diferente das soluções SaaS atuais, este software:

- Funciona 100% offline.
- Não possui servidor centralizado nem login/autenticação em nuvem.
- Armazena todos os dados localmente na máquina do usuário (SQLite).
- É distribuído como um executável instalável (.exe, .dmg, .AppImage).

## 2. Stack Tecnológica

### Frontend (Renderer Process)

- **Language:** TypeScript.
- **Framework:** Vue.js 3 (Composition API + Script Setup).
- **UI Library:** Quasar Framework (Vite Plugin).
- **State Management:** Pinia.
- **Routing:** Vue Router.

### Backend Local (Main Process)

- **Language:** TypeScript.
- **Runtime:** Node.js (via Electron).
- **Platform:** Electron.
- **Database:** SQLite.
- **Drivers & ORM:** `better-sqlite3` (driver síncrono de alta performance) e `drizzle-orm` (TypeScript ORM).

## 3. Arquitetura e Fluxo de Dados

O projeto segue estritamente a arquitetura de **Isolamento de Processos** do Electron, agora reforçada por tipagem estática.

### Regras de Ouro para Desenvolvimento (IA Instructions)

1.  **Sem Acesso Direto:** O Frontend (`src/`) NUNCA acessa o banco de dados ou o sistema de arquivos diretamente.
2.  **Type Safety (IPC):** As interfaces de dados (ex: `Transaction`, `Account`) devem ser compartilhadas entre Frontend e Backend para garantir que o payload enviado pelo Vue seja exatamente o que o Electron espera receber.
3.  **Dependências Nativas (CRÍTICO):** Bibliotecas com bindings nativos (`better-sqlite3`, `knex`, `sqlite3`) DEVEM ser listadas na configuração `external` do `esbuild` dentro do `quasar.config.ts`. Elas não podem ser "bundleadas" pelo processo de build do TypeScript.
4.  **Instalação:** Dependências de produção (`better-sqlite3`, `knex`) devem estar em `dependencies`, não `devDependencies`.
5.  **Gerenciador de Pacotes:** Use **YARN** estritamente. Nunca use `npm install`.
6.  **ORM:** Drizzle ORM é o padrão. Não use Knex ou TypeORM.

### O Fluxo de Requisição Tipado

1.  **UI (Vue):** Dispara uma ação (ex: `userStore.getTransactions()`) esperando um retorno do tipo `Promise<Transaction[]>`.
2.  **Preload:** Exposto via `contextBridge`, chama `ipcRenderer.invoke`.
3.  **Main Process:** Ouve o canal e delega para um **Controller**.
4.  **Controller:** Recebe o evento tipado `IpcMainInvokeEvent`, chama o Service/Repository.
5.  **Repository:** Executa a query no SQLite via `drizzle-orm` retornando dados tipados.

## 4. Estrutura de Diretórios

A estrutura separa UI e Backend, utilizando `.ts` em todo o código fonte.

```text
meu-projeto/
├── src/                        # [FRONTEND] Vue + Quasar
│   ├── components/             # Componentes UI
│   ├── pages/                  # Views/Telas
│   ├── stores/                 # Pinia Stores
│   ├── shared/                 # [NOVO] Tipos compartilhados (Interfaces/DTOs)
│   │   └── types.ts            # ex: export interface Transaction { ... }
│   └── api/                    # Fachada para chamadas da Preload Bridge
│
├── src-electron/               # [BACKEND] Node.js + TypeScript
│   ├── electron-main.ts        # Entry point (Main Process)
│   ├── electron-preload.ts     # Ponte segura (IPC)
│   │
│   ├── db/                     # Camada de Dados
│   │   ├── index.ts            # Inicialização do SQLite (Connection)
│   │   ├── migrations/         # Arquivos de migração do Knex
│   │   └── seeds/              # Dados iniciais
│   │
│   ├── controllers/            # Recebem eventos IPC
│   │   └── TransactionController.ts
│   │
│   └── services/               # Regras de negócio puras
│       └── ImportService.ts
│
├── package.json
└── quasar.config.ts            # Configuração do Build (inclui externalização de módulos)
```
