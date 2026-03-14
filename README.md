# Medical Consultation Platform MVP (Phase 1)

This repository contains a production-structured MVP for a medical consultation platform using:

- Backend: Node.js + Express + Prisma + Neon PostgreSQL
- Frontend: React + Vite + Axios + React Router
- Auth: JWT
- Validation: Zod
- Password hashing: bcrypt

## Project Tree

```text
.
|-- client/
|   |-- .env.example
|   |-- index.html
|   |-- package.json
|   |-- vite.config.js
|   `-- src/
|       |-- api/
|       |-- app/
|       |-- components/
|       |   |-- forms/
|       |   |-- shared/
|       |   `-- ui/
|       |-- features/
|       |   |-- admin/
|       |   |-- appointments/
|       |   |-- auth/
|       |   |-- consultations/
|       |   |-- doctors/
|       |   |-- patients/
|       |   `-- posts/
|       |-- hooks/
|       |-- layouts/
|       |-- pages/
|       `-- utils/
|-- server/
|   |-- .env.example
|   |-- package.json
|   |-- prisma/
|   |   |-- schema.prisma
|   |   `-- seed.js
|   `-- src/
|       |-- app.js
|       |-- server.js
|       |-- config/
|       |   |-- db.js
|       |   `-- env.js
|       |-- core/
|       |   |-- base/
|       |   |-- errors/
|       |   |-- middlewares/
|       |   `-- utils/
|       |-- modules/
|       |   |-- admin/
|       |   |-- appointments/
|       |   |-- auth/
|       |   |-- consultations/
|       |   |-- doctors/
|       |   |-- patients/
|       |   |-- posts/
|       |   `-- users/
|       `-- routes/
`-- README.md
```

## Database Schema (Prisma)

Defined in:

- `server/prisma/schema.prisma`

Includes:

- User (`ADMIN`, `DOCTOR`, `PATIENT`) with status
- PatientProfile (1:1 User)
- DoctorProfile (1:1 User) with `isVerified` + `approvalStatus`
- Post (DoctorProfile 1:N Posts)
- Consultation (PatientProfile 1:N, DoctorProfile 1:N)
- Appointment (PatientProfile 1:N, DoctorProfile 1:N)

## Backend API Base

- `/api/v1`

Main route groups:

- `/auth`
- `/users`
- `/doctors`
- `/patients`
- `/posts`
- `/consultations`
- `/appointments`
- `/admin`

## Run Instructions

### 1) Backend

```bash
cd server
npm install
cp .env.example .env
# Fill DATABASE_URL, JWT_SECRET, and admin seed values
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

### 2) Frontend

```bash
cd client
npm install
cp .env.example .env
# Optionally change VITE_API_BASE_URL
npm run dev
```

## Environment Variables

### Backend (`server/.env`)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
ADMIN_EMAIL=admin@medplatform.com
ADMIN_PASSWORD=Admin123!
ADMIN_FULL_NAME=System Admin
```

### Frontend (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Notes

- Controllers are intentionally thin.
- Business logic is in services.
- Database logic is in repositories.
- Shared behaviors are in base classes and core utilities/middlewares.
