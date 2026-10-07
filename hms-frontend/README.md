# MediCore — Hospital Management System (Frontend)

React 18 + TypeScript + Tailwind CSS + Vite, built against your Spring Boot HMS backend.

## What's included
- **Auth**: login/register pages, JWT stored in `localStorage`, auto-attached to every request, auto-redirect to `/login` on a 401
- **Dashboard**: summary counts (patients, doctors, scheduled appointments) + recent appointments
- **Patients**: list, search, create, edit, delete
- **Doctors**: list, create, edit, delete
- **Appointments**: book, change status (Scheduled/Completed/Cancelled/Rescheduled), cancel
- Role-aware sidebar navigation (nav items are hidden per the same roles your backend's `SecurityConfig` enforces — this is a UI convenience, not a security boundary; the backend is still the real gatekeeper)

## Setup
1. Make sure your Spring Boot backend is running on `http://localhost:8080` (see the backend README).
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the env file and adjust if your backend runs elsewhere:
   ```
   cp .env.example .env
   ```
4. Run the dev server:
   ```
   npm run dev
   ```
5. Open `http://localhost:5173`.

## First use
1. Go to `/register`, create an account with role `ADMIN` (or any role — `ADMIN` sees everything).
2. You're logged in automatically after registering.
3. Add a doctor, add a patient, then book an appointment between them.

## Notes
- CORS: your backend's `SecurityConfig` already allows `http://localhost:5173` — no changes needed there.
- If you rename your backend's Maven artifact/package (as you did, to `HealthcareSystem_Backend`), nothing here needs to change — the frontend only talks to it over HTTP via `VITE_API_BASE_URL`.
- Build for production with `npm run build`; output lands in `dist/`.

## Not yet built (left for you to extend, following the same pattern as Patients/Doctors/Appointments)
- Billing, Pharmacy, Laboratory, Staff screens — your backend's `SecurityConfig` already has routes reserved for these (`/api/billing/**`, `/api/pharmacy/**`, `/api/lab/**`, `/api/staff/**`); once you build those backend modules, add a matching page + `api/endpoints.ts` entry + sidebar nav item here.
- Pagination (fine for now since lists are small; add once patient counts grow).
- A dedicated patient detail page showing appointment history per patient.
