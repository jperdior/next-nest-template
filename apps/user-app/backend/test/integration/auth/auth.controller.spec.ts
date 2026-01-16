import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../../utils/test-app.factory';
import { TestDataFactory } from '../../utils/test-data.factory';

describe('Auth Controller (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register new user successfully', async () => {
      // Arrange: Create test data
      const dto = TestDataFactory.createRegisterDto();

      // Act: Make HTTP request to register endpoint
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(201);

      // Assert: Verify response structure and content
      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        user: {
          id: expect.any(String),
          email: dto.email,
          name: dto.name,
          role: 'ROLE_USER',
        },
      });
    });

    it('should reject duplicate email', async () => {
      // Arrange: Create test data
      const dto = TestDataFactory.createRegisterDto();

      // Act: Register user first time (succeeds)
      await request(app.getHttpServer()).post('/auth/register').send(dto).expect(201);

      // Act: Try to register again with same email
      await request(app.getHttpServer()).post('/auth/register').send(dto).expect(409); // Assert: Should return 409 Conflict
    });

    it('should reject invalid email format', async () => {
      // Arrange: Create test data with invalid email
      const dto = TestDataFactory.createRegisterDto({ email: 'invalid-email' });

      // Act & Assert: Request should fail with 400 Bad Request
      await request(app.getHttpServer()).post('/auth/register').send(dto).expect(400);
    });

    it('should reject weak password', async () => {
      const dto = TestDataFactory.createRegisterDto({ password: 'weak' });

      await request(app.getHttpServer()).post('/auth/register').send(dto).expect(400);
    });

    it('should reject missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com' }) // missing name and password
        .expect(400);
    });

    it('should create user as active by default', async () => {
      const dto = TestDataFactory.createRegisterDto();

      await request(app.getHttpServer()).post('/auth/register').send(dto).expect(201);

      // Verify by trying to login immediately
      const loginDto = TestDataFactory.createLoginDto(dto.email, dto.password);
      await request(app.getHttpServer()).post('/auth/login').send(loginDto).expect(200);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      // Arrange: Register a user first to have valid credentials
      const registerDto = TestDataFactory.createRegisterDto();
      await request(app.getHttpServer()).post('/auth/register').send(registerDto).expect(201);

      // Arrange: Prepare login data
      const loginDto = TestDataFactory.createLoginDto(registerDto.email, registerDto.password);

      // Act: Attempt to login
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      // Assert: Verify response structure and content
      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        user: {
          id: expect.any(String),
          email: registerDto.email,
          name: registerDto.name,
          role: 'ROLE_USER',
        },
      });
    });

    it('should reject invalid email', async () => {
      const loginDto = TestDataFactory.createLoginDto('nonexistent@example.com');

      await request(app.getHttpServer()).post('/auth/login').send(loginDto).expect(401);
    });

    it('should reject invalid password', async () => {
      // Register a user
      const registerDto = TestDataFactory.createRegisterDto();
      await request(app.getHttpServer()).post('/auth/register').send(registerDto).expect(201);

      // Try wrong password
      const loginDto = TestDataFactory.createLoginDto(registerDto.email, 'WrongPassword123');

      await request(app.getHttpServer()).post('/auth/login').send(loginDto).expect(401);
    });

    it('should handle case-insensitive email', async () => {
      const registerDto = TestDataFactory.createRegisterDto({
        email: 'Test@Example.Com',
      });
      await request(app.getHttpServer()).post('/auth/register').send(registerDto).expect(201);

      // Login with lowercase
      const loginDto = TestDataFactory.createLoginDto('test@example.com', registerDto.password);

      await request(app.getHttpServer()).post('/auth/login').send(loginDto).expect(200);
    });
  });

  describe('JWT Token', () => {
    it('should generate valid JWT token', async () => {
      const registerDto = TestDataFactory.createRegisterDto();

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      const { accessToken } = response.body;

      // Token should be a valid JWT format (header.payload.signature)
      expect(accessToken).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    });
  });
});
