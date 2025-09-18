import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../application/backend/src/app.module';

describe('Cart API Smoke Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let testEvent: any;
  let sessionId: string;

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
      title: 'Test Event for Cart',
      description: 'A test event for cart testing',
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
    sessionId = `test-session-${Date.now()}`;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /cart/add', () => {
    it('should add item to cart with session ID', async () => {
      const cartItem = {
        eventId: testEvent._id,
        ticketTypeId: testEvent.ticketTypes[0]?._id || 'default-ticket-type',
        quantity: 2,
        price: 25.00
      };

      const response = await request(app.getHttpServer())
        .post('/cart/add')
        .send(cartItem)
        .query({ sessionId })
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.eventId).toBe(testEvent._id);
      expect(response.body.quantity).toBe(cartItem.quantity);
    });

    it('should add item to cart with authentication', async () => {
      const cartItem = {
        eventId: testEvent._id,
        ticketTypeId: testEvent.ticketTypes[0]?._id || 'default-ticket-type',
        quantity: 1,
        price: 25.00
      };

      const response = await request(app.getHttpServer())
        .post('/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cartItem)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.eventId).toBe(testEvent._id);
    });
  });

  describe('GET /cart', () => {
    it('should get cart items by session ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/cart')
        .query({ sessionId })
        .expect(200);

      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('totalAmount');
    });

    it('should get cart items with authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('totalAmount');
    });
  });

  describe('PUT /cart/:id', () => {
    it('should update cart item quantity', async () => {
      // First, add an item to cart
      const cartItem = {
        eventId: testEvent._id,
        ticketTypeId: testEvent.ticketTypes[0]?._id || 'default-ticket-type',
        quantity: 1,
        price: 25.00
      };

      const addResponse = await request(app.getHttpServer())
        .post('/cart/add')
        .query({ sessionId: `update-session-${Date.now()}` })
        .send(cartItem);

      const cartItemId = addResponse.body._id;

      // Update the quantity
      const updateData = {
        quantity: 3
      };

      const response = await request(app.getHttpServer())
        .put(`/cart/${cartItemId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.quantity).toBe(updateData.quantity);
    });
  });

  describe('DELETE /cart/:id', () => {
    it('should remove item from cart', async () => {
      // First, add an item to cart
      const cartItem = {
        eventId: testEvent._id,
        ticketTypeId: testEvent.ticketTypes[0]?._id || 'default-ticket-type',
        quantity: 1,
        price: 25.00
      };

      const addResponse = await request(app.getHttpServer())
        .post('/cart/add')
        .query({ sessionId: `delete-session-${Date.now()}` })
        .send(cartItem);

      const cartItemId = addResponse.body._id;

      // Remove the item
      await request(app.getHttpServer())
        .delete(`/cart/${cartItemId}`)
        .expect(200);

      // Verify item is removed
      await request(app.getHttpServer())
        .get(`/cart/${cartItemId}`)
        .expect(404);
    });
  });

  describe('DELETE /cart/clear', () => {
    it('should clear cart by session ID', async () => {
      const clearSessionId = `clear-session-${Date.now()}`;
      
      // Add some items first
      const cartItem = {
        eventId: testEvent._id,
        ticketTypeId: testEvent.ticketTypes[0]?._id || 'default-ticket-type',
        quantity: 2,
        price: 25.00
      };

      await request(app.getHttpServer())
        .post('/cart/add')
        .query({ sessionId: clearSessionId })
        .send(cartItem);

      // Clear the cart
      await request(app.getHttpServer())
        .delete('/cart/clear')
        .query({ sessionId: clearSessionId })
        .expect(200);

      // Verify cart is empty
      const response = await request(app.getHttpServer())
        .get('/cart')
        .query({ sessionId: clearSessionId })
        .expect(200);

      expect(response.body.items.length).toBe(0);
    });
  });
});
