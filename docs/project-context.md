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

- **Framework:** Vue.js 3 (Composition API + Script Setup).
- **UI Library:** Quasar Framework (Vite Plugin).
- **State Management:** Pinia.
- **Routing:** Vue Router.

### Backend Local (Main Process)

- **Runtime:** Node.js (via Electron).
- **Platform:** Electron.
- **Database:** SQLite.
- **Drivers & ORM:** `better-sqlite3` (driver síncrono de alta performance) e `knex` (Query Builder & Migrations).

## 3. Arquitetura e Fluxo de Dados

O projeto segue estritamente a arquitetura de **Isolamento de Processos** do Electron.

### Regras de Ouro para Desenvolvimento (IA Instructions)

1.  **Sem Acesso Direto:** O Frontend (`src/`) NUNCA acessa o banco de dados ou o sistema de arquivos diretamente.
2.  **Padrão IPC:** Toda comunicação deve passar pela ponte `preload.js` usando `ipcRenderer.invoke`.
3.  **Dependências:** Bibliotecas nativas (ex: `better-sqlite3`, `knex`) devem ser instaladas como `dependencies` (não `devDependencies`) para garantir o empacotamento correto pelo Electron Builder.

### O Fluxo de Requisição

1.  **UI (Vue):** Dispara uma ação (ex: `userStore.getTransactions()`).
2.  **Preload:** Exposto via `contextBridge`, chama `ipcRenderer.invoke('channel', payload)`.
3.  **Main Process:** Ouve o canal e delega para um **Controller**.
4.  **Controller:** Valida a entrada e chama um **Service** ou **Repository**.
5.  **Repository:** Executa a query no SQLite via `knex`.

## 4. Estrutura de Diretórios

A estrutura deve separar claramente a UI da Lógica de Negócios (Backend Local).

meu-projeto/
├── src/ # [FRONTEND] Vue + Quasar
│ ├── components/ # Componentes UI reutilizáveis
│ ├── pages/ # Views/Telas da aplicação
│ ├── stores/ # Gerenciamento de estado (Pinia)
│ └── api/ # Fachada para chamadas da Preload Bridge
│
├── src-electron/ # [BACKEND] Node.js
│ ├── electron-main.js # Entry point do Electron
│ ├── electron-preload.js # Ponte segura (IPC)
│ │
│ ├── db/ # Camada de Dados
│ │ ├── index.js # Inicialização do SQLite
│ │ ├── migrations/ # Arquivos de migração do Knex
│ │ └── seeds/ # Dados iniciais
│ │
│ ├── controllers/ # Recebem eventos IPC e orquestram a resposta
│ └── services/ # Regras de negócio puras (ex: Parsers, Cálculos)
│
├── package.json
└── quasar.config.js

## 5. Estratégia de Dados (SQLite)

- **Localização:** O arquivo `.sqlite` deve ser criado dinamicamente na pasta `userData` do sistema operacional (obtida via `app.getPath('userData')`), garantindo persistência entre atualizações.
- **Migrations:** O sistema deve rodar as migrations do Knex automaticamente na inicialização (`electron-main.js`) antes de abrir a janela principal.
