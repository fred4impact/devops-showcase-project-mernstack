import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../application/backend/src/app.module';

describe('Orders API Smoke Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let testEvent: any;
  let testOrder: any;

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

    // Create a test event
    const eventData = {
      title: 'Test Event for Orders',
      description: 'A test event for order testing',
      category: 'Music',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Test Venue',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      country: 'Test Country',
      capacity: 100,
      isPublished: true
    };

    const eventResponse = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send(eventData);
    
    testEvent = eventResponse.body;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /orders', () => {
    it('should create a new order', async () => {
      const orderData = {
        eventId: testEvent._id,
        tickets: [
          {
            ticketTypeId: testEvent.ticketTypes[0]?._id || 'default-ticket-type',
            quantity: 2,
            price: 25.00
          }
        ],
        customerInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890'
        },
        totalAmount: 50.00,
        currency: 'USD'
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.eventId).toBe(testEvent._id);
      expect(response.body.customerInfo.email).toBe(orderData.customerInfo.email);
      expect(response.body.totalAmount).toBe(orderData.totalAmount);
      
      testOrder = response.body;
    });

    it('should reject order creation with invalid event ID', async () => {
      const orderData = {
        eventId: 'invalid-event-id',
        tickets: [
          {
            ticketTypeId: 'default-ticket-type',
            quantity: 1,
            price: 25.00
          }
        ],
        customerInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        },
        totalAmount: 25.00,
        currency: 'USD'
      };

      await request(app.getHttpServer())
        .post('/orders')
        .send(orderData)
        .expect(400);
    });
  });

  describe('GET /orders/:id', () => {
    it('should get order by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${testOrder._id}`)
        .expect(200);

      expect(response.body._id).toBe(testOrder._id);
      expect(response.body.eventId).toBe(testEvent._id);
    });

    it('should return 404 for non-existent order', async () => {
      await request(app.getHttpServer())
        .get('/orders/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });

  describe('GET /orders/my-orders', () => {
    it('should get user orders with authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/my-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
    });

    it('should reject request without authentication', async () => {
      await request(app.getHttpServer())
        .get('/orders/my-orders')
        .expect(401);
    });
  });

  describe('GET /orders/by-email', () => {
    it('should get orders by email', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/by-email?email=${testOrder.customerInfo.email}`)
        .expect(200);

      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body.orders.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent email', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/by-email?email=nonexistent@example.com')
        .expect(200);

      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body.orders.length).toBe(0);
    });
  });

  describe('GET /orders/stats/overview', () => {
    it('should get overall order statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/stats/overview')
        .expect(200);

      expect(response.body).toHaveProperty('totalOrders');
      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('totalTickets');
    });
  });
});
