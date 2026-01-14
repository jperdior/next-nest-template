import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@shared/database/prisma.service';

describe('ItemsController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.item.deleteMany();
  });

  describe('POST /items', () => {
    it('should create item with valid data', async () => {
      const createDto = {
        name: 'Test Item',
        description: 'Test Description',
      };

      const response = await request(app.getHttpServer())
        .post('/items')
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'Test Item',
        description: 'Test Description',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      // Verify in database
      const item = await prisma.item.findUnique({
        where: { id: response.body.id },
      });
      expect(item).toBeTruthy();
      expect(item?.name).toBe('Test Item');
    });

    it('should create item without description', async () => {
      const createDto = {
        name: 'Test Item',
      };

      const response = await request(app.getHttpServer())
        .post('/items')
        .send(createDto)
        .expect(201);

      expect(response.body.description).toBeUndefined();
    });

    it('should reject name shorter than 3 characters', async () => {
      const createDto = {
        name: 'ab',
        description: 'Test',
      };

      await request(app.getHttpServer())
        .post('/items')
        .send(createDto)
        .expect(400);
    });

    it('should reject name longer than 100 characters', async () => {
      const createDto = {
        name: 'a'.repeat(101),
        description: 'Test',
      };

      await request(app.getHttpServer())
        .post('/items')
        .send(createDto)
        .expect(400);
    });

    it('should reject missing name', async () => {
      const createDto = {
        description: 'Test',
      };

      await request(app.getHttpServer())
        .post('/items')
        .send(createDto)
        .expect(400);
    });

    it('should reject extra fields', async () => {
      const createDto = {
        name: 'Test Item',
        extraField: 'should be rejected',
      };

      await request(app.getHttpServer())
        .post('/items')
        .send(createDto)
        .expect(400);
    });
  });

  describe('GET /items', () => {
    it('should return empty array when no items', async () => {
      const response = await request(app.getHttpServer())
        .get('/items')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all items', async () => {
      // Seed test data
      await prisma.item.createMany({
        data: [
          { name: 'Item 1', description: 'First' },
          { name: 'Item 2', description: 'Second' },
          { name: 'Item 3' },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/items')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should return items in descending order by createdAt', async () => {
      // Create items with different timestamps
      await prisma.item.create({
        data: { name: 'First', createdAt: new Date('2024-01-01') },
      });
      await prisma.item.create({
        data: { name: 'Second', createdAt: new Date('2024-01-02') },
      });
      await prisma.item.create({
        data: { name: 'Third', createdAt: new Date('2024-01-03') },
      });

      const response = await request(app.getHttpServer())
        .get('/items')
        .expect(200);

      expect(response.body[0].name).toBe('Third');
      expect(response.body[1].name).toBe('Second');
      expect(response.body[2].name).toBe('First');
    });
  });
});
