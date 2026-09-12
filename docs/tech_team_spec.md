# Rotaract District 3011 Platform — Technical Architecture & Team Specification

**Target Audience:** Technical Team, DevOps, Lead Developers, and District Webmasters  
**Version:** 2.0 (Production Release)  
**District:** Rotaract District 3011 (Delhi NCR, Haryana, India)  
**Security Classification:** District Internal — No Production Secrets or Passwords Included

---

## 1. System Overview & Architecture

The Rotaract District 3011 platform is an enterprise multi-tenant portal and public surface serving **90+ Rotaract clubs**, **4,000+ members**, and **4 geographic zones (Prithvi, Agni, Vayu, Akash)** across Delhi NCR.

```
                  ┌──────────────────────────────────────────────┐
                  │                 Cloudflare                   │
                  │   DNS / CDN Edge / WAF / SSL Termination     │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │             Nginx Reverse Proxy              │
                  │  Port 80/443 -> SSL -> Proxying to Services │
                  └──────────────┬────────────────┬──────────────┘
                                 │                │
          ┌──────────────────────┴──────┐  ┌──────┴──────────────────────┐
          │     Frontend (Vite / React) │  │       Backend (NestJS)      │
          │  Container: rotaract-web    │  │   Container: rotaract-api   │
          │  Port: 3000 (Internal)      │  │   Port: 4000 (Internal)     │
          └─────────────────────────────┘  └──────────────┬──────────────┘
                                                          │
                                         ┌────────────────┴──────────────┐
                                         │                               │
                                         ▼                               ▼
                  ┌──────────────────────────────┐  ┌──────────────────────────────┐
                  │       PostgreSQL 16          │  │       Redis 7 + BullMQ       │
                  │  Prisma ORM with Migrations  │  │  Async Jobs, Cache & Events  │
                  └──────────────────────────────┘  └──────────────────────────────┘
```

---

## 2. Core Technology Stack

### Frontend Application (`rac3011-web`)
* **Framework & Tooling:** React 19, TypeScript 5.8, Vite 6.x
* **Routing & State Management:** React Router 7, TanStack React Query v5
* **Styling & UI Tokens:** Tailwind CSS v4, CSS Custom Properties Design Tokens, Lucide Icons, Canvas GPU Shaders
* **Rich Visual Components:** Interactive Leaflet GIS Maps, GPU-accelerated Rotary Wheel, Snap Section Layouts
* **Build & Validation:** Vitest, React Testing Library, ESLint, Prettier

### Backend API (`rac3011-api`)
* **Framework:** NestJS 11 (Modular Monolith architecture with Dependency Injection)
* **Language & Runtime:** TypeScript, Node.js 22 LTS
* **Database & ORM:** PostgreSQL 16, Prisma ORM with strict referential integrity
* **Message Queue & Caching:** Redis 7, BullMQ for asynchronous worker tasks (Site Rebuild, Email Dispatch, Point Recomputations)
* **Authentication:** Custom JWT Bearer sessions, cryptographically secure OTP tokens, PBKDF2/Argon2 password hashing
* **Storage Layer:** Cloudflare R2 / S3-compatible object storage with signed upload grants and MIME/size tier limits:
  * `permanent`: 5 MB (Avatars, Club Logos, Showcase Media)
  * `dynamic`: 10 MB (Flyers, Event Banners, Attachments)
  * `private`: 25 MB (Monthly Reports, Financial Invoices, Audit Proofs)

---

## 3. Role-Based Access Control (RBAC) & Permissions Breakdown

The platform enforces a granular, 39-key permission matrix across three distinct scopes:
1. `district` (Global District-wide access)
2. `zone` (Zonal access across assigned clubs)
3. `club` (Access restricted strictly to caller's own chartered club)

### Complete Permission Registry

| Domain | Permission Key | Scopes | Description & Usage |
| :--- | :--- | :--- | :--- |
| **Auth & Users** | `roles:manage` | district | Create admin accounts, grant roles, assign permissions, reset user credentials |
| | `roles:view` | district | View directory of administrative users and assigned role mappings |
| **Club Members** | `members:view` | club, district | View approved roster, member details, and skill tags |
| | `members:approve` | club, district | Approve pending member registrations, suspend accounts, and manage passwords |
| | `directory:view` | district | Access the cross-district opt-in member professional directory |
| **Monthly Reports**| `reports:submit` | club | Draft, edit, and submit monthly club performance reports |
| | `reports:view` | club, district | View submitted reports and download official PDF/CSV copies |
| | `reports:review` | district | Send secretariat queries/questions on submitted club reports |
| | `reports:score` | district | Award verified district points and publish monthly scores |
| | `reports:schema` | district | Configure report questions, dynamic form fields, and validation rules |
| **Points & Scores**| `points:view` | club, district | View live leaderboard, points breakdown, and historical standings |
| | `points:manage` | district | Adjust bonus points, penalties, and configure point weight formulas |
| **Rotaract Showcase**| `showcase:submit` | club, district | Submit club projects, photos, and community stories for showcase |
| | `showcase:publish`| district | Review, edit, approve, reject, feature, or delete showcase stories |
| **Events & Calendar**| `events:create` | club, district | Create club or district events with RSVP capacity |
| | `events:manage` | club, district | Edit event timings, venue, RSVP limits, banners, or cancel events |
| **Announcements** | `announcements:publish` | district | Send targeted multi-channel broadcast announcements to clubs/roles |
| **Public Content** | `content:manage` | district | Live CMS for home banners, roadmap pillars, achievements, and statistics |
| **Audit & Security** | `audit:view` | district | View immutable chronological security logs of all system operations |

---

## 4. Proposed Technical Team Access Model

To ensure smooth operation without granting destructive powers to unverified accounts, the technical team has the following recommended role distribution:

### Role: `superadmin` (Chief Technical Officers / Lead Engineers)
* **Access Level:** Unrestricted `isSuperAdmin = true`.
* **Capabilities:** Full system bypass, server management, DB migrations, emergency tenant impersonation, production deployment controls.

### Role: `tech_webmaster` (District Webmasters & Frontend Engineers)
* **Assigned Permissions:**
  * `content:manage` (District CMS & Hero Updates)
  * `showcase:publish` (Project Showcase Curation)
  * `events:manage` (District Calendar Sync)
  * `announcements:publish` (Technical Maintenance Alerts)
  * `roles:view` (User Directory Inspection)

### Role: `tech_support` (Support & User Administration Team)
* **Assigned Permissions:**
  * `roles:manage` (Password resets, Member login issue resolution)
  * `members:view` & `members:approve` (Membership verification)
  * `audit:view` (Investigating failed logins and action history)

---

## 5. Deployment, Container Management & Monitoring

### Production Server Specifications
* **Host:** `ubuntu@140.245.6.54` (Oracle Cloud Infrastructure / High-Availability VPS)
* **Container Orchestration:** Docker Compose
* **Container Fleet:**
  1. `rotaract-web` (Frontend Web Server)
  2. `rotaract-api` (NestJS REST API)
  3. `rotaract-api-worker` (BullMQ Asynchronous Job Processor)
  4. `rotaract-db` (PostgreSQL 16 Relational Database)
  5. `rotaract-redis` (Redis Cache & Queue Broker)

### Automated Deployment Script
To deploy new commits from `main` to live production:
```bash
/home/ubuntu/deploy_all.sh
```
The deploy script pulls latest git changes, executes Prisma migrations, builds production bundles, performs zero-downtime container restarts, and verifies health status at `https://testing.rotaract3011.org/api/health`.
