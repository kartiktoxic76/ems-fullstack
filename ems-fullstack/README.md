# EMS — Employee Management System

A fullstack web app I built to manage employees, attendance, payroll, leaves and performance reviews. Built with Node.js + Express on the backend and plain HTML/JS on the frontend. MongoDB Atlas for the database.

> Live demo: https://ems-frontend-rho-pink.vercel.app

---

## What it does

- Login system with JWT (roles: employee, manager, hr, admin, ceo)
- Employee profiles with department, salary, contact info
- Attendance tracking with check-in/check-out
- Leave requests and approval workflow
- Monthly payroll with salary breakdown
- Performance reviews with ratings and goal tracking
- Audit log for all major actions

---

## Tech Stack

**Backend:** Node.js, Express, MongoDB + Mongoose, JWT, bcrypt, multer  
**Frontend:** HTML, CSS, Vanilla JS (single page app)  
**Hosting:** Render (backend) + Vercel (frontend)  
**DB:** MongoDB Atlas (free tier)

---

## Project Structure

```
ems-fullstack/
├── frontend/
│   └── index.html         # entire frontend SPA
└── backend/
    ├── server.js
    ├── seed.js            # run once to populate demo data
    ├── package.json
    ├── .env.example
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── User.js
    │   ├── Attendance.js
    │   ├── Leave.js
    │   ├── LeaveBalance.js
    │   ├── Payroll.js
    │   └── Performance.js
    ├── middleware/
    │   └── auth.js
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   ├── attendanceController.js
    │   ├── leaveController.js
    │   ├── payrollController.js
    │   ├── performanceController.js
    │   └── auditController.js
    └── routes/
        ├── auth.js
        ├── users.js
        ├── attendance.js
        ├── leaves.js
        ├── payroll.js
        ├── performance.js
        └── audit.js
```

---

## Setup

### 1. Clone

```bash
git clone https://github.com/kartiktoxic76/ems-fullstack.git
cd ems-fullstack/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env`

Copy the example and fill in your values:

```bash
cp .env.example .env
```

```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ems
JWT_SECRET=some_random_string_here
JWT_EXPIRES_IN=7d
PORT=5000
```

### 4. Seed demo data (optional)

```bash
node seed.js
```

This creates 7 demo users with attendance, payroll, leave and performance records.

Demo logins after seeding:
| Role | Email | Password |
|------|-------|----------|
| Employee | emp001@ems.com | Emp@2026 |
| Manager | mgr001@ems.com | Mgr@2026 |
| HR | hr001@ems.com | Hr@2026 |
| Admin | admin001@ems.com | Admin@2026 |
| CEO | ceo001@ems.com | Ceo@2026 |

### 5. Run backend

```bash
npm run dev
# or: node server.js
```

Backend starts on `http://localhost:5000`

### 6. Frontend

Just open `frontend/index.html` in browser — OR deploy to Vercel.

Make sure the `API_BASE` in `index.html` points to your backend URL.

---

## Deployment

**Backend → Render**
1. Connect your GitHub repo
2. Set root directory to `ems-fullstack/backend`
3. Add env vars in Render dashboard
4. Build command: `npm install`, Start: `node server.js`

**Frontend → Vercel**
1. Connect repo, set root to `ems-fullstack/frontend`
2. No build step needed (static file)
3. Update `API_BASE` in `index.html` to point to your Render URL

---

## Known Issues / TODO

- [ ] Profile photo upload size limit can be too small for some images
- [ ] Leave balance doesn't auto-reset on new year (manual for now)
- [ ] CORS is open (`*`) — should lock to frontend domain before production
- [ ] No email notifications on leave approve/reject yet
- [ ] Forgot password flow not implemented

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/login | No | Login |
| POST | /api/auth/signup | No | Register |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/users | Yes | List employees |
| POST | /api/attendance/checkin | Yes | Check in |
| GET | /api/leaves | Yes | List leaves |
| POST | /api/leaves | Yes | Apply for leave |
| GET | /api/payroll | Yes | Get payroll records |
| GET | /api/health | No | Health check |

---

Built by [@kartiktoxic76](https://github.com/kartiktoxic76)