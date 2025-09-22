import axios from 'axios';

// Test configuration
const API_BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

describe('Simple API Tests against Running Application', () => {
  let authToken: string;
  let testUser: any;
  let testEvent: any;

  beforeAll(async () => {
    // Wait a bit for the application to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  describe('Health Check', () => {
    it('should respond to health check', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        expect(response.status).toBe(200);
        console.log('✅ Health check passed');
      } catch (error) {
        console.log('❌ Health check failed:', error.message);
        throw error;
      }
    });

    it('should respond to API health check', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('status');
        console.log('✅ API health check passed');
      } catch (error) {
        console.log('❌ API health check failed:', error.message);
        throw error;
      }
    });
  });

  describe('Authentication Flow', () => {
    it('should register a new user', async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        name: 'Test User',
        phone: '+1234567890'
      };

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('user');
        expect(response.data).toHaveProperty('token');
        
        authToken = response.data.token;
        testUser = response.data.user;
        console.log('✅ User registration successful');
      } catch (error) {
        console.log('❌ User registration failed:', error.response?.data || error.message);
        throw error;
      }
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: 'TestPassword123!'
      };

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('token');
        console.log('✅ User login successful');
      } catch (error) {
        console.log('❌ User login failed:', error.response?.data || error.message);
        throw error;
      }
    });

    it('should get user profile with valid token', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        expect(response.status).toBe(200);
        expect(response.data.email).toBe(testUser.email);
        console.log('✅ User profile retrieval successful');
      } catch (error) {
        console.log('❌ User profile retrieval failed:', error.response?.data || error.message);
        throw error;
      }
    });
  });

  describe('Event Management', () => {
    it('should create a new event', async () => {
      const eventData = {
        title: 'Test Event',
        slug: `test-event-${Date.now()}`,
        description: 'A test event for smoke testing with proper API schema',
        category: 'Music',
        venue: {
          name: 'Test Venue',
          address: '123 Test Street, Test City, Test State 12345, Test Country',
          capacity: 100,
          timezone: 'America/New_York'
        },
        startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'draft'
      };

      try {
        const response = await axios.post(`${API_BASE_URL}/events`, eventData, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('_id');
        expect(response.data.title).toBe(eventData.title);
        
        testEvent = response.data;
        console.log('✅ Event creation successful');
      } catch (error) {
        console.log('❌ Event creation failed:', error.response?.data || error.message);
        throw error;
      }
    });

    it('should get all events', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/events`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('events');
        expect(Array.isArray(response.data.events)).toBe(true);
        console.log('✅ Event listing successful');
      } catch (error) {
        console.log('❌ Event listing failed:', error.response?.data || error.message);
        throw error;
      }
    });

    it('should get event by ID', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/events/${testEvent._id}`);
        expect(response.status).toBe(200);
        expect(response.data._id).toBe(testEvent._id);
        console.log('✅ Event retrieval successful');
      } catch (error) {
        console.log('❌ Event retrieval failed:', error.response?.data || error.message);
        throw error;
      }
    });

    it('should update event', async () => {
      const updateData = {
        title: 'Updated Test Event',
        description: 'Updated description with proper length for API validation'
      };

      try {
        const response = await axios.put(`${API_BASE_URL}/events/${testEvent._id}`, updateData, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        expect(response.status).toBe(200);
        expect(response.data.title).toBe(updateData.title);
        console.log('✅ Event update successful');
      } catch (error) {
        console.log('❌ Event update failed:', error.response?.data || error.message);
        throw error;
      }
    });
  });

  describe('Cart Management', () => {
    it('should add item to cart', async () => {
      const sessionId = `test-session-${Date.now()}`;
      const cartItem = {
        ticketTypeId: testEvent.ticketTypes?.[0]?._id || 'default-ticket-type',
        quantity: 2
      };

      try {
        const response = await axios.post(`${API_BASE_URL}/cart/add`, cartItem, {
          params: { sessionId }
        });
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('_id');
        console.log('✅ Cart item addition successful');
      } catch (error) {
        console.log('❌ Cart item addition failed:', error.response?.data || error.message);
        throw error;
      }
    });

    it('should get cart contents', async () => {
      const sessionId = `test-session-${Date.now()}`;

      try {
        const response = await axios.get(`${API_BASE_URL}/cart`, {
          params: { sessionId }
        });
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('items');
        expect(Array.isArray(response.data.items)).toBe(true);
        console.log('✅ Cart retrieval successful');
      } catch (error) {
        console.log('❌ Cart retrieval failed:', error.response?.data || error.message);
        throw error;
      }
    });
  });

  describe('Frontend Accessibility', () => {
    it('should serve frontend application', async () => {
      try {
        const response = await axios.get(FRONTEND_URL);
        expect(response.status).toBe(200);
        console.log('✅ Frontend application accessible');
      } catch (error) {
        console.log('❌ Frontend application not accessible:', error.message);
        throw error;
      }
    });
  });
});
