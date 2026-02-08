# Rede Kids - Sistema do Departamento Infantil

Sistema web para gestão do departamento infantil da igreja CVCG. Permite o cadastro de crianças, controle de presença nos cultos, gerenciamento de servos (voluntários) e exportação de relatórios em PDF.

## Funcionalidades

- **Crianças** — Cadastro com nome, data de nascimento, responsável e telefone. Classificação automática por sala (Maternal 2-3 anos, Jardim 4-6 anos, Primário 7-9 anos).
- **Presença** — Registro de presença por culto, data e sala. Suporte a visitantes. Verificação de duplicatas.
- **Servos** — Cadastro de voluntários e escalação por culto, sala e função (Professor/Auxiliar).
- **Relatórios** — Exportação de listagens e relatórios mensais de presença em PDF.
- **Dashboard** — Visão geral com totais de crianças, servos e presenças do mês.

## Tecnologias

- [Next.js](https://nextjs.org/) 16 (App Router + Server Actions)
- [React](https://react.dev/) 19
- [Supabase](https://supabase.com/) (PostgreSQL)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [jsPDF](https://github.com/parallax/jsPDF) para geração de PDFs
- [date-fns](https://date-fns.org/) para manipulação de datas
- Deploy via [Vercel](https://vercel.com/)

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/) ou [pnpm](https://pnpm.io/)
- Uma conta no [Supabase](https://supabase.com/) com um projeto criado

## Configuração do banco de dados (Supabase)

Crie as seguintes tabelas no seu projeto Supabase:

### children
| Coluna | Tipo | Observação |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| name | text | NOT NULL |
| birth_date | date | NOT NULL |
| guardian_name | text | NOT NULL |
| guardian_relationship | text | NOT NULL |
| phone | text | NOT NULL |
| active | boolean | default `true` |
| created_at | timestamptz | default `now()` |

### servants
| Coluna | Tipo | Observação |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| name | text | NOT NULL |
| phone | text | nullable |
| active | boolean | default `true` |
| created_at | timestamptz | default `now()` |

### services
| Coluna | Tipo | Observação |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| service_date | date | NOT NULL |
| time_slot | text | NOT NULL |
| created_at | timestamptz | default `now()` |

### attendance
| Coluna | Tipo | Observação |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| service_id | uuid | FK para `services.id` |
| child_id | uuid | FK para `children.id`, nullable |
| is_visitor | boolean | default `false` |
| visitor_name | text | nullable |
| visitor_birth_date | date | nullable |
| visitor_guardian_name | text | nullable |
| visitor_phone | text | nullable |
| classroom | text | NOT NULL |
| created_at | timestamptz | default `now()` |

### service_servants
| Coluna | Tipo | Observação |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| service_id | uuid | FK para `services.id` |
| servant_id | uuid | FK para `servants.id` |
| role | text | NOT NULL |
| classroom | text | NOT NULL |
| created_at | timestamptz | default `now()` |

## Instalação e execução local

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd rede-kids
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

Você encontra esses valores no painel do Supabase em **Settings > API**.

### 4. Execute o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

### 5. Build de produção

```bash
npm run build
npm start
```

## Estrutura do projeto

```
rede-kids/
├── app/
│   ├── (app)/
│   │   ├── criancas/       # Gestão de crianças
│   │   ├── presenca/       # Controle de presença
│   │   ├── servos/         # Gestão de servos
│   │   ├── page.tsx        # Dashboard
│   │   └── layout.tsx      # Layout com navegação
│   └── layout.tsx          # Layout raiz
├── components/
│   ├── ui/                 # Componentes shadcn/ui
│   ├── child-form.tsx      # Formulário de criança
│   ├── children-list.tsx   # Lista de crianças
│   ├── servant-form.tsx    # Formulário de servo
│   ├── bottom-nav.tsx      # Navegação inferior
│   └── page-header.tsx     # Cabeçalho de página
├── lib/
│   ├── supabase/           # Configuração do Supabase
│   ├── classrooms.ts       # Lógica de salas e idades
│   └── pdf.ts              # Geração de PDFs
└── next.config.mjs
```

## Deploy

O projeto está configurado para deploy na Vercel. Ao fazer deploy, configure as mesmas variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`) no painel da Vercel.

Se utilizar um domínio customizado, adicione-o em `next.config.mjs` na propriedade `serverActions.allowedOrigins` para que os Server Actions funcionem corretamente:

```js
experimental: {
  serverActions: {
    allowedOrigins: ['seu-dominio.com.br'],
  },
},
```
