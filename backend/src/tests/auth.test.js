process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_12345';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const axios = require('axios');
const mongoose = require('mongoose');
const app = require('../server');
const { connectDB } = require('../config/database');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');

let server;
let client;
let testToken = '';
let testUserId = '';

before(async () => {
  await connectDB();

  await new Promise((resolve) => {
    server = http.createServer(app).listen(0, () => {
      const port = server.address().port;
      client = axios.create({
        baseURL: `http://127.0.0.1:${port}/api`,
        validateStatus: () => true, // allow any HTTP status code
      });
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  } catch {
    /* ignore disconnect error */
  }
  setTimeout(() => process.exit(0), 200);
});

describe('Task 1: Registration and Login Reliability', () => {
  const testEmail = `user_${Date.now()}@example.com`;
  const testPassword = 'Password@123';

  it('should register a new user successfully', async () => {
    const res = await client.post('/auth/register', {
      name: 'Priya Sharma',
      email: testEmail,
      mobile: '9876543210',
      password: testPassword,
      confirmPassword: testPassword,
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.message, 'Account created successfully!');

    const saved = await User.findOne({ email: testEmail });
    assert(saved, 'User must exist in MongoDB');
    assert.strictEqual(saved.name, 'Priya Sharma');
  });

  it('should reject duplicate email registration with clear error', async () => {
    const res = await client.post('/auth/register', {
      name: 'Duplicate Account',
      email: testEmail,
      mobile: '9876543210',
      password: testPassword,
      confirmPassword: testPassword,
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /already exists/i);
  });

  it('should reject registration with invalid email or weak password', async () => {
    const res1 = await client.post('/auth/register', {
      name: 'Priya',
      email: 'not-an-email',
      mobile: '9876543210',
      password: testPassword,
      confirmPassword: testPassword,
    });
    assert.strictEqual(res1.status, 400);

    const res2 = await client.post('/auth/register', {
      name: 'Priya',
      email: 'valid@example.com',
      mobile: '9876543210',
      password: 'short',
      confirmPassword: 'short',
    });
    assert.strictEqual(res2.status, 400);
    assert.strictEqual(res2.data.success, false);
  });

  it('should log in successfully with valid credentials', async () => {
    const res = await client.post('/auth/login', {
      email: testEmail,
      password: testPassword,
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert(res.data.token, 'Auth token must be returned');
    assert.strictEqual(res.data.user.email, testEmail);

    testToken = res.data.token;
    testUserId = res.data.user.id;
  });

  it('should reject login with incorrect password', async () => {
    const res = await client.post('/auth/login', {
      email: testEmail,
      password: 'WrongPassword@999',
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /incorrect/i);
  });
});

describe('Task 4: Financial Goal Date Validation', () => {
  it('should reject a goal submission with a past target date', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pastDateStr = yesterday.toISOString().split('T')[0];

    const res = await client.post(
      '/goals',
      {
        goalName: 'Past Goal Test',
        goalCategory: 'House',
        currentCost: 1000000,
        inflationRate: 6,
        years: 5,
        targetDate: pastDateStr,
        currentGoalSavings: 50000,
      },
      { headers: { Authorization: `Bearer ${testToken}` } }
    );

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /past/i);
  });

  it('should accept a goal submission with today or a future date', async () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 5);
    const futureDateStr = future.toISOString().split('T')[0];

    const res = await client.post(
      '/goals',
      {
        goalName: 'Master Degree',
        goalCategory: 'Education',
        currentCost: 500000,
        inflationRate: 6,
        years: 5,
        targetDate: futureDateStr,
        currentGoalSavings: 50000,
      },
      { headers: { Authorization: `Bearer ${testToken}` } }
    );

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert(res.data.data, 'Goal data must be saved');
    assert.strictEqual(res.data.data.futureCost, 669113);
  });
});

describe('Task 5: InflationWise AI Assistant', () => {
  it('should calculate ₹5,00,000 at 6% for 5 years programmatically as ₹6,69,113', async () => {
    const res = await client.post('/chatbot/message', {
      message: 'My education goal costs ₹5,00,000 today. How much will it cost after five years at 6% annual inflation?',
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert(res.data.reply, 'Reply must exist');
    assert(res.data.reply.includes('6,69,113'), 'Calculated reply must include ₹6,69,113');
    assert.strictEqual(res.data.calculation.futureCost, 669113);
  });

  it('should answer financial planning questions', async () => {
    const res = await client.post('/chatbot/message', {
      message: 'How does inflation affect my savings?',
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert(res.data.reply.toLowerCase().includes('purchasing power'));
  });

  it('should reject empty message submissions', async () => {
    const res = await client.post('/chatbot/message', {
      message: '   ',
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });
});

describe('Task 6: Secure Password Reset Flow', () => {
  it('should return generic response on forgot-password request', async () => {
    const res = await client.post('/auth/forgot-password', {
      email: 'nonexistent@inflationwise.com',
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.match(res.data.message, /instructions will be sent/i);
  });

  it('should allow setting new password via valid single-use reset token', async () => {
    const resetEmail = `reset_${Date.now()}@example.com`;
    const originalPass = 'InitialPass@123';
    const newPass = 'UpdatedPass@456';

    // 1. Register a user
    const regRes = await client.post('/auth/register', {
      name: 'Rohan Sharma',
      email: resetEmail,
      mobile: '9876543219',
      password: originalPass,
      confirmPassword: originalPass,
    });
    assert.strictEqual(regRes.status, 201);

    const user = await User.findOne({ email: resetEmail });
    assert(user);

    // 2. Request forgot password
    const forgotRes = await client.post('/auth/forgot-password', {
      email: resetEmail,
    });
    assert.strictEqual(forgotRes.status, 200);

    // 3. Find created token in DB
    const tokenDoc = await PasswordResetToken.findOne({ userId: user._id, used: false });
    assert(tokenDoc, 'Token document must be created');

    // 4. Manually create test raw token that matches tokenDoc hash
    const bcrypt = require('bcryptjs');
    const rawToken = 'test_secret_reset_token_12345';
    tokenDoc.tokenHash = await bcrypt.hash(rawToken, 10);
    await tokenDoc.save();

    // 5. Submit valid reset request
    const resetRes = await client.post('/auth/reset-password', {
      token: rawToken,
      id: user._id.toString(),
      password: newPass,
      confirmPassword: newPass,
    });

    assert.strictEqual(resetRes.status, 200);
    assert.strictEqual(resetRes.data.success, true);

    // 6. Token must now be marked used
    const updatedToken = await PasswordResetToken.findById(tokenDoc._id);
    assert.strictEqual(updatedToken.used, true);

    // 7. Old password must NOT work
    const oldLogin = await client.post('/auth/login', {
      email: resetEmail,
      password: originalPass,
    });
    assert.strictEqual(oldLogin.status, 401);

    // 8. New password MUST work
    const newLogin = await client.post('/auth/login', {
      email: resetEmail,
      password: newPass,
    });
    assert.strictEqual(newLogin.status, 200);
    assert.strictEqual(newLogin.data.success, true);

    // 9. Reusing the token must be rejected
    const reuseRes = await client.post('/auth/reset-password', {
      token: rawToken,
      id: user._id.toString(),
      password: 'AnotherPass@789',
      confirmPassword: 'AnotherPass@789',
    });
    assert.strictEqual(reuseRes.status, 400);
    assert.match(reuseRes.data.message, /invalid or expired/i);
  });
});

describe('Admin Authentication and Roles', () => {
  const adminEmail = `admin_${Date.now()}@inflationwise.com`;
  const adminPass = 'AdminSecret@2026';
  let adminToken = '';

  it('should register an admin with the valid access code', async () => {
    process.env.ADMIN_ACCESS_CODE = 'IW-ADMIN-2026';
    const res = await client.post('/admin/register', {
      name: 'System Administrator',
      email: adminEmail,
      mobile: '9123456789',
      password: adminPass,
      confirmPassword: adminPass,
      accessCode: 'IW-ADMIN-2026',
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.message, 'Admin account created successfully.');

    const adminUser = await User.findOne({ email: adminEmail });
    assert(adminUser);
    assert.strictEqual(adminUser.role, 'admin');
  });

  it('should log in as admin and access admin overview', async () => {
    const loginRes = await client.post('/admin/login', {
      email: adminEmail,
      password: adminPass,
    });

    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.data.success, true);
    assert(loginRes.data.token, 'Admin token must be returned');
    adminToken = loginRes.data.token;

    const overviewRes = await client.get('/admin/overview', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(overviewRes.status, 200);
    assert.strictEqual(overviewRes.data.success, true);
    assert(overviewRes.data.data, 'Admin overview data should be returned');
    assert(typeof overviewRes.data.data.totalUsers === 'number');
  });
});

