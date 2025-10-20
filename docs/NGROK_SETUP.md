# Ngrok Setup Guide for TicketNow

This guide will help you set up ngrok to share your TicketNow application with others while maintaining proper authentication.

## Prerequisites

1. Install ngrok: https://ngrok.com/download
2. Sign up for a free ngrok account
3. Get your auth token from ngrok dashboard

## Setup Steps

### 1. Configure ngrok

```bash
# Authenticate ngrok with your account
ngrok config add-authtoken YOUR_AUTH_TOKEN

# Start ngrok for frontend (port 3000)
ngrok http 3000

# In another terminal, start ngrok for backend (port 3001)
ngrok http 3001
```

### 2. Update Environment Variables

#### Backend (.env file in application/backend/)
```bash
# Update FRONTEND_BASE_URL with your frontend ngrok URL
FRONTEND_BASE_URL=https://your-frontend-ngrok-url.ngrok.io
```

#### Frontend (.env.local file in application/frontend/)
```bash
# Update API URL with your backend ngrok URL
NEXT_PUBLIC_API_URL=https://your-backend-ngrok-url.ngrok.io
NEXT_PUBLIC_APP_URL=https://your-frontend-ngrok-url.ngrok.io
```

### 3. Start Your Applications

#### Terminal 1: Backend
```bash
cd application/backend
npm run start:dev
```

#### Terminal 2: Frontend
```bash
cd application/frontend
npm run dev
```

#### Terminal 3: Frontend ngrok
```bash
ngrok http 3000
```

#### Terminal 4: Backend ngrok
```bash
ngrok http 3001
```

### 4. Update Environment Files

After starting ngrok, copy the URLs and update your environment files:

1. Copy the frontend ngrok URL (e.g., `https://abc123.ngrok.io`)
2. Copy the backend ngrok URL (e.g., `https://def456.ngrok.io`)
3. Update your `.env` files with these URLs
4. Restart both applications

## Important Notes

### CORS Configuration
The backend has been updated to automatically allow ngrok domains. The CORS configuration will:
- Allow any ngrok.io domain
- Allow any ngrok-free.app domain
- Allow localhost with any port
- Allow the configured FRONTEND_BASE_URL

### Security Considerations
- Ngrok URLs are temporary and change each time you restart ngrok (unless you have a paid plan)
- For production use, consider using a custom domain with ngrok
- The current setup allows all ngrok domains for development convenience

### Troubleshooting

#### Authentication Issues
1. Make sure both frontend and backend ngrok URLs are correctly set in environment variables
2. Restart both applications after updating environment variables
3. Check browser console for CORS errors
4. Verify that the backend is receiving requests from the correct origin

#### Common Errors
- **CORS Error**: Make sure FRONTEND_BASE_URL is set correctly in backend .env
- **API Connection Error**: Make sure NEXT_PUBLIC_API_URL is set correctly in frontend .env.local
- **Token Issues**: Clear browser localStorage and try logging in again

### Testing the Setup

1. Open your frontend ngrok URL in a browser
2. Try to register a new account
3. Try to login with existing credentials
4. Check that API calls are working by visiting `/test` page

## Quick Start Script

Create a script to automate the process:

```bash
#!/bin/bash
# start-ngrok.sh

echo "Starting TicketNow with ngrok..."

# Start backend
cd application/backend
npm run start:dev &
BACKEND_PID=$!

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait a moment for services to start
sleep 5

# Start ngrok for frontend
ngrok http 3000 &
FRONTEND_NGROK_PID=$!

# Start ngrok for backend
ngrok http 3001 &
BACKEND_NGROK_PID=$!

echo "Services started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo "Check ngrok dashboard for public URLs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
wait

# Cleanup
kill $BACKEND_PID $FRONTEND_PID $FRONTEND_NGROK_PID $BACKEND_NGROK_PID 2>/dev/null
```

Make it executable:
```bash
chmod +x start-ngrok.sh
./start-ngrok.sh
```
