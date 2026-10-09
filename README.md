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

## 🔐 Demo Credentials

Quick 1-click login buttons are available directly on the login page:

| Role | Email | Password |
|---|---|---|
| **Student / Candidate** | `student@careerexpertglobal.com` | `Password123!` |
| **Trainer / Mentor** | `mentor@careerexpertglobal.com` | `Password123!` |
| **Administrator** | `admin@careerexpertglobal.com` | `Password123!` |

*Sample Verified Certificate ID for testing:* `CEGS-2025-FGT-0182`

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

### 3. Environment Variables
The server requires a persistent MongoDB database. The in-memory database fallback is disabled by default.
Copy `server/.env.example` to `server/.env` and configure your environment:

`server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=PASTE_YOUR_MONGODB_CONNECTION_STRING_HERE
USE_MEMORY_DB=false
SEED_ON_START=true
JWT_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_STRING
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**MongoDB Setup Instructions:**
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (or use a local instance).
2. If using Atlas, ensure your current IP address is whitelisted under **Network Access**.
3. Create a database user and password.
4. Get your connection string (e.g., `mongodb+srv://<user>:<password>@cluster...`) and paste it into `MONGODB_URI` in `server/.env`.

### 4. Running the Development Servers
```bash
# Run server
cd server && npm run dev

# In another terminal, run client
cd client && npm run dev
```

- **Frontend URL**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **API Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

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
