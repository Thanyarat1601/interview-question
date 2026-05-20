# interview-question-tcc-thaibev

Full-stack interview test for **example.com** — TCC / ThaiBev Application Developer position.
All 10 questions (No.1 – No.10) are implemented as modules inside **one** project, sharing the
same database, authentication, layout, and HTTP client.

## Tech stack

| Layer    | Choice                                        |
| -------- | --------------------------------------------- |
| Backend  | Go 1.22 + Gin + GORM                          |
| Frontend | Angular 17 (standalone components + signals)  |
| Database | PostgreSQL 16                                 |
| Auth     | JWT (HS256) + bcrypt password hash            |
| Infra    | Docker Compose (db + backend)                 |
| Libs     | `jsbarcode` (Code 39), `qrcode` (QR rendering) |

## Project structure

```
interview-question-tcc-thaibev/
├── backend/
│   ├── cmd/server/main.go            # entrypoint
│   └── internal/
│       ├── config/                   # env config
│       ├── database/                 # gorm connect + automigrate + seed
│       ├── middleware/jwt.go         # JWT issue / parse / RequireJWT
│       ├── router/                   # gin router + CORS
│       ├── common/response.go        # uniform {success,message,data}
│       └── modules/
│           ├── q01_person/           # CRUD + age calc
│           ├── q02_auth/             # register / login / /me
│           ├── q03_approval/         # docs with approve/reject + reason
│           ├── q04_profile/          # form + Base64 image
│           ├── q05_queue/            # A0-Z9 ticket, row-locked
│           ├── q06_barcode/          # 16-char code + Code 39
│           ├── q07_qrcode/           # 30-char unique code + QR
│           ├── q08_exam_admin/       # exam CRUD with running number
│           ├── q09_comment/          # comments by Blend 285
│           └── q10_exam/             # take exam + score persistence
├── frontend/
│   └── src/app/
│       ├── core/                     # api.service, auth.service, interceptor
│       ├── shared/layout/            # sidebar + router-outlet
│       └── pages/
│           ├── dashboard/
│           ├── q01-person/  ...  q10-exam/
├── docker-compose.yml
└── README.md
```

## Status — all 10 modules implemented

| #   | Module             | Notes                                                                    |
| --- | ------------------ | ------------------------------------------------------------------------ |
| 1   | Person CRUD        | Add modal + View modal (read-only); age computed server-side             |
| 2   | Register/Login JWT | bcrypt + JWT (HS256); `/me` validates token via RequireJWT middleware    |
| 3   | Approval workflow  | 5 seeded docs; can't re-decide; reason required and persisted            |
| 4   | Profile + Base64   | email/phone/DD-MM-YYYY/required validations; image stored as Base64      |
| 5   | Queue A0–Z9        | Singleton row + `SELECT FOR UPDATE` lock → no duplicate ticket on race   |
| 6   | Barcode Code 39    | `^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$`; delete confirm modal |
| 7   | QR product code    | `^[A-Z0-9]{5}(-[A-Z0-9]{5}){5}$` + unique index; QR modal via `qrcode`   |
| 8   | Exam mgmt          | CRUD; `no` is computed at list time so it re-numbers after delete        |
| 9   | Comment box        | Commenter fixed to `Blend 285`; Enter to post                            |
| 10  | Take exam          | 5 seeded questions; score + answers persisted; restart resets state      |

## Quick start

### 1. Start PostgreSQL

```bash
docker compose up -d db
```

### 2. Run backend

```bash
cd backend
cp .env.example .env       # adjust if needed
go mod tidy
go run ./cmd/server
# server listening on :8080
```

Health check: <http://localhost:8080/healthz>

### 3. Run frontend

```bash
cd frontend
npm install
npm start
# Angular dev server: http://localhost:4200
```

### 4. (Optional) Run db + backend via Docker

```bash
docker compose up --build
# db on :5432, backend on :8080
# run the Angular frontend locally with `npm start`
```

## API summary

| Method | Path                                  | Auth   | Purpose                                |
| ------ | ------------------------------------- | :----: | -------------------------------------- |
| GET    | `/healthz`                            | –      | Health probe                           |
| GET    | `/api/q01/persons`                    | –      | List persons                           |
| POST   | `/api/q01/persons`                    | –      | Create person                          |
| GET    | `/api/q01/persons/:id`                | –      | Get one person                         |
| POST   | `/api/q02/register`                   | –      | Register (validates confirm + bcrypt)  |
| POST   | `/api/q02/login`                      | –      | Login → returns JWT                    |
| GET    | `/api/q02/me`                         | ✅ JWT | Returns claims (validates token)       |
| GET    | `/api/q03/documents`                  | –      | List approval docs                     |
| PATCH  | `/api/q03/documents/:id/approve`      | –      | Approve with reason                    |
| PATCH  | `/api/q03/documents/:id/reject`       | –      | Reject with reason                     |
| POST   | `/api/q04/profiles`                   | –      | Create profile (Base64 image)          |
| GET    | `/api/q04/profiles/:id`               | –      | Get profile                            |
| GET    | `/api/q05/queue/current`              | –      | Current ticket                         |
| POST   | `/api/q05/queue/next`                 | –      | Take next ticket (concurrency-safe)    |
| POST   | `/api/q05/queue/reset`                | –      | Reset queue to 00                      |
| GET    | `/api/q06/products`                   | –      | List barcode products                  |
| POST   | `/api/q06/products`                   | –      | Create barcode product                 |
| DELETE | `/api/q06/products/:id`               | –      | Delete barcode product                 |
| GET    | `/api/q07/products`                   | –      | List QR products                       |
| POST   | `/api/q07/products`                   | –      | Create QR product (unique)             |
| DELETE | `/api/q07/products/:id`               | –      | Delete QR product                      |
| GET    | `/api/q08/exams`                      | –      | List exams (with running `no`)         |
| POST   | `/api/q08/exams`                      | –      | Create exam                            |
| DELETE | `/api/q08/exams/:id`                  | –      | Delete exam (no re-numbers next list)  |
| GET    | `/api/q09/comments`                   | –      | List comments                          |
| POST   | `/api/q09/comments`                   | –      | Post comment as Blend 285              |
| GET    | `/api/q10/questions`                  | –      | List exam questions                    |
| POST   | `/api/q10/submissions`                | –      | Submit answers → score persisted       |
| GET    | `/api/q10/submissions/:id`            | –      | Get one submission                     |

Response envelope (all endpoints):

```json
{ "success": true, "message": "...", "data": ... }
```

## Frontend routes

| Route                        | Page                       |
| ---------------------------- | -------------------------- |
| `/dashboard`                 | Module tile grid           |
| `/q01-person`                | Person CRUD                |
| `/q02-auth`                  | Login / Register           |
| `/q03-approval`              | Approval workflow          |
| `/q04-profile`               | Profile form               |
| `/q05-queue`                 | Queue ticket (3 screens)   |
| `/q06-barcode`               | Barcode product            |
| `/q07-qrcode`                | QR product                 |
| `/q08-exam-management`       | Exam mgmt (add/delete/list)|
| `/q09-comment`               | Comment box                |
| `/q10-exam`                  | Take exam                  |

## Engineering notes

* **Single envelope** — every endpoint returns `{ success, message, data }`. Frontend `ApiService<T>` mirrors this.
* **Module isolation** — each module owns its model, handler, routes, optional seed. `database.Migrate` and `router.New` are the only two places that list all modules.
* **Q05 concurrency** — `db.Transaction` + `clause.Locking{Strength: "UPDATE"}` selects the singleton state row with `FOR UPDATE`, so two simultaneous `POST /queue/next` calls serialize on the lock and produce strictly sequential tickets.
* **Q07 uniqueness** — DB has a `uniqueIndex` on `product_code` *and* the handler does a pre-check so the API returns 409 with a friendly message instead of a generic 500.
* **Q08 running number** — `no` is not stored; it's the 1-based index of the row in the sorted result set. Delete row 2 of 3 → list re-fetches and old row 3 now shows `no=2`.
* **Q10 scoring** — server is the source of truth for which answer is correct; client never sees `correct_answer` in `GET /q10/questions`.
* **Q02 JWT** — `RequireJWT` parses the `Authorization: Bearer …` header, validates HS256, and sets `user_id` + `username` on the gin context.
* **CORS** open `*` for dev — narrow it for production.
* **Frontend signals** — components prefer Angular 17 `signal()`/`computed()` for local state over RxJS subjects.

## Deploy to Google Cloud (Always Free)

See [`deploy/README.md`](deploy/README.md) for the full step-by-step.
TL;DR stack:

| Layer    | Service              | Cost                          |
| -------- | -------------------- | ----------------------------- |
| Frontend | Firebase Hosting     | Free (Spark plan)             |
| Backend  | Cloud Run            | Free (2M req + 360k GB-sec)   |
| Database | e2-micro VM + Postgres | Free (1 instance in us-*)   |

Quick deploy after one-time setup:

```bash
# Backend
gcloud run deploy itcc-backend --source ./backend --region us-central1 \
  --allow-unauthenticated --set-env-vars="DB_HOST=$VM_IP,DB_USER=itcc_app,..."

# Frontend (after editing environment.prod.ts with the Cloud Run URL)
cd frontend && npm run build && firebase deploy --only hosting
```

## License

Submitted as an interview deliverable. Code may be reused under MIT.
