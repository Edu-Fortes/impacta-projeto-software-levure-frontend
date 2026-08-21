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

## Design & Funcionalidades (Sprint 1)

- **Dashboard Geral (`/`):** Visão rápida de métricas (total cadastrado, saudáveis, em atenção e novos cultivos) e prévia dos fermentos.
- **Catálogo de Fermentos (`/fermentos`):** Listagem dedicada com busca em tempo real por nome, tipo de farinha ou local do pote.
- **Modal de Cadastro/Edição:** Criação e manutenção de fermentos com validações de interface.
- **Exclusão com Confirmação:** Modal de diálogo de alerta para evitar remoções acidentais.
- **Tema Visual Customizado:** Paleta quente e orgânica inspirada no processo artesanal de panificação.

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
