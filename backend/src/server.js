const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');
const { seedDatabase } = require('./utils/seed');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.warn('[Config] JWT_SECRET is missing. Using a development-only secret.');
  process.env.JWT_SECRET = 'inflationwise_dev_only_change_me';
}

const app = express();
const rawAllowed = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5001'
].filter(Boolean).join(',');

const allowedOrigins = rawAllowed
  .split(',')
  .map((s) => s.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser requests (e.g. curl, mobile, Postman, health checks)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.trim().replace(/\/+$/, '');

    // Allow configured origins
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    // Allow any localhost / 127.0.0.1 ports for local development/testing
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) {
      return callback(null, true);
    }

    // Allow Vercel deployments (production domain & preview deployments)
    if (/^https:\/\/([a-zA-Z0-9_-]+\.)?vercel\.app$/.test(cleanOrigin)) {
      return callback(null, true);
    }

    // Allow Render deployments
    if (/^https:\/\/([a-zA-Z0-9_-]+\.)?onrender\.com$/.test(cleanOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'HEALTHY', system: 'InflationWise', timestamp: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/financial', require('./routes/financialRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/savings', require('./routes/savingsRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
const chatbotRoutes = require('./routes/chatbotRoutes');
app.use('/api/chatbot', chatbotRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(async (conn) => {
    if (conn) {
      await seedDatabase();
    } else {
      console.error('[MongoDB] APIs need a database connection.');
    }
    const server = app.listen(PORT, () => {
      console.log(`InflationWise backend running on http://localhost:${PORT}`);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[Server Error] Port ${PORT} is already in use by another process. Please close it and restart.`);
      } else {
        console.error(`[Server Error] ${err.message}`);
      }
      process.exit(1);
    });
  }).catch((err) => {
    console.error(`[Server Fatal Error] Failed to initialize server: ${err.message}`);
    process.exit(1);
  });
}
module.exports = app;

