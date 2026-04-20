require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// connect to mongo first
connectDB();

// need to register Performance model early because it also registers AuditLog
// ran into issues before where audit routes broke without this
require('./models/Performance');

const app = express();

// cors - keeping it open for now, will lock down origins before prod
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '5mb' })); // 5mb for profile photos (base64)
app.use(express.urlencoded({ extended: true }));

// quick health check endpoint - useful for render.com free tier ping
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date() });
});

// loading routes this way so a single broken route doesnt crash the whole server
// had that problem in dev, took me a while to debug
const routes = [
  { path: '/api/auth',        file: './routes/auth' },
  { path: '/api/users',       file: './routes/users' },
  { path: '/api/attendance',  file: './routes/attendance' },
  { path: '/api/leaves',      file: './routes/leaves' },
  { path: '/api/payroll',     file: './routes/payroll' },
  { path: '/api/performance', file: './routes/performance' },
  { path: '/api/audit',       file: './routes/audit' },
];

routes.forEach(({ path, file }) => {
  try {
    app.use(path, require(file));
    console.log('route ok:', path);
  } catch (err) {
    console.error('route failed:', path, '-', err.message);
  }
});

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'something went wrong' });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'route not found' });
});

const PORT = process.env.PORT || 5000;
// using 5000 because 3000 was conflicting with my react project locally
app.listen(PORT, () => console.log(`server running on port ${PORT}`));