import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../application/backend/src/app.module';

describe('Critical User Flows Integration Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let testUser: any;
  let testEvent: any;
  let testOrder: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete User Registration and Event Creation Flow', () => {
    it('should complete full user registration and event creation flow', async () => {
      // Step 1: Register a new user
      const userData = {
        email: `integration-test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Integration',
        lastName: 'Test',
        phone: '+1234567890'
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('user');
      expect(registerResponse.body).toHaveProperty('accessToken');
      testUser = registerResponse.body.user;
      authToken = registerResponse.body.accessToken;

      // Step 2: Verify user can get their profile
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(profileResponse.body.email).toBe(userData.email);

      // Step 3: Create an event
      const eventData = {
        title: 'Integration Test Event',
        description: 'An event created during integration testing',
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
        .send(eventData)
        .expect(201);

      expect(eventResponse.body).toHaveProperty('_id');
      expect(eventResponse.body.title).toBe(eventData.title);
      testEvent = eventResponse.body;

      // Step 4: Verify event appears in organizer's events
      const myEventsResponse = await request(app.getHttpServer())
        .get('/events/my-events')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(myEventsResponse.body.events.length).toBeGreaterThan(0);
      expect(myEventsResponse.body.events[0]._id).toBe(testEvent._id);
    });
  });

  describe('Complete Ticket Purchase Flow', () => {
    it('should complete full ticket purchase flow', async () => {
      // Step 1: Create a test user and event (if not already created)
      if (!testUser || !testEvent) {
        const userData = {
          email: `purchase-test-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          firstName: 'Purchase',
          lastName: 'Test'
        };

        const registerResponse = await request(app.getHttpServer())
          .post('/auth/register')
          .send(userData);

        authToken = registerResponse.body.accessToken;

        const eventData = {
          title: 'Purchase Test Event',
          description: 'An event for purchase testing',
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
      }

      // Step 2: Add items to cart
      const cartItem = {
        eventId: testEvent._id,
        ticketTypeId: testEvent.ticketTypes[0]?._id || 'default-ticket-type',
        quantity: 2,
        price: 25.00
      };

      const sessionId = `purchase-session-${Date.now()}`;

      const addToCartResponse = await request(app.getHttpServer())
        .post('/cart/add')
        .send(cartItem)
        .query({ sessionId })
        .expect(201);

      expect(addToCartResponse.body).toHaveProperty('_id');
      expect(addToCartResponse.body.eventId).toBe(testEvent._id);

      // Step 3: Verify cart contents
      const cartResponse = await request(app.getHttpServer())
        .get('/cart')
        .query({ sessionId })
        .expect(200);

      expect(cartResponse.body.items.length).toBeGreaterThan(0);
      expect(cartResponse.body.total).toBeGreaterThan(0);

      // Step 4: Create order
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

      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .send(orderData)
        .query({ sessionId })
        .expect(201);

      expect(orderResponse.body).toHaveProperty('_id');
      expect(orderResponse.body.eventId).toBe(testEvent._id);
      expect(orderResponse.body.totalAmount).toBe(50.00);
      testOrder = orderResponse.body;

      // Step 5: Verify order can be retrieved
      const getOrderResponse = await request(app.getHttpServer())
        .get(`/orders/${testOrder._id}`)
        .expect(200);

      expect(getOrderResponse.body._id).toBe(testOrder._id);
      expect(getOrderResponse.body.customerInfo.email).toBe(orderData.customerInfo.email);
    });
  });

  describe('Event Management Flow', () => {
    it('should complete event management flow', async () => {
      // Step 1: Create an event
      const eventData = {
        title: 'Management Test Event',
        description: 'An event for management testing',
        category: 'Conference',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Conference Center',
        address: '456 Conference Ave',
        city: 'Conference City',
        state: 'CC',
        zipCode: '54321',
        country: 'Conference Country',
        capacity: 200,
        isPublished: false
      };

      const createEventResponse = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(201);

      const eventId = createEventResponse.body._id;

      // Step 2: Update the event
      const updateData = {
        title: 'Updated Management Test Event',
        description: 'Updated description for management testing',
        capacity: 250
      };

      const updateEventResponse = await request(app.getHttpServer())
        .put(`/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateEventResponse.body.title).toBe(updateData.title);
      expect(updateEventResponse.body.description).toBe(updateData.description);
      expect(updateEventResponse.body.capacity).toBe(updateData.capacity);

      // Step 3: Publish the event
      const publishResponse = await request(app.getHttpServer())
        .put(`/events/${eventId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(publishResponse.body.isPublished).toBe(true);

      // Step 4: Verify event appears in public events list
      const publicEventsResponse = await request(app.getHttpServer())
        .get('/events')
        .expect(200);

      expect(publicEventsResponse.body.events.length).toBeGreaterThan(0);
      const publishedEvent = publicEventsResponse.body.events.find(
        (event: any) => event._id === eventId
      );
      expect(publishedEvent).toBeDefined();
      expect(publishedEvent.isPublished).toBe(true);
    });
  });

  describe('User Profile Management Flow', () => {
    it('should complete user profile management flow', async () => {
      // Step 1: Get current profile
      const getProfileResponse = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const originalProfile = getProfileResponse.body;

      // Step 2: Update profile
      const updateData = {
        firstName: 'Updated',
        lastName: 'User',
        phone: '+1987654321'
      };

      const updateProfileResponse = await request(app.getHttpServer())
        .put('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateProfileResponse.body.firstName).toBe(updateData.firstName);
      expect(updateProfileResponse.body.lastName).toBe(updateData.lastName);
      expect(updateProfileResponse.body.phone).toBe(updateData.phone);

      // Step 3: Change password
      const changePasswordData = {
        currentPassword: 'TestPassword123!',
        newPassword: 'NewTestPassword123!'
      };

      const changePasswordResponse = await request(app.getHttpServer())
        .put('/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(changePasswordData)
        .expect(200);

      expect(changePasswordResponse.body).toHaveProperty('message');

      // Step 4: Verify login with new password
      const loginData = {
        email: originalProfile.email,
        password: changePasswordData.newPassword
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(loginResponse.body).toHaveProperty('accessToken');
    });
  });

  describe('Order Management Flow', () => {
    it('should complete order management flow', async () => {
      if (!testOrder) {
        // Create a test order if one doesn't exist
        const orderData = {
          eventId: testEvent._id,
          tickets: [
            {
              ticketTypeId: testEvent.ticketTypes[0]?._id || 'default-ticket-type',
              quantity: 1,
              price: 25.00
            }
          ],
          customerInfo: {
            firstName: 'Order',
            lastName: 'Test',
            email: 'order.test@example.com',
            phone: '+1111111111'
          },
          totalAmount: 25.00,
          currency: 'USD'
        };

        const orderResponse = await request(app.getHttpServer())
          .post('/orders')
          .send(orderData);

        testOrder = orderResponse.body;
      }

      // Step 1: Get order details
      const getOrderResponse = await request(app.getHttpServer())
        .get(`/orders/${testOrder._id}`)
        .expect(200);

      expect(getOrderResponse.body._id).toBe(testOrder._id);

      // Step 2: Get user's orders (if authenticated)
      if (authToken) {
        const myOrdersResponse = await request(app.getHttpServer())
          .get('/orders/my-orders')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(Array.isArray(myOrdersResponse.body.orders)).toBe(true);
      }

      // Step 3: Get orders by email
      const ordersByEmailResponse = await request(app.getHttpServer())
        .get(`/orders/by-email?email=${testOrder.customerInfo.email}`)
        .expect(200);

      expect(Array.isArray(ordersByEmailResponse.body.orders)).toBe(true);
      expect(ordersByEmailResponse.body.orders.length).toBeGreaterThan(0);

      // Step 4: Get order statistics
      const statsResponse = await request(app.getHttpServer())
        .get('/orders/stats/overview')
        .expect(200);

      expect(statsResponse.body).toHaveProperty('totalOrders');
      expect(statsResponse.body).toHaveProperty('totalRevenue');
      expect(statsResponse.body).toHaveProperty('totalTickets');
    });
  });
});
