const request = require('supertest');
const { setupTestDB } = require('./setup');
const app = require('../app');
const User = require('../models/User');
const ArtisanProfile = require('../models/ArtisanProfile');

setupTestDB();

describe('Authentication & Role Separation Tests', () => {
  it('should register a customer and ignore any client role escalation attempt', async () => {
    const res = await request(app)
      .post('/api/auth/register-customer')
      .send({
        name: 'Test Customer',
        email: 'customer@test.com',
        password: 'password123',
        role: 'admin', // Malicious attempt to register as admin
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('customer'); // Role MUST be customer

    const savedUser = await User.findOne({ email: 'customer@test.com' });
    expect(savedUser.role).toBe('customer');
  });

  it('should register an artisan with pending approval status', async () => {
    const res = await request(app)
      .post('/api/auth/register-artisan')
      .send({
        name: 'Ramu Master Weaver',
        email: 'ramu@artisan.test',
        password: 'password123',
        craftType: 'Pochampally Ikat',
        craftStory: 'Traditional double ikat master weaver from Bhoodan Pochampally village.',
        experienceYears: 15,
        location: { state: 'Telangana', village: 'Pochampally' },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('artisan');
    expect(res.body.artisanProfile.applicationStatus).toBe('pending');
  });

  it('should reject login with wrong password', async () => {
    await request(app)
      .post('/api/auth/register-customer')
      .send({
        name: 'Valid Customer',
        email: 'valid@test.com',
        password: 'correctPassword123',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'valid@test.com',
        password: 'wrongPassword999',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should block customer from logging in via expectedRole admin portal check', async () => {
    await request(app)
      .post('/api/auth/register-customer')
      .send({
        name: 'Customer One',
        email: 'cust1@test.com',
        password: 'password123',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'cust1@test.com',
        password: 'password123',
        expectedRole: 'admin',
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Unauthorized portal login');
  });

  it('should reject access to protected routes without a valid JWT token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('token missing');
  });
});
