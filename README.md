# InjenioRw 🇷🇼
### Rwanda's Premier Engineering Talent Marketplace

> *"Rwanda's Engineering Talent, Delivered."*

A full-stack marketplace platform connecting Rwanda's civil, mechanical, structural, electrical, and environmental engineers with clients — locally and globally. Built with a modern stack and MTN Mobile Money integration.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router, Turbopack) |
| Backend | NestJS 10 (modular, TypeScript) |
| Database | PostgreSQL 16 via Prisma ORM |
| Auth | JWT (access + refresh tokens) + Zustand |
| Real-time | Socket.io (WebSocket gateway) |
| Payments | MTN Mobile Money (disbursements) |
| Styling | Tailwind CSS + custom design tokens |
| State | Zustand (client) + TanStack Query (server) |
| API Docs | Swagger (auto-generated) |
| Dev DB | Docker Compose (Postgres + pgAdmin) |

---

## Monorepo Structure

```
injeniorw/
├── apps/
│   ├── frontend/          # Next.js 15 app
│   │   └── src/
│   │       ├── app/       # App Router pages
│   │       ├── components/
│   │       │   ├── layout/    # Navbar, Footer, Providers
│   │       │   ├── sections/  # Hero, FeaturedEngineers, HowItWorks
│   │       │   ├── ui/        # Reusable UI primitives
│   │       │   └── auth/      # Auth-specific components
│   │       ├── lib/       # api.ts (axios client)
│   │       ├── store/     # Zustand stores
│   │       ├── hooks/     # Custom React hooks
│   │       └── styles/    # globals.css
│   │
│   └── backend/           # NestJS API
│       ├── src/
│       │   ├── auth/         # JWT auth, guards, strategies
│       │   ├── users/        # User management
│       │   ├── engineers/    # Engineer profiles & search
│       │   ├── clients/      # Client profiles
│       │   ├── jobs/         # Job postings
│       │   ├── proposals/    # Proposal lifecycle
│       │   ├── contracts/    # Contracts & milestones
│       │   ├── payments/     # MTN MoMo integration
│       │   ├── messages/     # Real-time chat (Socket.io)
│       │   ├── notifications/# Push notifications
│       │   ├── prisma/       # Database service
│       │   └── common/       # Guards, filters, interceptors
│       └── prisma/
│           ├── schema.prisma # Complete DB schema
│           └── seed.ts       # Sample Rwandan engineers & clients
│
├── packages/
│   └── shared/            # Shared types (Phase 2+)
│
├── docker-compose.yml     # PostgreSQL + pgAdmin
└── README.md
```

---

## Quick Start

### Prerequisites
- **Node.js** 20+ (`node --version`)
- **Yarn** (`npm install -g yarn`)
- **Docker Desktop** (for PostgreSQL)

---

### Step 1 — Clone & Install

```bash
git clone <repo-url> injeniorw
cd injeniorw
yarn install
```

---

### Step 2 — Start PostgreSQL

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL** on `localhost:5432`
- **pgAdmin** on `http://localhost:5050` (admin@injeniorw.com / admin123)

---

### Step 3 — Configure Environment

**Backend:**
```bash
cp apps/backend/.env.example apps/backend/.env
```

The default `.env` is already configured for the Docker PostgreSQL:
```
DATABASE_URL="postgresql://injeniorw:injeniorw_dev_password@localhost:5432/injeniorw_db"
```

**Frontend:**
```bash
cp apps/frontend/.env.example apps/frontend/.env.local
```

---

### Step 4 — Run Database Migrations & Seed

```bash
cd apps/backend

# Generate Prisma client
yarn db:generate

# Run migrations (creates all tables)
yarn db:migrate

# Seed with sample Rwandan engineers & clients
yarn db:seed
```

**Seeded accounts** (all use password `Password123!`):

| Role | Email |
|---|---|
| Engineer | marie.uwimana@injeniorw.dev |
| Engineer | emmanuel.nkurunziza@injeniorw.dev |
| Engineer | diane.mukamana@injeniorw.dev |
| Engineer | patrick.habimana@injeniorw.dev |
| Engineer | alice.ingabire@injeniorw.dev |
| Client | infrastructure@rwandan-dev.rw |
| Client | projects@kigalibuilds.rw |

---

### Step 5 — Run the Apps

In two separate terminals:

**Terminal 1 — Backend:**
```bash
cd apps/backend
yarn dev
```
→ API running at `http://localhost:3001/api/v1`
→ Swagger docs at `http://localhost:3001/api/docs`

**Terminal 2 — Frontend:**
```bash
cd apps/frontend
yarn dev
```
→ App running at `http://localhost:3000`

---

## API Overview

All endpoints are prefixed with `/api/v1`.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/register | Register engineer or client |
| POST | /auth/login | Login → returns access + refresh tokens |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Invalidate refresh token |
| GET | /auth/me | Get current user |

### Engineers
| Method | Endpoint | Description |
|---|---|---|
| GET | /engineers | Browse engineers (filterable) |
| GET | /engineers/:id | Get public engineer profile |
| GET | /engineers/me | Own profile (auth required) |
| PUT | /engineers/me/profile | Update profile |
| POST | /engineers/me/skills | Add skill |
| POST | /engineers/me/portfolio | Add portfolio item |
| POST | /engineers/me/certifications | Add certification |

### Jobs
| Method | Endpoint | Description |
|---|---|---|
| GET | /jobs | Browse open jobs |
| POST | /jobs | Post a job (CLIENT) |
| GET | /jobs/:id | Job details |
| PUT | /jobs/:id | Update job (CLIENT) |
| DELETE | /jobs/:id | Close job (CLIENT) |

### Proposals → Contracts → Payments

```
Engineer submits proposal
    ↓
Client shortlists / accepts
    ↓
Client creates contract (from accepted proposal)
    ↓
Engineer submits milestone deliverables
    ↓
Client approves milestone
    ↓
Client releases MTN MoMo payment
    ↓
Engineer receives RWF via Mobile Money
```

---

## MTN Mobile Money Setup

1. Register at [momodeveloper.mtn.com](https://momodeveloper.mtn.com)
2. Subscribe to the **Disbursements** product
3. Create a sandbox user via the Provisioning API
4. Add credentials to `apps/backend/.env`:
   ```
   MTN_MOMO_PRIMARY_KEY=xxx
   MTN_MOMO_USER_ID=xxx
   MTN_MOMO_API_KEY=xxx
   ```
5. In development (no credentials), payments auto-complete as SUCCESSFUL ✓

---

## WebSocket Events (Real-time Chat)

Connect to `ws://localhost:3001/messages` with auth token:

```javascript
const socket = io('http://localhost:3001/messages', {
  auth: { token: accessToken }
})

socket.emit('join_contract', { contractId })
socket.emit('send_message', { contractId, content: 'Hello!' })
socket.on('new_message', (msg) => console.log(msg))
```

---

## Implementation Phases

- [x] **Phase 1** — Scaffolding, auth system, DB schema, landing page ← *You are here*
- [ ] **Phase 2** — Engineer profile builder (full onboarding flow)
- [ ] **Phase 3** — Job board (browse, filter, search with full UI)
- [ ] **Phase 4** — Proposals UI + contract creation flow
- [ ] **Phase 5** — Dashboard (engineer + client views)
- [ ] **Phase 6** — MTN MoMo payment flow (end-to-end)
- [ ] **Phase 7** — Real-time messaging UI
- [ ] **Phase 8** — Reviews, ratings, admin panel
- [ ] **Phase 9** — Mobile-responsive polish + deployment

---

## Design System

The platform uses a custom dark design system inspired by Rwanda's natural palette:

- **Brand green** `#1f9963` — lush Rwandan hills
- **Earth orange** `#d97f27` — volcanic soil of the 1000 hills
- **Rwanda blue** `#0057A4` — from the national flag
- **Typography** — DM Serif Display (headings) + DM Sans (body)

---

## Contributing

This is an actively developed platform. When contributing:

1. Follow the existing module structure in NestJS
2. Always add DTOs with class-validator decorators
3. Use the existing `JwtAuthGuard` + `RolesGuard` pattern for protected routes
4. Add Swagger `@ApiOperation` decorators to all controller methods
5. All frontend pages go under `src/app/` using App Router conventions

---

*Built with 🇷🇼 in Kigali — InjenioRw © 2025*
