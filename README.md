# 🕒 Clockwise API — Controle de Ponto

API REST para controle de ponto de colaboradores, construída com Node.js, Fastify e Supabase. Arquitetura limpa, escalável, seguindo princípios SOLID e Clean Architecture.

---

## 🚀 Tecnologias Utilizadas

- Node.js + TypeScript
- Fastify
- Supabase (PostgreSQL)
- Zod (validação)
- Vitest + Supertest (testes)
- ESLint + Prettier + Husky + lint-staged
- **Docker** (containerização)

---

## 🏗️ Arquitetura do Projeto

```
/src
├── app.ts                # Configuração do Fastify
├── server.ts             # Inicialização do servidor
├── config/              
│   ├── database.ts      # Configuração Supabase
│   └── env.ts           # Variáveis de ambiente
├── modules/             
│   ├── users/          
│   │   ├── controller.ts
│   │   ├── service.ts   
│   │   ├── repository.ts
│   │   └── types.ts     
│   └── clock/          
│       ├── controller.ts
│       ├── service.ts   
│       ├── repository.ts
│       └── types.ts     
├── middlewares/
│   ├── auth.ts
│   └── error-handler.ts
├── utils/
│   ├── date.ts
│   └── validation.ts
└── types/
    └── common.ts

# Arquivos Docker
/Dockerfile
/docker-compose.yml
/.dockerignore
```

---

## 🗄️ Estrutura do Banco de Dados (Supabase)

### 🔹 users
| Campo          | Tipo       | Descrição              | Constraints    |
|----------------|------------|------------------------|----------------|
| id             | UUID       | Identificador único    | PK            |
| name           | VARCHAR    | Nome do colaborador    | NOT NULL      |
| email          | VARCHAR    | Email único            | UNIQUE        |
| password_hash   | VARCHAR    | Senha criptografada    | NOT NULL      |
| active         | BOOLEAN    | Status do usuário      | DEFAULT true  |
| created_at     | TIMESTAMP  | Data de criação        | DEFAULT now() |
| updated_at     | TIMESTAMP  | Data de atualização    | DEFAULT now() |

### 🔹 clock_entries
| Campo        | Tipo       | Descrição                    | Constraints    |
|--------------|------------|------------------------------|----------------|
| id           | UUID       | Identificador único          | PK            |
| user_id      | UUID       | Referência ao usuário        | FK            |
| clock_in     | TIMESTAMP  | Horário de início do turno   | NOT NULL      |
| clock_out    | TIMESTAMP  | Horário de fim do turno      | NULL          |
| total_hours  | INTERVAL   | Horas trabalhadas no turno   | NULL          |
| status       | VARCHAR    | Status do registro           | CHECK ('open','closed') |
| notes        | VARCHAR    | Observações/justificativas   | NULL          |
| created_at   | TIMESTAMP  | Registro criado             | DEFAULT now() |
| updated_at   | TIMESTAMP  | Registro atualizado         | DEFAULT now() |

🔗 Relações e Índices:
- FK: `clock_entries.user_id` → `users.id`
- IDX: `users(email)`
- IDX: `clock_entries(user_id, clock_in)`
- IDX: `clock_entries(status)`

---

## 🔥 Endpoints da API

### 👤 Autenticação
```
POST   /auth/login       # Login do usuário
POST   /auth/logout      # Logout do usuário
```

### ⏰ Controle de Ponto
```
POST   /clock/in         # Registrar entrada
POST   /clock/out        # Registrar saída
GET    /clock/status     # Status atual do usuário
GET    /clock/today      # Horas do dia atual
GET    /clock/history    # Histórico de registros
```

---

## 🏃‍♂️ Como rodar localmente

### 🔧 Pré-requisitos

- Node.js >=18
- Docker e Docker Compose
- Conta no Supabase
- pnpm (recomendado) ou npm

### 📦 Variáveis de Ambiente
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-service-role
JWT_SECRET=seu-secret-jwt
NODE_ENV=development
PORT=3000
```

### 🚀 Instalação e Execução

#### Opção 1: Desenvolvimento Local
```bash
# Instalar dependências
pnpm install

# Desenvolvimento
pnpm dev

# Testes
pnpm test

# Build
pnpm build
```

#### Opção 2: Docker (Recomendado)
```bash
# Desenvolvimento com Docker
docker-compose up --build

# Produção
docker build -t clockwise-api .
docker run -p 3000:3000 clockwise-api
```

### 🐳 Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
```

---

## 📝 Scripts Disponíveis

| Comando      | Descrição                          |
|--------------|-----------------------------------|
| pnpm dev     | Inicia em modo desenvolvimento    |
| pnpm build   | Build para produção              |
| pnpm start   | Inicia em produção               |
| pnpm test    | Executa testes                   |
| pnpm lint    | Verifica código                  |
| pnpm format  | Formata código                   |

---

## 🧪 Testes

### Estrutura de Testes
```
/tests
├── unit/
│   ├── services/
│   └── utils/
├── integration/
│   ├── auth.test.ts
│   └── clock.test.ts
└── e2e/
    └── api.test.ts
```

### Tipos de Testes
- **Unitários**: Services isolados, regras de negócio
- **Integração**: Endpoints, autenticação
- **E2E**: Fluxos completos da aplicação

### Executar Testes
```bash
# Todos os testes
pnpm test

# Testes unitários
pnpm test:unit

# Testes de integração
pnpm test:integration

# Cobertura
pnpm test:coverage
```

---

## 🎨 Releitura do Protótipo Figma

### Análise do Protótipo Original
- [Link para o protótipo original](https://www.figma.com/file/fQaTM68I4Bi8YnmFzoTNFk/Ilumeo---Teste-Fullstack?node-id=0%3A1&t=Bh49PfFY5sob17t5-1)

### Melhorias Implementadas
- **UX/UI**: Interface mais intuitiva e moderna
- **Responsividade**: Design mobile-first
- **Acessibilidade**: Contraste e navegação melhorados
- **Performance**: Carregamento otimizado

### Link para Nova Versão
- [Link para a releitura do protótipo](LINK_PARA_NOVA_VERSAO_FIGMA)

---

## 📋 Princípios SOLID Aplicados

### S - Single Responsibility Principle
- **Controller**: Responsável apenas por receber requests e retornar responses
- **Service**: Contém apenas a lógica de negócio
- **Repository**: Responsável apenas pelo acesso a dados

### O - Open/Closed Principle
- **Módulos**: Abertos para extensão, fechados para modificação
- **Services**: Novas funcionalidades via composição, não modificação

### L - Liskov Substitution Principle
- **Repositories**: Implementações podem ser substituídas sem quebrar o código
- **Services**: Interfaces permitem diferentes implementações

### I - Interface Segregation Principle
- **Repositories**: Interfaces específicas para cada domínio
- **Services**: Métodos agrupados por responsabilidade

### D - Dependency Inversion Principle
- **Injeção de Dependência**: Services dependem de abstrações, não implementações
- **Inversão de Controle**: Dependências injetadas externamente

---

## 🧠 Sobre
Desenvolvido como parte do teste técnico para a Ilumeo Data Science, aplicando princípios de arquitetura limpa, escalabilidade e organização de código.

### Requisitos Atendidos
- ✅ React no front-end
- ✅ Node.js no back-end
- ✅ TypeScript
- ✅ Docker
- ✅ Princípios SOLID
- ✅ Testes automatizados
- ✅ ESLint e Prettier
- ✅ Código limpo e semântico
- ✅ Responsividade
- ✅ Conexão com banco de dados
- ✅ Deploy (Render + Vercel)
- ✅ Releitura do protótipo Figma
