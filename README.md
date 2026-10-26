# Career Expert Global Solutions – Learning Management System (LMS)

A modern, production-ready, SaaS-style Learning Management System engineered specifically around Career Expert Global Solutions' **6-month Freshers Growth Training Program**:

```
ASSESS → PERSONALIZE → LEARN → PRACTICE → ASSESS → BUILD → MENTOR → INTERVIEW → PLACEMENT → CERTIFY
```

---

## 🌟 Key Highlights & Architecture

- **Role-Based Access Control (RBAC)**: Strict segregation between **Candidate / Student**, **Trainer / Mentor**, and **Administrator**.
- **Database-Driven Curriculum**: Programs, Tracks, Months (1–6), Weeks (1–24), Modules, Lessons, Assessments, and Sprints are all dynamic entities stored in MongoDB.
- **Embedded Zero-Setup Database Fallback**: Built-in `MongoMemoryServer` fallback ensures the backend boots and seeds immediately on any workstation without requiring a pre-installed MongoDB daemon.
- **Interactive Assessment Engine**: Real-time timed assessments with auto-scoring across MCQs, multi-select, and conceptual questions with Recharts performance trends.
- **Kanban Agile Project Management**: Live Capstone sprints with drag-and-drop / click-state transition across `TODO`, `IN PROGRESS`, `REVIEW`, and `COMPLETED`.
- **4-Stage SWOT Development**: Structured matrix progression (`Initial SWOT` → `Month 2 Review` → `Month 4 Review` → `Final Review`) guided by technical mentors.
- **Public Certificate Verification**: Public route `/verify-certificate/:certificateId` for instant tamper-proof credential authentication by employers and recruiters.
- **Monthly Training Stipend Administration**: Records and disbursements for the organizational ₹15,000–₹18,000 monthly stipend.
- **Global Command Palette**: Instant navigation across curriculum, lessons, assessments, and students with keyboard shortcut `Ctrl + K`.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS with custom brand design system (Teal `#0d9488`, Navy `#0a2540`, Emerald, Amber)
- **State & Data**: TanStack Query & Zustand
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Weekly Score Trends, Track Distribution, Placement Funnel, Attendance)
- **Forms & Validation**: React Hook Form with Zod
- **Notifications**: Sonner

### Backend
- **Runtime**: Node.js & Express.js with TypeScript
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT, bcryptjs password hashing, role guards
- **Security**: Helmet, CORS, Express-Rate-Limit, structured logging, audit trails
- **Zero-Setup Database**: Embedded MongoDB Memory Server fallback

---

---

## 🔐 Role-Based Access Control & ID Architecture

The CEGS LMS implements an enterprise closed-loop enrollment model: **there is no public sign-up**. Every account is provisioned by an authorized person, and role portals are determined automatically by the authenticated server session:

| Role | Login ID Format | Provisioned By | Scope & Access Control |
|---|---|---|---|
| **System Administrator** | `ADM####` (e.g. `ADM0001`) | Server CLI script (`npm run create-admin`) | System-wide oversight; manages mentors; can reassign, reset passwords, or deactivate any mentor or student. |
| **Faculty Trainer / Mentor** | `MNTR####` (e.g. `MNTR0001`) | System Administrator via UI (`/admin/mentors`) | Faculty workspace; manages and mentors **their assigned students only**; conducts SWOT reviews, mock interviews, and attendance. |
| **Student / Candidate** | `STD####` (e.g. `STD0001`) | Assigned Mentor or Admin | Learning portal, roadmap, curriculum modules, assessments, sprints, portfolio, and stipend tracking. |

*Sample Verified Certificate ID for testing:* `CEGS-2025-FGT-0182`

---

## 🔑 Authentication, Onboarding & Security Workflow

### 1. Unified Credential Login
- Login form accepts either **Login ID** (`MNTR0001`, `STD0001`, `ADM0001`) or registered **Email address**.
- Identifiers are automatically normalized (IDs to uppercase, emails to lowercase).
- Brute-force protection: After 5 failed attempts (`MAX_LOGIN_ATTEMPTS`), the account is locked for 15 minutes (`LOCKOUT_MINUTES`, HTTP 423). Rate limiting applies per IP and per identifier.
- Equalized bcrypt timing dummy comparisons prevent username enumeration.

### 2. Auto-Generated Temporary Passwords
- Passwords are never typed during account creation.
- The server generates a cryptographically secure 12-character password (e.g. `Kx7m-Pq4R-t9Wz`) with upper, lower, digit, and no ambiguous characters (`0/O/1/l/I`).
- Displayed **exactly once** in a secure `CredentialsModal` with copy, print, and slip download features (`Cache-Control: no-store`).

### 3. Forced Password Change on First Login
- Newly enrolled users receive `mustChangePassword: true`.
- On first login, all protected routes return `403 PASSWORD_CHANGE_REQUIRED`.
- The user is redirected to `/change-password` with live security requirement validation:
  - Minimum 10 characters, maximum 72 characters.
  - Must include uppercase, lowercase, and a number.
  - Must not contain the user's ID, name parts, or email local-part.
  - Must not match common passwords or the current temporary password.
- Upon password change, a fresh token pair is issued and students are routed to `/onboarding`.

### 4. Account Recovery Protocol
There are no unauthenticated public email reset links. Credential recovery follows the organizational hierarchy:
- **Student**: Requests their assigned mentor to trigger a password reset.
- **Mentor**: Requests the system administrator to trigger a password reset via `/admin/mentors`.
- **Administrator**: Uses the server CLI tool (`npm run create-admin -- --reset`).

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- Node.js >= 18 (Tested on v26)
- npm >= 9

### 2. Installation
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
cd ..
```

### 3. Environment Variables Configuration

Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`.

#### **`server/.env` variables:**
| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Backend HTTP listening port | `5000` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| `MONGODB_URI` | MongoDB Atlas or local connection string | `mongodb+srv://...` |
| `USE_MEMORY_DB` | Set `true` to use embedded in-memory MongoDB | `false` |
| `SEED_ON_START` | Automatically seed curriculum data on server start | `true` |
| `SEED_DEMO_DATA` | Seed mock users (development only; never in prod) | `false` |
| `CLIENT_URL` | Allowed origin for frontend application | `http://localhost:5173` |
| `JWT_SECRET` | Secret key for access tokens (min 32 characters) | *(random string)* |
| `JWT_REFRESH_SECRET` | Distinct secret key for refresh tokens (min 32 chars) | *(random string)* |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifespan | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifespan | `7d` |
| `COOKIE_SECURE` | Set cookie Secure flag (required `true` on HTTPS) | `false` (dev) / `true` (prod) |
| `COOKIE_SAMESITE` | Cookie SameSite attribute (`lax`, `strict`, `none`) | `lax` |
| `MAX_LOGIN_ATTEMPTS` | Number of failed login attempts before lockout | `5` |
| `LOCKOUT_MINUTES` | Account lockout duration in minutes | `15` |
| `BCRYPT_ROUNDS` | Password hashing salt cost rounds | `12` |

#### **Cross-Domain Cookie & CORS Configuration:**
When the frontend and backend are hosted on different domains or subdomains in production (e.g., `app.domain.com` and `api.domain.com`):
```env
CLIENT_URL=https://app.yourdomain.com
COOKIE_SAMESITE=none
COOKIE_SECURE=true
```

#### **`client/.env` variables:**
- `VITE_API_URL`: Backend API base URL (e.g., `http://localhost:5000/api`).

---

## 🛠️ CLI Operations & Administrative Tools

### 1. Creating the First Administrator (`npm run create-admin`)
Because admin accounts cannot be created via the API or frontend, run the secure interactive CLI command:
```bash
npm run create-admin
```
- Prompts for name, email, and password in terminal (password entry hidden).
- You can also provide variables directly:
  `ADMIN_NAME="Admin" ADMIN_EMAIL="admin@cegs.com" ADMIN_PASSWORD="StrongPassword123#" npm run create-admin`
- To reset an existing admin's password and revoke all sessions:
  ```bash
  npm run create-admin -- --reset
  ```

### 2. Legacy Database Migration (`npm run auth:migrate`)
To upgrade existing databases to the new authentication and sequential ID architecture:
```bash
npm run auth:migrate
```
- **Idempotent**: Assigns missing `MNTR####`, `STD####`, and `ADM####` IDs in order of account creation.
- Synchronizes sequence counters (`Counter` collection) so future IDs continue seamlessly.
- Sets `mustChangePassword=true` for all non-admin accounts.
- Rotates legacy default passwords (e.g. `Password123!`) to cryptographically secure random passwords.
- Outputs the newly generated credentials into a gitignored file: `server/credentials-migration-<timestamp>.csv`.

### 3. Running E2E Access Control Tests (`npm run e2e`)
Runs the comprehensive 25-scenario end-to-end test suite against an isolated in-memory database without modifying Atlas:
```bash
npm run e2e
```

---

## 📁 Repository Structure

```
cegs-lms/
├── server/
│   ├── src/
│   │   ├── config/             # DB & Typed Environment configuration
│   │   ├── controllers/        # Thin controllers for all modules
│   │   ├── middleware/         # Auth, RBAC, ErrorHandler, AuditLogger
│   │   ├── models/             # Mongoose schemas (User, Profiles, Curriculum, etc.)
│   │   ├── routes/             # REST endpoint routers
│   │   ├── scripts/seed.ts     # Realistic educational dataset seeder
│   │   └── index.ts            # Express server entry point
│   ├── package.json
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, CommandPalette, Layouts
│   │   ├── features/           # Modular domain features:
│   │   │   ├── dashboard/      # Student Dashboard & roadmap
│   │   │   ├── learning/       # Lesson viewer & curriculum navigator
│   │   │   ├── assessments/    # Assessment Engine & Recharts trends
│   │   │   ├── attendance/     # Daily check-in & calendar history
│   │   │   ├── mentorship/     # 1-on-1 sessions & 4-stage SWOT matrix
│   │   │   ├── projects/       # Kanban sprint task board
│   │   │   ├── interviews/     # Mock interviews & scoring rubrics
│   │   │   ├── placement/      # Job opportunities, interviews & offers
│   │   │   ├── certificates/   # Diploma view & credential issuance
│   │   │   ├── stipend/        # Monthly ₹15,000–₹18,000 disbursement tracking
│   │   │   ├── calendar/       # Masterclasses & live agenda
│   │   │   ├── messaging/      # In-app mentor/student messaging
│   │   │   ├── notifications/  # Announcement center
│   │   │   ├── profile/        # Career portfolio & skill matrix
│   │   │   ├── mentor/         # Mentor command center & candidate drawer
│   │   │   └── admin/          # Admin dashboard, students, reports, audit logs
│   │   ├── pages/              # LandingPage, LoginPage, VerifyCertificatePage
│   │   ├── routes/             # AppRoutes & ProtectedRoute (RBAC)
│   │   ├── services/           # Typed Axios API client
│   │   └── store/              # Zustand authentication store
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── package.json
└── README.md
```

---

## 📚 6-Month Program Curriculum Map

- **Month 1: Foundations**
  - Week 1 – Orientation & Baseline Diagnostic Assessment
  - Week 2 – Personalized Learning Path & Problem Solving
  - Week 3 – Track Fundamentals (React & TypeScript Architecture)
  - Week 4 – Foundational Assessment & Individualized Review
- **Month 2: Communication & Personality Development**
  - Week 5 – Professional Communication & Workplace Articulation
  - Week 6 – Personality Development, Virtual Poise & Body Language
  - Week 7 – SWOT Analysis & Mentorship Deep Dive
  - Week 8 – Behavioral & HR Mock Interview Loop
- **Month 3: Core Technical Training**
  - Week 9 – Node.js Runtime Architecture, Event Loop & Streams
  - Week 10 – MongoDB Schema Design, Indexing & Aggregations
  - Week 11 – Advanced Security: JWT Token Rotation, RBAC & Cookies
  - Week 12 – Technical Milestone Assessment
- **Month 4: Live Projects & Early Interviews**
  - Week 13 – Live Capstone Project Kickoff & Domain Architecture
  - Week 14 – Development Sprint 1 (Authentication & Multi-Tenant Routing)
  - Week 15 – Development Sprint 2 (Candidate Pipeline Kanban & Code Reviews)
  - Week 16 – First Corporate Screening Interview Cycle
- **Month 5: Interview Preparation & Placement Drives**
  - Week 17 – Intensive System Design & Scalability Preparation
  - Week 18 – Placement Drive Round 1 (Enterprise Partner Hiring)
  - Week 19 – Live Capstone Deployment & Cloud Stress Testing
  - Week 20 – Placement Readiness & Compensation Offer Negotiation
- **Month 6: Placement Drive & Job-Ready Certification**
  - Week 21 – Final Corporate Placement Drives & Executive Panels
  - Week 22 – Offer Evaluation & First 90 Days Onboarding Transition
  - Week 23 – Exit Technical Assessment & Portfolio Review
  - Week 24 – Certification Ceremony & Alumni Network Induction

---

## 🔒 Security & Verification Guarantees

1. **Authentication**: All sensitive routes enforce JWT bearer verification with database account status validation.
2. **Audit Logging**: Sensitive events (student creation, score recording, attendance modification, certificate issuance, offer acceptance) are recorded immutably in MongoDB.
3. **Public Credential Verification**: Certificates carry tamper-resistant IDs that are authenticated directly against database records on `/verify-certificate/:certificateId`.
