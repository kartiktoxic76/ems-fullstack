require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');

connectDB();
require('./models/Performance');

const app = express();

app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: new Date() }));

// Load routes with error catching
const routeFiles = [
  { path: '/api/auth',        file: './routes/auth' },
  { path: '/api/users',       file: './routes/users' },
  { path: '/api/attendance',  file: './routes/attendance' },
  { path: '/api/leaves',      file: './routes/leaves' },
  { path: '/api/payroll',     file: './routes/payroll' },
  { path: '/api/performance', file: './routes/performance' },
  { path: '/api/audit',       file: './routes/audit' },
];

routeFiles.forEach(({ path, file }) => {
  try {
    app.use(path, require(file));
    console.log('✅ Route loaded:', path);
  } catch(e) {
    console.error('❌ Failed to load route:', path, e.message);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 EMS API running on port ${PORT}`));