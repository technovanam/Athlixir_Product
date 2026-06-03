import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
const cookieParser = require('cookie-parser');
import { AppModule } from './../src/app.module';
import { AuthService } from '../src/auth/services/auth.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

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

  describe('/auth/signup (POST)', () => {
    it('should successfully signup and return session cookie', async () => {
      const signupDto = {
        email: 'test@example.com',
        password: 'Password123!',
        username: 'tester',
      };
      const userProfile = {
        uid: '123',
        email: signupDto.email,
        username: signupDto.username,
      };

      mockAuthService.signup.mockResolvedValue(userProfile);
      mockAuthService.login.mockResolvedValue({
        idToken: 'fake-token',
        userProfile,
      });
      mockAuthService.createSessionCookie.mockResolvedValue(
        'fake-session-cookie',
      );

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(201);

      expect(response.body.message).toBe('Registration and login successful');
      expect(response.body.user).toEqual(userProfile);

      // Check cookies
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(
        cookies.some((cookie: string) => cookie.includes('session=')),
      ).toBeTruthy();
      expect(
        cookies.some((cookie: string) =>
          cookie.includes('athlixir_logged_in=true'),
        ),
      ).toBeTruthy();
    });

    it('should reject invalid email', async () => {
      const signupDto = {
        email: 'invalid-email',
        password: 'Password123!',
        username: 'tester',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('email')]),
      );
    });

    it('should reject weak password', async () => {
      const signupDto = {
        email: 'test@example.com',
        password: 'weak',
        username: 'tester',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('Password')]),
      );
    });

    it('should handle duplicate email gracefully', async () => {
      const signupDto = {
        email: 'duplicate@example.com',
        password: 'Password123!',
        username: 'tester',
      };

      const { ConflictException } = require('@nestjs/common');
      mockAuthService.signup.mockRejectedValue(
        new ConflictException('Email address is already in use'),
      );

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(409);

      expect(response.body.message).toBe('Email address is already in use');
    });
  });

  describe('/auth/login (POST)', () => {
    it('should successfully login and return session cookie', async () => {
      const loginDto = { email: 'test@example.com', password: 'Password123!' };
      const userProfile = {
        uid: '123',
        email: loginDto.email,
        username: 'tester',
      };

      mockAuthService.login.mockResolvedValue({
        idToken: 'fake-token',
        userProfile,
      });
      mockAuthService.createSessionCookie.mockResolvedValue(
        'fake-session-cookie',
      );

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(201); // NestJS POST default is 201 unless HttpStatus.OK is strictly enforced via decorator without passthrough response issue. Let's check status

      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toEqual(userProfile);

      // Check cookies
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(
        cookies.some((cookie: string) => cookie.includes('session=')),
      ).toBeTruthy();
    });

    it('should handle invalid credentials', async () => {
      const loginDto = {
        email: 'wrong@example.com',
        password: 'WrongPassword123!',
      };

      const { UnauthorizedException } = require('@nestjs/common');
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid email or password'),
      );

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should clear cookies on logout', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', ['session=fake-session-cookie'])
        .expect(201);

      expect(response.body.message).toBe('Logged out successfully');

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(
        cookies.some((cookie: string) => cookie.includes('session=;')),
      ).toBeTruthy();
      expect(mockAuthService.revokeSession).toHaveBeenCalledWith(
        'fake-session-cookie',
      );
    });
  });
});
