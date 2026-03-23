// backend/server.js
require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');

// ── Connect to MongoDB ─────────────────────────────────────
connectDB();

// ── Register AuditLog model (defined inline in Performance.js) ─
require('./models/Performance');

const app = express();

// ── Middleware ─────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json({ limit: '5mb' }));   // 5 MB allows base64 photos
app.use(express.urlencoded({ extended: true }));

// ── Health check ───────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: new Date() }));

// ── API Routes ─────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/users',       require('./routes/users'));
app.use('/api/attendance',  require('./routes/attendance'));
app.use('/api/leaves',      require('./routes/leaves'));
app.use('/api/payroll',     require('./routes/payroll'));
app.use('/api/performance', require('./routes/performance'));
app.use('/api/audit',       require('./routes/audit'));

// ── Global error handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

// ── 404 ───────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Start ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 EMS API running on port ${PORT}`));
