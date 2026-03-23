# EMS — Employee Management System
## Fullstack Deployment Guide

---

## Project Structure

```
ems-fullstack/
├── frontend/
│   └── index.html              ← Modified HTML (calls real API)
└── backend/
    ├── server.js               ← Express app entry point
    ├── seed.js                 ← Insert demo data into MongoDB
    ├── package.json
    ├── .env.example            ← Copy to .env and fill in values
    ├── config/
    │   └── db.js               ← MongoDB connection
    ├── models/
    │   ├── User.js
    │   ├── Attendance.js
    │   ├── Leave.js
    │   ├── LeaveBalance.js
    │   ├── Payroll.js
    │   └── Performance.js      ← Also registers AuditLog model
    ├── middleware/
    │   └── auth.js             ← JWT verify + role guard
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

## STEP 1 — Prerequisites

Install these on your computer:
- **Node.js** v18+ → https://nodejs.org
- **MongoDB Community** → https://www.mongodb.com/try/download/community
  OR use **MongoDB Atlas** (free cloud DB, no install needed)

---

## STEP 2 — Backend Setup

```bash
cd ems-fullstack/backend

# Install all dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ems
JWT_SECRET=replace_with_a_long_random_string_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

> To generate a strong JWT_SECRET, run:
> `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## STEP 3 — Start MongoDB & Seed Data

**Option A — Local MongoDB:**
```bash
# Start MongoDB (in a separate terminal)
mongod

# Seed demo data (run only once!)
node seed.js
```

**Option B — MongoDB Atlas (recommended for deployment):**
1. Go to https://cloud.mongodb.com → Create free cluster
2. Click "Connect" → get your connection string
3. Set MONGO_URI in .env to: `mongodb+srv://username:password@cluster.mongodb.net/ems`
4. Run: `node seed.js`

---

## STEP 4 — Start Backend

```bash
# Development (auto-restart on changes)
npm run dev

# OR Production
npm start
```

You should see:
```
✅ MongoDB connected: localhost
🚀 EMS API running on port 5000
```

Test it: open http://localhost:5000/api/health in your browser.

---

## STEP 5 — Configure Frontend

Open `frontend/index.html` and find this line near the top of the `<script>` block:

```javascript
const API_BASE = 'http://localhost:5000/api';
```

- For **local development**: keep it as `http://localhost:5000/api`
- For **production deployment**: change to your deployed backend URL, e.g.:
  `const API_BASE = 'https://ems-api.onrender.com/api';`

---

## STEP 6 — Run Frontend

```bash
# Simple option — just open in browser:
open frontend/index.html

# OR serve it properly:
npx serve frontend/
# Then open http://localhost:3000
```

---

## STEP 7 — Login & Test

Use these demo credentials:

| Role     | Email               | Password    |
|----------|---------------------|-------------|
| Employee | emp001@ems.com      | Emp@2026    |
| Manager  | mgr001@ems.com      | Mgr@2026    |
| HR       | hr001@ems.com       | Hr@2026     |
| Admin    | admin001@ems.com    | Admin@2026  |
| CEO      | ceo001@ems.com      | Ceo@2026    |

---

## STEP 8 — Deploy to Production

### Option A: Render.com (Free, Easiest)

**Backend:**
1. Push your entire project to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Environment Variables → Add all from your `.env`
6. Click Deploy

**Frontend:**
1. Render → New → Static Site
2. Connect same repo
3. Root Directory: `frontend`
4. Build Command: (leave empty)
5. Publish Directory: `.`
6. Update `API_BASE` in `index.html` to your Render backend URL

### Option B: Railway.app

1. https://railway.app → New Project → Deploy from GitHub
2. Add MongoDB plugin (or use Atlas connection string)
3. Add env vars in the Railway dashboard
4. For frontend: use Vercel (drag-drop `frontend/` folder)

### Option C: Hostinger / VPS

```bash
# On server
git clone https://github.com/youruser/ems-fullstack.git
cd ems-fullstack/backend
npm install
cp .env.example .env
nano .env  # Fill in production values

# Install PM2 (keeps Node running)
npm install -g pm2
pm2 start server.js --name ems-api
pm2 save
pm2 startup

# Install nginx for frontend + reverse proxy
sudo apt install nginx
# Copy frontend/index.html to /var/www/html/
# Configure nginx to proxy /api to localhost:5000
```

---

## API Reference

| Method | Endpoint                  | Auth   | Description            |
|--------|---------------------------|--------|------------------------|
| POST   | /api/auth/login           | None   | Login                  |
| POST   | /api/auth/signup          | None   | Register               |
| GET    | /api/auth/me              | Token  | Get current user       |
| GET    | /api/users                | Token  | List employees         |
| POST   | /api/users                | HR     | Create employee        |
| PUT    | /api/users/:id            | Token  | Update profile         |
| GET    | /api/attendance/today     | Token  | Today's record         |
| GET    | /api/attendance/my        | Token  | My records             |
| POST   | /api/attendance/checkin   | Token  | Check in/out           |
| GET    | /api/leaves/my            | Token  | My leaves              |
| GET    | /api/leaves/balance       | Token  | Leave balances         |
| POST   | /api/leaves/apply         | Token  | Apply for leave        |
| GET    | /api/leaves/pending       | Mgr+   | Pending approvals      |
| PUT    | /api/leaves/:id/approve   | Mgr+   | Approve leave          |
| PUT    | /api/leaves/:id/reject    | Mgr+   | Reject leave           |
| GET    | /api/payroll/my           | Token  | My payslips            |
| GET    | /api/payroll/all          | HR+    | All payroll            |
| POST   | /api/payroll/run          | HR     | Generate payroll       |
| GET    | /api/performance/my       | Token  | My reviews             |
| POST   | /api/performance          | Mgr+   | Create review          |
| GET    | /api/audit                | Admin  | Audit logs             |

---

## Troubleshooting

**CORS errors?**
→ Make sure `CLIENT_URL` in `.env` matches exactly where your frontend is served from.

**MongoDB connection failed?**
→ Check `MONGO_URI` in `.env`. For Atlas, whitelist your IP in Network Access.

**Token expired / 401 errors?**
→ User needs to log in again. Increase `JWT_EXPIRES_IN` if needed.

**Seed data not showing?**
→ Make sure you ran `node seed.js` after starting MongoDB.
