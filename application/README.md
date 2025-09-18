# TicketNow - MERN Stack Ticketing Platform

A comprehensive ticketing platform built with Node.js, MongoDB, Redis, and modern web technologies.

## 🏗️ Architecture

- **Backend**: NestJS (Node.js + TypeScript)
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for seat locking and caching
- **Storage**: AWS S3 for file storage
- **Payments**: Stripe integration
- **Email**: SendGrid for notifications
- **Development**: Docker Compose for local development

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- MongoDB Atlas account (for production)
- Redis account (for production)
- AWS S3 account
- Stripe account
- SendGrid account

### Local Development

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd ticketnow-mernstack-app
   ```

2. **Start services with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

3. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

4. **Configure environment**:
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

5. **Start the backend**:
   ```bash
   npm run start:dev
   ```

### Services Available

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **MongoDB Admin**: http://localhost:8081 (admin/admin123)
- **Redis Admin**: http://localhost:8082

## 📋 Features

### Core Features
- ✅ User authentication (JWT)
- ✅ Event management
- ✅ Ticket types and pricing
- ✅ Seat selection with Redis locking
- ✅ Stripe payment integration
- ✅ QR code ticket generation
- ✅ PDF ticket generation
- ✅ Email notifications
- ✅ Order management
- ✅ Scanner app for check-in

### API Endpoints

#### Public
- `GET /api/events` - List published events
- `GET /api/events/:slug` - Event details
- `POST /api/cart` - Add items to cart
- `POST /api/checkout` - Create order & payment
- `GET /api/seat-lock` - Check seat availability
- `POST /api/seat-lock` - Lock seats

#### Authenticated
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/me/orders` - User orders
- `GET /api/orders/:id` - Order details

#### Organizer
- `POST /api/organizer/events` - Create event
- `PUT /api/organizer/events/:id` - Update event
- `GET /api/organizer/events/:id/sales` - Sales report

#### Scanner
- `POST /api/scan` - Validate QR code

#### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhooks

## 🛠️ Development

### Project Structure

```
backend/
├── src/
│   ├── auth/           # Authentication module
│   ├── users/          # User management
│   ├── events/         # Event management
│   ├── orders/         # Order processing
│   ├── tickets/        # Ticket generation
│   ├── organizer/      # Organizer portal
│   ├── scanner/        # QR code scanner
│   ├── webhooks/       # Webhook handlers
│   ├── redis/          # Redis service
│   ├── s3/             # S3 service
│   ├── email/          # Email service
│   └── schemas/        # MongoDB schemas
├── scripts/            # Database scripts
└── Dockerfile

frontend/
├── src/
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilities and API
│   └── types/          # TypeScript types
├── public/             # Static assets
└── Dockerfile
```

### Database Schema

#### Users
- Authentication and profile information
- Role-based access (attendee, organizer, admin)

#### Events
- Event details, venue, timing
- Seatmap configuration
- Status management

#### Ticket Types
- Pricing and capacity
- Sales windows
- Refund policies

#### Orders
- Cart items and pricing
- Payment integration
- Status tracking

#### Tickets
- QR code generation
- PDF storage
- Usage tracking

### Key Technologies

- **NestJS**: Modern Node.js framework
- **Mongoose**: MongoDB object modeling
- **Redis**: Caching and seat locking
- **Stripe**: Payment processing
- **AWS S3**: File storage
- **SendGrid**: Email delivery
- **JWT**: Authentication
- **Docker**: Containerization

## 🔧 Configuration

### Environment Variables

Copy `backend/env.example` to `backend/.env` and configure:

```bash
# Database
MONGO_URI=mongodb://admin:password123@localhost:27017/ticketnow

# Redis
REDIS_URL=redis://:redis123@localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS S3
S3_BUCKET=ticketnow-assets
S3_ACCESS_KEY=...
S3_SECRET_KEY=...

# Email
SENDGRID_API_KEY=...
```

## 🚀 Deployment

### Production Setup

1. **Database**: Use MongoDB Atlas
2. **Cache**: Use Redis Cloud or AWS ElastiCache
3. **Storage**: Configure AWS S3
4. **Backend**: Deploy to Railway, Render, or AWS ECS
5. **Environment**: Set production environment variables

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoring

- API documentation available at `/api/docs`
- Health check endpoint at `/health`
- Database admin at port 8081
- Redis admin at port 8082

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- Check the API documentation at `/api/docs`
- Review the health endpoint at `/health`
- Check Docker logs: `docker-compose logs backend`
