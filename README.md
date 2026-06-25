# Essentia TO

Aplicativo fullstack para gestão clínica de uma terapeuta ocupacional. O MVP reúne autenticação, pacientes, prontuários, evoluções, agenda, documentos, dashboard e relatórios imprimíveis.

## Tecnologias

- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router DOM, Axios e Lucide React.
- Backend: Node.js, Express, TypeScript, Prisma ORM, MySQL, JWT, Bcrypt, Zod, Dotenv e CORS.

## Pré-requisitos

- Node.js 20 ou superior
- npm
- MySQL 8 ou superior

## Configuração

1. Crie um banco MySQL:

```sql
CREATE DATABASE clinica_ocupacional
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

2. Instale as dependências:

```bash
npm install
npm run install:all
```

3. Copie `backend/.env.example` para `backend/.env` e ajuste:

```env
DATABASE_URL="mysql://root:password@localhost:3306/clinica_ocupacional"
JWT_SECRET="uma-chave-segura-com-pelo-menos-16-caracteres"
PORT=3333
FRONTEND_URL="http://localhost:5173"
```

4. Gere o Prisma Client e crie as tabelas:

```bash
npm run prisma:generate --prefix backend
npm run prisma:migrate --prefix backend -- --name init
```

5. Insira os dados fictícios:

```bash
npm run seed --prefix backend
```

Credenciais do seed:

- Terapeuta: `terapeuta@exemplo.com` / `123456`
- Paciente ou responsável: `paciente@exemplo.com` / `123456`

6. Inicie frontend e backend:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3333
- Health check: http://localhost:3333/health

## Scripts

Na raiz:

- `npm run install:all`: instala as dependências dos dois projetos.
- `npm run dev`: inicia frontend e backend simultaneamente.
- `npm run build`: compila frontend e backend.

No backend:

- `npm run dev`: inicia a API em modo de desenvolvimento.
- `npm run build`: gera a pasta `dist`.
- `npm run prisma:generate`: gera o Prisma Client.
- `npm run prisma:migrate`: executa migrations de desenvolvimento.
- `npm run prisma:studio`: abre o Prisma Studio.
- `npm run seed`: recria os dados fictícios da terapeuta de demonstração.

No frontend:

- `npm run dev`: inicia o Vite.
- `npm run build`: valida o TypeScript e gera o bundle de produção.
- `npm run preview`: visualiza o build.

## Segurança implementada

- Senhas armazenadas apenas como hash Bcrypt.
- JWT obrigatório em todas as rotas clínicas.
- Escopo por `therapistId`: a terapeuta acessa somente seus pacientes e registros.
- Senha e hash nunca são retornados pela API.
- Payloads validados com Zod.
- Verificação de propriedade antes de editar ou excluir registros.

## Estrutura

```text
.
├── backend
│   ├── prisma
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src
│       ├── lib
│       ├── middlewares
│       ├── routes
│       └── types
└── frontend
    └── src
        ├── components
        ├── contexts
        ├── lib
        └── pages
```

> O campo de documento registra apenas uma URL ou caminho de referência. Upload real não faz parte deste MVP.

## Como testar o Portal do Paciente

Com frontend e backend em execução:

- Login da terapeuta: http://localhost:5173/login
- Login do paciente/responsável: http://localhost:5173/portal/login

Credenciais fictícias:

- Terapeuta: `terapeuta@exemplo.com` / `123456`
- Paciente ou responsável: `paciente@exemplo.com` / `123456`

A terapeuta pode gerenciar o acesso ao portal abrindo um paciente e selecionando a aba **Acesso ao Portal**. Nessa área é possível criar a conta, editar nome e e-mail, ativar ou desativar o acesso e redefinir a senha temporária.

O portal permite apenas visualizar dados básicos do próprio paciente, criar registros no Diário Terapêutico e consultar o próprio histórico. Prontuário, evoluções clínicas internas e documentos privados não são disponibilizados.
