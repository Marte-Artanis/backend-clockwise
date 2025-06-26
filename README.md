# 🕒 Clockwise API — Backend

REST API built with **Node.js**, **Fastify**, **Prisma** and **PostgreSQL**. Provides endpoints for user management and working-hours tracking.

## ✨ Tech Stack
* Fastify + TypeScript
* Prisma ORM
* PostgreSQL (via Docker)
* AJV for schema validation
* Vitest + Supertest for automated tests
* ESLint (flat-config) & Prettier

## 📦 Getting Started
### 1. Clone both repositories
```bash
git clone https://github.com/Marte-Artanis/backend-clockwise.git   # API
git clone https://github.com/Marte-Artanis/clockwise-frontend.git  # SPA
```

### 2. Run with Docker Compose (recommended)
Inside the **clockwise-api** directory run:
```bash
docker compose up --build
```
This will build the API, the frontend (using `../clockwise-web` as context) and three Postgres databases.

### 3. Local development without Docker
```bash
npm install              # install deps
cp env.example .env      # create environment file
npm run dev              # starts Fastify with nodemon
```
The server will watch for file changes and reload.

### Running Tests
```bash
npm test            # unit + integration + e2e
```
The test suite spins up a separate Postgres container and runs migrations automatically.

## 🔐 Environment Variables
All variables live in `.env`. Below are the most common ones (see `env.example` for the full list):

| Key | Description | Default |
|-----|-------------|---------|
| NODE_ENV | Environment name | development |
| JWT_SECRET | Token secret | **required** |
| DEV_POSTGRES_* | Credentials for dev database | clockwise_dev / … |
| TEST_POSTGRES_* | Credentials for test database | clockwise_test / … |
| PROD_POSTGRES_* | Credentials for prod database | clockwise_prod / … |

`DATABASE_URL` is composed automatically based on the selected `NODE_ENV`.

## 🌐 Available Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| POST | /auth/register | Register new user |
| POST | /auth/login | User login (JWT) |
| GET | /clock/status | Current status + today hours |
| POST | /clock/in | Clock-in (start shift) |
| POST | /clock/out | Clock-out (end shift) |
| GET | /clock/today | Total hours for current day |
| GET | /clock/week | Total hours for current week |
| GET | /clock/month | Total hours for current month |
| GET | /clock/history | Paginated history, filters | 
| GET | /health | Liveness probe |

All routes (except `/health` and auth) require `Authorization: Bearer <token>` header.

## 🛠️ Useful Scripts
| Command | What it does |
|---------|--------------|
| `npm run dev` | Start dev server with reload |
| `npm run build` | Create production build |
| `npm start` | Run built version |
| `npm run migrate` | Apply migrations in prod/test |
| `npm run migrate:dev` | Dev migration workflow |
| `npm run lint` | Lint codebase |
| `npm run format` | Format with Prettier |

## 🗂️ Folder Structure
```
clockwise-backend/
├── src/
│   ├── app.ts          # Fastify factory
│   ├── server.ts       # Entry point
│   ├── config/         # env & prisma helpers
│   ├── modules/        # domain modules (users, clock)
│   ├── middlewares/    # auth, error handler
│   └── utils/          # helper functions
├── prisma/             # schema & migrations
└── tests/              # unit, integration & e2e
```

## 🔄 Database Migrations
Prisma migrations are tracked in `prisma/migrations/`.
```bash
# generate SQL & apply against DEV DB
npm run migrate:dev -- --name "init"

# deploy pending migrations (used in Docker/prod)
npm run migrate
```
Inside Docker, the API container runs `prisma migrate deploy` automatically on start-up.

## 🤔 Why two repositories?
Keeping backend and frontend isolated offers advantages:

1. Scalability & autonomy – each service can evolve independently, have its own release cycle and CI pipeline. Teams focused on API or UI don't block each other.
2. Clear ownership – issues, PRs and security settings are scoped to their respective domain.
3. Lighter clones/builds – contributors download only what they need.
4. Easier deployment – we can tag and ship Docker images (`backend-clockwise`, `clockwise-frontend`) separately and roll back one without touching the other.

The shared `docker-compose.yml` inside **backend-clockwise** makes local integration trivial: when both repos are placed side-by-side, one command (`docker compose up`) starts the entire stack.

---
Made with ♥ for the Ilumeo Data Science challenge.
