import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../application/backend/src/app.module';

describe('API Integration Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let testUser: any;
  let testEvent: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Setup test user
    const userData = {
      email: `integration-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Integration',
      lastName: 'Test'
    };

    const authResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userData);
    
    authToken = authResponse.body.accessToken;
    testUser = authResponse.body.user;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Integration', () => {
    it('should handle complete authentication flow', async () => {
      // Register -> Login -> Get Profile -> Update Profile -> Change Password
      const userData = {
        email: `auth-flow-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Auth',
        lastName: 'Flow'
      };

      // Register
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const token = registerResponse.body.accessToken;

      // Login
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('accessToken');

      // Get Profile
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body.email).toBe(userData.email);

      // Update Profile
      const updateResponse = await request(app.getHttpServer())
        .put('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name'
        })
        .expect(200);

      expect(updateResponse.body.firstName).toBe('Updated');
    });
  });

  describe('Event Management Integration', () => {
    it('should handle complete event lifecycle', async () => {
      // Create Event -> Update Event -> Publish Event -> Get Public Events -> Get My Events
      const eventData = {
        title: 'Integration Test Event',
        description: 'A comprehensive test event',
        category: 'Technology',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Tech Center',
        address: '789 Tech Street',
        city: 'Tech City',
        state: 'TC',
        zipCode: '98765',
        country: 'Tech Country',
        capacity: 150,
        isPublished: false
      };

      // Create Event
      const createResponse = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(201);

      const eventId = createResponse.body._id;
      testEvent = createResponse.body;

      // Update Event
      const updateResponse = await request(app.getHttpServer())
        .put(`/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Integration Test Event',
          description: 'Updated description',
          capacity: 200
        })
        .expect(200);

      expect(updateResponse.body.title).toBe('Updated Integration Test Event');

      // Publish Event
      const publishResponse = await request(app.getHttpServer())
        .put(`/events/${eventId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(publishResponse.body.isPublished).toBe(true);

      // Get Public Events
      const publicEventsResponse = await request(app.getHttpServer())
        .get('/events')
        .expect(200);

      expect(Array.isArray(publicEventsResponse.body.events)).toBe(true);

      // Get My Events
      const myEventsResponse = await request(app.getHttpServer())
        .get('/events/my-events')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(myEventsResponse.body.events)).toBe(true);
      expect(myEventsResponse.body.events.length).toBeGreaterThan(0);
    });
  });

  describe('Order Processing Integration', () => {
    it('should handle complete order processing flow', async () => {
      if (!testEvent) {
        // Create a test event first
        const eventData = {
          title: 'Order Test Event',
          description: 'Event for order testing',
          category: 'Music',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Music Hall',
          address: '123 Music Street',
          city: 'Music City',
          state: 'MC',
          zipCode: '12345',
          country: 'Music Country',
          capacity: 100,
          isPublished: true
        };

        const eventResponse = await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${authToken}`)
          .send(eventData);

        testEvent = eventResponse.body;
      }

      // Add to Cart -> Create Order -> Get Order -> Get Orders by Email
      const sessionId = `order-integration-${Date.now()}`;

      // Add to Cart
      const cartItem = {
        eventId: testEvent._id,
        ticketTypeId: testEvent.ticketTypes[0]?._id || 'default-ticket-type',
        quantity: 2,
        price: 30.00
      };

      const addToCartResponse = await request(app.getHttpServer())
        .post('/cart/add')
        .send(cartItem)
        .query({ sessionId })
        .expect(201);

      expect(addToCartResponse.body).toHaveProperty('_id');

      // Create Order
      const orderData = {
        eventId: testEvent._id,
        tickets: [
          {
            ticketTypeId: testEvent.ticketTypes[0]?._id || 'default-ticket-type',
            quantity: 2,
            price: 30.00
          }
        ],
        customerInfo: {
          firstName: 'Order',
          lastName: 'Customer',
          email: 'order.customer@example.com',
          phone: '+1234567890'
        },
        totalAmount: 60.00,
        currency: 'USD'
      };

      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .send(orderData)
        .query({ sessionId })
        .expect(201);

      const orderId = orderResponse.body._id;

      // Get Order
      const getOrderResponse = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .expect(200);

      expect(getOrderResponse.body._id).toBe(orderId);
      expect(getOrderResponse.body.totalAmount).toBe(60.00);

      // Get Orders by Email
      const ordersByEmailResponse = await request(app.getHttpServer())
        .get(`/orders/by-email?email=${orderData.customerInfo.email}`)
        .expect(200);

      expect(Array.isArray(ordersByEmailResponse.body.orders)).toBe(true);
      expect(ordersByEmailResponse.body.orders.length).toBeGreaterThan(0);
    });
  });

  describe('Cart Management Integration', () => {
    it('should handle complete cart management flow', async () => {
      if (!testEvent) {
        // Create a test event first
        const eventData = {
          title: 'Cart Test Event',
          description: 'Event for cart testing',
          category: 'Sports',
          startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Sports Arena',
          address: '456 Sports Blvd',
          city: 'Sports City',
          state: 'SC',
          zipCode: '54321',
          country: 'Sports Country',
          capacity: 500,
          isPublished: true
        };

        const eventResponse = await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${authToken}`)
          .send(eventData);

        testEvent = eventResponse.body;
      }

      const sessionId = `cart-integration-${Date.now()}`;

      // Add Items -> Get Cart -> Update Item -> Remove Item -> Clear Cart
      const cartItem1 = {
        eventId: testEvent._id,
        ticketTypeId: testEvent.ticketTypes[0]?._id || 'default-ticket-type',
        quantity: 1,
        price: 25.00
      };

      const cartItem2 = {
        eventId: testEvent._id,
        ticketTypeId: testEvent.ticketTypes[0]?._id || 'default-ticket-type',
        quantity: 2,
        price: 25.00
      };

      // Add first item
      const addItem1Response = await request(app.getHttpServer())
        .post('/cart/add')
        .send(cartItem1)
        .query({ sessionId })
        .expect(201);

      const item1Id = addItem1Response.body._id;

      // Add second item
      const addItem2Response = await request(app.getHttpServer())
        .post('/cart/add')
        .send(cartItem2)
        .query({ sessionId })
        .expect(201);

      // Get Cart
      const getCartResponse = await request(app.getHttpServer())
        .get('/cart')
        .query({ sessionId })
        .expect(200);

      expect(getCartResponse.body.items.length).toBeGreaterThan(0);
      expect(getCartResponse.body.total).toBeGreaterThan(0);

      // Update Item
      const updateResponse = await request(app.getHttpServer())
        .put(`/cart/${item1Id}`)
        .send({ quantity: 3 })
        .expect(200);

      expect(updateResponse.body.quantity).toBe(3);

      // Remove Item
      await request(app.getHttpServer())
        .delete(`/cart/${item1Id}`)
        .expect(200);

      // Clear Cart
      await request(app.getHttpServer())
        .delete('/cart/clear')
        .query({ sessionId })
        .expect(200);

      // Verify cart is empty
      const emptyCartResponse = await request(app.getHttpServer())
        .get('/cart')
        .query({ sessionId })
        .expect(200);

      expect(emptyCartResponse.body.items.length).toBe(0);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle various error scenarios gracefully', async () => {
      // Test invalid authentication
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);

      // Test invalid event ID
      await request(app.getHttpServer())
        .get('/events/invalid-id')
        .expect(400);

      // Test invalid order ID
      await request(app.getHttpServer())
        .get('/orders/invalid-id')
        .expect(400);

      // Test unauthorized event access
      await request(app.getHttpServer())
        .put('/events/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Unauthorized Update' })
        .expect(404);

      // Test invalid cart operations
      await request(app.getHttpServer())
        .put('/cart/invalid-id')
        .send({ quantity: 1 })
        .expect(400);

      await request(app.getHttpServer())
        .delete('/cart/invalid-id')
        .expect(400);
    });
  });
});
