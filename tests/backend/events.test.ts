import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../application/backend/src/app.module';

describe('Events API Smoke Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let testEvent: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create a test user and get auth token
    const userData = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    };

    const authResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userData);
    
    authToken = authResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /events', () => {
    it('should create a new event', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'A test event for smoke testing',
        category: 'Music',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
        location: 'Test Venue',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country',
        capacity: 100,
        isPublished: false
      };

      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(eventData.title);
      expect(response.body.organizer).toBeDefined();
      
      testEvent = response.body;
    });

    it('should reject event creation without authentication', async () => {
      const eventData = {
        title: 'Unauthorized Event',
        description: 'This should fail'
      };

      await request(app.getHttpServer())
        .post('/events')
        .send(eventData)
        .expect(401);
    });
  });

  describe('GET /events', () => {
    it('should get all published events', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .expect(200);

      expect(Array.isArray(response.body.events)).toBe(true);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
    });

    it('should filter events by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/events?category=Music')
        .expect(200);

      expect(Array.isArray(response.body.events)).toBe(true);
    });
  });

  describe('GET /events/:id', () => {
    it('should get event by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/events/${testEvent._id}`)
        .expect(200);

      expect(response.body._id).toBe(testEvent._id);
      expect(response.body.title).toBe(testEvent.title);
    });

    it('should return 404 for non-existent event', async () => {
      await request(app.getHttpServer())
        .get('/events/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });

  describe('PUT /events/:id', () => {
    it('should update event', async () => {
      const updateData = {
        title: 'Updated Test Event',
        description: 'Updated description'
      };

      const response = await request(app.getHttpServer())
        .put(`/events/${testEvent._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.description).toBe(updateData.description);
    });

    it('should reject update without authentication', async () => {
      const updateData = {
        title: 'Unauthorized Update'
      };

      await request(app.getHttpServer())
        .put(`/events/${testEvent._id}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('GET /events/my-events', () => {
    it('should get organizer events', async () => {
      const response = await request(app.getHttpServer())
        .get('/events/my-events')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.events)).toBe(true);
      expect(response.body.events.length).toBeGreaterThan(0);
    });

    it('should reject request without authentication', async () => {
      await request(app.getHttpServer())
        .get('/events/my-events')
        .expect(401);
    });
  });
});
