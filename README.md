# ShortLink Pro — Distributed URL Shortener

A production-grade URL shortener built with a layered architecture, distributed ID generation, Redis caching, JWT authentication, and event-driven analytics. Designed to demonstrate real backend engineering practices — not just a "hello world" shortener.

---

## Features

- **URL Shortening** — generate short codes automatically or use a custom alias
- **Expiring Links** — set an optional expiry date; expired links are cleaned up automatically via MongoDB TTL indexes
- **Distributed ID Generation** — atomic block-range allocator avoids ID collisions across multiple server instances without a database call on every request
- **Redis Caching** — cache-first redirect lookups for low-latency responses at scale
- **Authentication** — JWT-based signup/login so users can manage their own links
- **User Dashboard** — view, manage, and track all links created by the authenticated user
- **QR Code Generation** — every short link can generate a scannable QR code
- **Event-Driven Analytics** — click events (timestamp, referrer, IP, user agent) are published to Kafka/RabbitMQ and processed asynchronously by a background worker, keeping the redirect's critical path fast
- **Rate Limiting** — per-IP request throttling to prevent abuse and spam link generation
- **Input Validation** — schema-based request validation using Zod
- **Centralized Error Handling** — custom typed error classes mapped to consistent HTTP responses
- **Testing** — unit tests (mocked dependencies) and integration tests (Supertest against a live test database)
- **Dockerized** — full local dev environment via `docker-compose` (API, MongoDB, Redis, Kafka/RabbitMQ)

---

## Architecture

The project follows a strict layered architecture, where each layer only talks to the layer directly below it:

```
Routes → Controllers → Services → Repositories → Database
                          ↓
                        Cache
```

| Layer | Responsibility | Can call | Cannot call |
|---|---|---|---|
| Routes | Wire URLs to controllers | Controllers | Services, repositories, DB directly |
| Controllers | Parse HTTP requests, shape responses | Services | Repositories, DB, cache directly |
| Services | Core business logic | Repositories, cache, infrastructure | `req`/`res`, Express anything |
| Repositories | Data access | DB client only | Cache, services |
| Cache | Fast key-value lookups | Redis client only | DB, services |

This keeps every layer independently testable — services are unit tested with mocked repositories and caches, with zero real database calls required.

---

## Tech Stack

| Concern | Technology |
|---|---|
| Runtime | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Cache | Redis |
| Auth | JWT |
| Messaging | Kafka / RabbitMQ |
| Validation | Zod |
| Testing | Jest, Supertest |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |

---

## Project Structure

```
.
├── server.js                       # Entry point — starts the app, handles graceful shutdown
├── src/
│   ├── app.js                      # Builds and configures the Express app
│   ├── config/
│   │   ├── index.js                 # Loads and validates environment variables
│   │   └── database.js              # MongoDB connection lifecycle
│   ├── api/
│   │   ├── routes/                  # Route definitions
│   │   ├── controllers/             # Request/response handling
│   │   ├── middleware/              # Validation, rate limiting, auth, error handling
│   │   └── validators/              # Zod schemas
│   ├── services/                    # Core business logic
│   ├── repositories/                # Data access layer
│   ├── cache/                       # Redis cache wrapper
│   ├── models/                      # Mongoose schemas
│   ├── infrastructure/
│   │   ├── idGenerator/             # base62 encoding + distributed range allocator
│   │   └── queue/                   # Kafka/RabbitMQ producer
│   └── utils/
│       └── errors.js                # Custom error classes
├── workers/
│   └── analyticsConsumer.js         # Background worker — consumes click events
├── tests/
│   ├── unit/                        # Isolated logic tests (mocked dependencies)
│   └── integration/                 # Full request/response tests against a real DB
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (recommended for local dev)
- MongoDB and Redis (if not using Docker)

### Installation

```bash
git clone https://github.com/your-username/shortlink-pro.git
cd shortlink-pro
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

MONGODB_URI=mongodb://localhost:27017/url_shortener
MONGODB_DB_NAME=url_shortener

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_TTL=3600

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

ID_BLOCK_SIZE=1000
BASE62_ALPHABET=0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ

KAFKA_BROKER=localhost:9092
KAFKA_CLIENT_ID=url-shortener
```

### Running with Docker (recommended)

```bash
docker-compose up --build
```

This starts the API, MongoDB, Redis, and Kafka/RabbitMQ together.

### Running locally

```bash
# Start the API server
npm run dev

# In a separate terminal, start the analytics worker
npm run worker
```

---

## API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/signup` | Register a new user |
| POST | `/api/v1/auth/login` | Log in, receive a JWT |

### URL Shortening

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| POST | `/api/v1/shorten` | Optional | Create a short URL |
| GET | `/:shortCode` | No | Redirect to the original URL |
| GET | `/api/v1/shorten/:shortCode/qr` | No | Get a QR code for a short URL |

**Example — create a short URL:**

```bash
curl -X POST http://localhost:3000/api/v1/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "long_url": "https://example.com/some/very/long/path",
    "custom_alias": "my-link",
    "expires_at": "2026-12-31T23:59:59Z"
  }'
```

**Response:**

```json
{
  "short_url": "http://localhost:3000/my-link"
}
```

### Dashboard & Analytics

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| GET | `/api/v1/dashboard/links` | Yes | List all links created by the authenticated user |
| GET | `/api/v1/analytics/:shortCode/stats` | Yes | Click count, timeline, referrer breakdown |

Full interactive API documentation is available via Swagger/OpenAPI at:

```
http://localhost:3000/api-docs
```

---

## How It Works

### Distributed ID Generation

Instead of hitting the database on every single short-code creation, each server instance atomically reserves a block of 1,000 IDs at once (via a MongoDB atomic `$inc` on a shared counter document) and hands them out from memory. This means:

- No collisions across concurrent requests or multiple server instances
- ~99.9% of ID generations require zero database calls
- Horizontally scalable without coordination between instances

### Caching Strategy

Redirects check Redis first. On a cache miss, the record is fetched from MongoDB, validated for expiry, and written back into Redis with a TTL — so subsequent requests for the same short code are served without touching the database.

### Analytics Pipeline

Click events are **never awaited** on the redirect's critical path. Instead, `resolveShortCode()` fires an event onto a Kafka/RabbitMQ topic and immediately returns the redirect response. A separate background worker (`workers/analyticsConsumer.js`) consumes these events and writes aggregated statistics to the database — meaning analytics tracking never adds latency to the user-facing redirect.

---

## Testing

```bash
# Unit tests (mocked dependencies, no real DB/Redis needed)
npm test

# Integration tests (requires a running test DB — see docker-compose.test.yml)
npm run test:integration
```

Unit tests cover service-layer logic in isolation (successful creation, duplicate alias handling, expired link handling, cache-hit short-circuiting). Integration tests exercise full request/response cycles against a real database, including validation and rate limiting.

---

## CI/CD

GitHub Actions runs on every push and pull request:

1. Install dependencies
2. Run lint checks
3. Run unit tests
4. Run integration tests against a containerized test database
5. Build the Docker image

See `.github/workflows/ci.yml` for the full pipeline.

---

## Deployment

The app is deployed on [Render / a VPS] with the following setup:

- Dockerized API service
- Managed MongoDB instance
- Managed Redis instance
- Kafka/RabbitMQ broker
- Environment variables configured via the platform's secrets manager

---

## Roadmap

- [ ] Redis cache invalidation on link update/delete
- [ ] Password-protected links
- [ ] Custom domains
- [ ] Link preview metadata (Open Graph scraping)
- [ ] Structured logging + Prometheus/Grafana monitoring

---

## License

MIT
