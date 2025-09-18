# TicketNow — MVP Specification

**Project name:** TicketNow  
**Stack (MVP):** Node.js (TypeScript recommended) backend, React + Next.js frontend, MongoDB, Redis (locks/cache), AWS S3 (storage), Stripe (payments)

---

## 1. Overview
TicketNow is a minimal viable ticketing platform where organizers create events and sell tickets online. Attendees browse events, select tickets/seats, checkout with Stripe, and receive scannable QR-code tickets via email (PDF links). The MVP focuses on core flows: event management, ticketing, checkout, ticket generation, and basic organizer reporting.

---

## 2. High-Level Architecture
- **Frontend:** React + Next.js (SSR for SEO) — public event pages + organizer portal + simple seat selection UI.
- **Backend:** Node.js + Express OR NestJS (TypeScript) — REST API + WebSocket (or socket.io) for real-time seat updates.
- **Database:** MongoDB (Atlas or self-hosted) — events, users, orders, tickets, promo codes.
- **Cache/Locks:** Redis — seat locks and short-term reservations.
- **Storage:** AWS S3 — event images, ticket PDFs.
- **Payments:** Stripe (Payment Intents + Webhooks).
- **Email:** SendGrid or Postmark for sending confirmations and ticket links.

---

## 3. MVP Feature List
- Public event listing & event detail pages (SEO-friendly)
- Ticket types: General Admission + Reserved Seating (basic)
- Seatmap display (SVG-based) + seat selection with Redis-based locking
- Cart & checkout flow integrated with Stripe (card payments)
- Generate PDF ticket with QR code; store in S3; include link in confirmation email
- Organizer portal: create/edit events & ticket types; view sales by event
- Scan/check-in web app (PWA) to scan QR and mark ticket as used
- Basic reporting (CSV export of orders)

---

## 4. Data Model (MongoDB documents — suggested schemas)

### Users
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "phone": "string",
  "passwordHash": "string",
  "role": "attendee|organizer|admin",
  "createdAt": "date",
  "marketingConsent": "boolean"
}

___ events
{
  "_id": "ObjectId",
  "organizerId": "ObjectId",
  "title": "string",
  "slug": "string", // for SEO URLs
  "description": "string",
  "category": "string",
  "venue": {
    "name": "string",
    "address": "string",
    "capacity": "number",
    "timezone": "string"
  },
  "startAt": "date",
  "endAt": "date",
  "status": "draft|published|cancelled",
  "images": ["s3Url"],
  "seatmap": {
    "type": "reserved|ga",
    "svg": "s3Url or embedded",
    "seats": [
      {
        "seatId": "A-1",
        "section": "A",
        "row": "A",
        "number": "1",
        "priceModifier": 0,
        "accessible": false
      }
    ]
  },
  "createdAt": "date"
}

--ticketTypes
{
  "_id": "ObjectId",
  "eventId": "ObjectId",
  "name": "string",
  "priceCents": "number",
  "currency": "string",
  "capacity": "number",
  "salesStart": "date",
  "salesEnd": "date",
  "refundable": "boolean"
}

--orders
{
  "_id": "ObjectId",
  "userId": "ObjectId|null",
  "email": "string",
  "items": [
    {
      "ticketTypeId": "ObjectId",
      "seatId": "string|null",
      "priceCents": "number",
      "qty": "number"
    }
  ],
  "totalCents": "number",
  "feesCents": "number",
  "taxCents": "number",
  "status": "pending|paid|cancelled|refunded",
  "paymentProvider": "stripe",
  "paymentIntentId": "string",
  "createdAt": "date"
}

## Tickets
{
  "_id": "ObjectId",
  "orderId": "ObjectId",
  "eventId": "ObjectId",
  "ticketTypeId": "ObjectId",
  "seatId": "string|null",
  "ticketUUID": "string", // UUID v4
  "qrPayload": "string", // signed token or URL
  "pdfUrl": "s3Url",
  "status": "issued|used|refunded",
  "issuedAt": "date"
}
5. API Endpoints (Representative)
Public

GET /api/events — list events (filters: date, category, location)

GET /api/events/:slug — event details including seatmap

POST /api/cart — add items to cart (server-side cart or client cart)

POST /api/checkout — create order & payment intent (returns client secret)

GET /api/seat-lock — check seat availability

POST /api/seat-lock — lock seats (uses Redis with TTL)

Authenticated (user)

POST /api/auth/register — register

POST /api/auth/login — login (returns JWT)

GET /api/users/me/orders — list user's orders

GET /api/orders/:id — order details + ticket links

Organizer (requires organizer role)

POST /api/organizer/events — create event

PUT /api/organizer/events/:id — update event

POST /api/organizer/events/:id/seatmap — upload seatmap

GET /api/organizer/events/:id/sales — sales summary / CSV export

Webhooks

POST /api/webhooks/stripe — handle payment events (payment_intent.succeeded, charge.refunded)

Scanner (protected)

POST /api/scan — validate QR/token and mark ticket as used (scanner API key required)

6. Seat Locking Strategy

On seat selection, call POST /api/seat-lock with seatIds + user/sessionId.

Backend stores locks in Redis: seat-lock:{eventId}:{seatId} => {sessionId, expiresAt}

TTL typically 10 minutes.

On successful order payment, persist seat allocation in MongoDB inside transaction-like pattern (two-step: verify locks then create order & tickets).

If payment fails or TTL expires, release locks.

Note: MongoDB multi-document transactions are supported in replica set / Atlas; use transactions when finalizing seats and orders.

7. Ticket Generation

Generate ticket UUID and QR payload (e.g., signed JSON with ticketId and HMAC).

Use qrcode npm package to create QR PNG/SVG.

Generate PDF using pdfkit or puppeteer to render an HTML template to PDF.

Upload PDF to S3 and save URL in ticket document.

Email the ticket link + attached PDF to purchaser using SendGrid.

8. Tech Recommendations & Key Packages
Backend (Node.js + TypeScript)

Framework: NestJS (recommended) or Express + TypeScript

ORM/ODM: Mongoose (or TypeORM with MongoDB, but Mongoose is common)

Redis client: ioredis

Stripe SDK: stripe

PDF: pdfkit or puppeteer

QR code: qrcode

Validation: class-validator (Nest) or joi

Authentication: passport-jwt or custom JWT middleware

Environment: dotenv / config module

Logging: winston or Nest's logger

Frontend (React + Next.js)

Framework: next

UI: react-bootstrap (you prefer Bootstrap) or chakra-ui

State: React Context or SWR for data fetching

Payments: Stripe.js and @stripe/stripe-js + @stripe/react-stripe-js

Seatmap: custom SVG + React event handlers; optionally use D3 for complex maps

Dev / Infra

Docker for local development

GitHub Actions for CI

Deploy frontend to Vercel; backend to Render / Railway / Heroku / AWS ECS

MongoDB Atlas for managed DB

Redis: managed Redis (e.g., Redis Labs or AWS Elasticache)

9. Env Variables (example)

# Server
PORT=4000
NODE_ENV=production
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/ticketnow
REDIS_URL=redis://:<pass>@redis-host:6379
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
S3_BUCKET=ticketnow-assets
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
SENDGRID_API_KEY=...
FRONTEND_BASE_URL=https://ticketnow.app
14. MVP Roadmap (Suggested Prioritized Tasks)

Phase 0 — Setup

Repo + basic CI

Dev infra: MongoDB, Redis, S3, Stripe test account

Scaffold backend + frontend projects

Phase 1 — Core Flows

Event model + create/publish events (organizer UI)

Public event listing & event page

Ticket types + GA flow

Stripe checkout integration

Issue tickets (QR+PDF) and send email confirmations

Phase 2 — Reserved seating

Seatmap upload + client seat selection

Redis seat locking + finalization

Scanner app for check-in

Phase 3 — Polish

Organizer reporting CSV

Refunds & basic reporting

Payout model & KYC prep

15. Deliverables for First Sprint (Minimal)

Working frontend to view events and buy GA tickets

Backend endpoints for events, orders, payment integration

Email confirmation with a simple PDF ticket

Organizer event creation UI

Basic scanner to validate QR (dev-only token)

16. Next Suggestions

I can scaffold the project with a starter repo structure and sample code for:

NestJS backend with Mongo + Redis + Stripe webhook handling

Next.js frontend with Stripe checkout and simple seatmap

Sample Dockerfiles and GitHub Actions
Would you like me to generate starter code for the backend or the frontend first?

## I would like docker compose for local testing