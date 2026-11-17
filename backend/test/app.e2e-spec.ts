import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

// Polyfill mime.getType if using mime v1 for supertest compatibility
const mime = require('mime');
if (mime && !mime.getType && typeof mime.lookup === 'function') {
  mime.getType = mime.lookup.bind(mime);
}

describe('Authentication & System (e2e)', () => {
  let app: INestApplication;
  const testEmail = `test_${Date.now()}@sanad.ma`;
  const testPassword = 'Password123!';
  let accessToken = '';
  let activeSessionId = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/api/v1/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('service', 'sanad-backend');
      });
  });

  it('/api/v1/auth/register (POST) - successfully registers a user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        firstName: 'Salma',
        lastName: 'Alami',
        phone: '+212611223344',
        preferredLanguage: 'ar',
      })
      .expect(201);

    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', testEmail);
    expect(res.body).toHaveProperty('verificationToken');
  });

  it('/api/v1/auth/register (POST) - rejects duplicate email with 409', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(409);
  });

  it('/api/v1/auth/login (POST) - rejects invalid password with 401', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'WrongPassword!',
      })
      .expect(401);
  });

  it('/api/v1/auth/login (POST) - returns accessToken and creates active session', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
        deviceInfo: 'E2E Automated Browser',
      })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('session');
    expect(res.body.session).toHaveProperty('id');
    accessToken = res.body.accessToken;
    activeSessionId = res.body.session.id;
  });

  it('/api/v1/auth/profile (GET) - allows access with valid Bearer token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('email', testEmail);
    expect(res.body).toHaveProperty('firstName', 'Salma');
  });

  it('/api/v1/auth/sessions (GET) - lists active sessions and marks isCurrent', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    const current = res.body.find((s: any) => s.id === activeSessionId);
    expect(current).toBeDefined();
    expect(current.isCurrent).toBe(true);
    expect(current.status).toBe('ACTIVE');
  });

  it('/api/v1/auth/logout (POST) - revokes current session', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('/api/v1/auth/profile (GET) - rejects revoked session token with 401', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);
  });

  describe('Role-Based Access Control (RBAC)', () => {
    const userRoleEmail = `citizen_${Date.now()}@sanad.ma`;
    const adminRoleEmail = `admin_${Date.now()}@sanad.ma`;
    const lawyerRoleEmail = `lawyer_${Date.now()}@sanad.ma`;
    const assocRoleEmail = `assoc_${Date.now()}@sanad.ma`;

    let userToken = '';
    let adminToken = '';
    let lawyerToken = '';
    let assocToken = '';

    beforeAll(async () => {
      // 1. Register USER
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: userRoleEmail,
          password: testPassword,
          role: 'USER',
          firstName: 'Citoyenne',
        })
        .expect(201);

      const userLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: userRoleEmail, password: testPassword })
        .expect(200);
      userToken = userLogin.body.accessToken;

      // 2. Register ADMIN
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: adminRoleEmail,
          password: testPassword,
          role: 'ADMIN',
          firstName: 'Admin',
        })
        .expect(201);

      const adminLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: adminRoleEmail, password: testPassword })
        .expect(200);
      adminToken = adminLogin.body.accessToken;

      // 3. Register LAWYER
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: lawyerRoleEmail,
          password: testPassword,
          role: 'LAWYER',
          firstName: 'Maitre',
        })
        .expect(201);

      const lawyerLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: lawyerRoleEmail, password: testPassword })
        .expect(200);
      lawyerToken = lawyerLogin.body.accessToken;

      // 4. Register ASSOCIATION
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: assocRoleEmail,
          password: testPassword,
          role: 'ASSOCIATION',
          firstName: 'Assoc',
        })
        .expect(201);

      const assocLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: assocRoleEmail, password: testPassword })
        .expect(200);
      assocToken = assocLogin.body.accessToken;
    });

    it('rejects unauthenticated requests to protected endpoints with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .expect(401);

      await request(app.getHttpServer())
        .get('/api/v1/professional/dashboard')
        .expect(401);

      await request(app.getHttpServer())
        .get('/api/v1/organization/dashboard')
        .expect(401);
    });

    it('rejects USER role accessing /admin/* with 403 Forbidden', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.message).toContain('Accès refusé');
    });

    it('rejects LAWYER role accessing /admin/* with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${lawyerToken}`)
        .expect(403);
    });

    it('rejects USER role accessing /professional/* with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/professional/dashboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('rejects USER role accessing /organization/* with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/organization/dashboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('allows ADMIN role to access /admin/dashboard with 200 OK', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('totalUsers');
      expect(res.body).toHaveProperty('roleCounts');
      expect(res.body).toHaveProperty('activeSessions');
    });

    it('allows ADMIN role to access /admin/users list with 200 OK', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(4);
    });

    it('allows LAWYER role to access /professional/dashboard with 200 OK', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/professional/dashboard')
        .set('Authorization', `Bearer ${lawyerToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('professionalId');
      expect(res.body).toHaveProperty('professionalType', 'LAWYER');
    });

    it('allows ASSOCIATION role to access /organization/dashboard with 200 OK', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/organization/dashboard')
        .set('Authorization', `Bearer ${assocToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('organizationType', 'ASSOCIATION');
      expect(res.body).toHaveProperty('networkStats');
    });
  });
});
