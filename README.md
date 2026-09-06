# Levure - Frontend WebApp

Interface moderna e responsiva para acompanhamento da saúde, cálculos de alimentação e rotina de fermentos naturais (_Levain_). Desenvolvido com foco em usabilidade doméstica e separação de conceitos (_Separation of Concerns_).

---

## Tecnologias Utilizadas

- **Framework:** Next.js 16 (App Router) & React
- **Linguagem:** TypeScript
- **Estilização & UI:** Tailwind CSS & Shadcn/ui (Radix UI)
- **Ícones:** Lucide React
- **Feedback Visual & Notificações:** Sonner (Toasts)
- **Comunicação HTTP:** Axios
- **Containerização:** Docker (Multi-stage build com `standalone output`)

---

## Design & Funcionalidades

### Sprint 1: Fundação & Catálogo

- **Dashboard Geral (`/`):** Métricas agregadas e visão rápida dos cultivos cadastrados.
- **Modal de Cadastro e Edição:** Gestão de fermentos com validações de entrada.
- **Exclusão Segura:** Diálogo de confirmação para evitar perdas acidentais.

### Sprint 2: Calculadora & Histórico de Alimentações

- **Calculadora Multimodo de Proporções:** Cálculo interativo com base no **peso da isca**, no **total desejado** de fermento para a receita ou na **farinha base**.
- **Seleção Rápida de Proporções:** Suporte dinâmico para proporções clássicas (`1:1:1`, `1:2:2`, `1:3:3`, `1:4:4`, `1:5:5`) com controle deslizante de temperatura ambiente.
- **Página de Detalhes com Abas (`/fermentos/[id]`):** Navegação entre a calculadora de alimentação e o histórico cronológico do cultivo.
- **Aba de Histórico:** Rastreamento completo de data, proporção, temperatura ambiente e quantidades em gramas de cada insumo.
- **Refatoração da Listagem de Fermentos (`/fermentos`):** Substituição do grid por **Tabela de Dados**, com colunas de farinha, local, status e tempo relativo da última alimentação (`Hoje`, `Ontem`, `Há X dias`).
- **Aprimoramentos no Dashboard:** Atualização do card de contagem total de alimentações e rodapé dos cards de cultivo com data de alimentação em tipografia monospace.

---

## Como Executar com Docker (Recomendado para Avaliação)

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) instalado.
- A [API Backend](https://github.com/Edu-Fortes/impacta-projeto-software-levure-backend) (`levure-backend`) deve estar em execução na porta `3001`.

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Edu-Fortes/impacta-projeto-software-levure-frontend.git
   cd impacta-projeto-software-levure-frontend
   ```
2. **Suba o container do Frontend:**

   ```bash
   docker compose up -d --build
   ```

3. **Acesse a aplicação:**
   - Abra no navegador: `http://localhost:3000`

## Como Executar Localmente (Desenvolvimento)

1. **Instale as dependências:**
   ```bash
   npm install
   ```
2. **Configure o endpoint da API:**

   Crie um arquivo `.env.local` na raiz:

   ```code snippet
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. **Inicie o servidor local:**

   ```bash
   npm run dev
   ```

4. **Acesse no navegador:** `http://localhost:3000`
