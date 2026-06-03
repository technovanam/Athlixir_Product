import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { FirebaseService } from '../src/firebase/firebase.service';
import { AuthService } from '../src/auth/services/auth.service';
import { OnboardingService } from '../src/modules/onboarding/services/onboarding.service';
import { AnalysisService } from '../src/modules/analysis/services/analysis.service';
const cookieParser = require('cookie-parser');

describe('ATHLIXIR Production Validation & Integrity (e2e)', () => {
  let app: INestApplication;

  // Mocked Services for Isolated Testing
  const mockFirebaseService = {
    auth: {
      createUser: jest.fn(),
      verifySessionCookie: jest.fn(),
      verifyIdToken: jest.fn(),
      revokeRefreshTokens: jest.fn(),
    },
    firestore: {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
    },
    storage: {
      bucket: jest.fn().mockReturnValue({
        name: 'mock-bucket',
        file: jest.fn().mockReturnValue({
          save: jest.fn().mockResolvedValue(true),
          exists: jest.fn().mockResolvedValue([true]),
          getMetadata: jest
            .fn()
            .mockResolvedValue([{ contentType: 'video/mp4' }]),
          getSignedUrl: jest.fn().mockResolvedValue(['http://mock-url.com']),
        }),
      }),
    },
  };

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    createSessionCookie: jest.fn(),
    revokeSession: jest.fn(),
    getUserProfile: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FirebaseService)
      .useValue(mockFirebaseService)
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PHASE 1 — AUTHENTICATION INTEGRITY', () => {
    it('Signup Validation Rejects Invalid Email formats', async () => {
      const payload = {
        email: 'bad-email',
        password: 'Password123!',
        username: 'tester',
      };
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(payload)
        .expect(400);
    });

    it('Signup Validation Rejects Weak Passwords', async () => {
      const payload = {
        email: 'test@example.com',
        password: 'weak',
        username: 'tester',
      };
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(payload)
        .expect(400);
    });

    it('Login Handles Invalid Passwords/Emails Gracefully', async () => {
      const { UnauthorizedException } = require('@nestjs/common');
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'WrongPassword!' })
        .expect(401);
    });

    it('Protected Routes block unauthenticated requests', async () => {
      await request(app.getHttpServer()).get('/onboarding/status').expect(401);
    });
  });

  describe('PHASE 2 — ONBOARDING PIPELINE INTEGRITY', () => {
    beforeEach(() => {
      mockFirebaseService.auth.verifySessionCookie.mockResolvedValue({
        uid: 'mock-uid',
        email: 'test@example.com',
      });
    });

    it('Saves basic profile details correctly', async () => {
      // Mocking status retrieval
      mockFirebaseService.firestore.get.mockResolvedValue({
        exists: true,
        data: () => ({ dob: '2000-01-01', onboarding_completed: false }),
      });

      await request(app.getHttpServer())
        .post('/onboarding/basic-info')
        .set('Cookie', ['session=fake-session'])
        .send({
          fullName: 'John Doe',
          dob: '2000-01-01',
          gender: 'male',
          state: 'CA',
          city: 'Los Angeles',
        })
        .expect(201);
    });

    it('Body Metrics updates accept and save height and weight parameters', async () => {
      mockFirebaseService.firestore.get.mockResolvedValue({
        exists: true,
        data: () => ({ dob: '2000-01-01', height_cm: 180, weight_kg: 75 }),
      });

      await request(app.getHttpServer())
        .post('/onboarding/body-metrics')
        .set('Cookie', ['session=fake-session'])
        .send({ heightCm: 180, weightKg: 75 })
        .expect(201);
    });
  });

  describe('PHASE 3 & 11 — FILE UPLOAD & SECURITY GATEWAYS', () => {
    beforeEach(() => {
      mockFirebaseService.auth.verifySessionCookie.mockResolvedValue({
        uid: 'mock-uid',
        email: 'test@example.com',
      });
    });

    it('MIME validator blocks unsupported formats like PNG', async () => {
      await request(app.getHttpServer())
        .post('/analysis/upload')
        .set('Cookie', ['session=fake-session'])
        .attach('file', Buffer.from('fake image data'), 'photo.png')
        .expect(400);
    });
  });
});
