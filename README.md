# VIGILITY - Product Analytics Dashboard

VIGILITY is a full-stack interactive product analytics dashboard that allows users to track feature clicks, view trends over time, and filter data by date, age, and gender. 

## 1. Project Overview
- **Backend**: Node.js, Express, PostgreSQL with Sequelize ORM. Features stateless JWT authentication and a RESTful API.
- **Frontend**: React (Vite JS), Chart.js, js-cookie for persistent filter states. Fully responsive dark theme.

## 2. Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (running locally on port 5432)

### Backend Setup
1. Open the `/backend` directory: `cd backend`
2. Install dependencies: `npm install`
3. Create database in psql: `CREATE DATABASE vigility_db;`
4. Make sure your `.env` is configured (one is provided for local setup).
5. Run the seed script: `npm run seed`
6. Start the development server: `npm run dev`

### Frontend Setup
1. Open the `/frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Vite dev server: `npm run dev`

Navigate to `http://localhost:5173` to view the dashboard!

## 3. API Endpoints

### Authentication
- `POST /register`: Accepts `{ username, password, age, gender }`. Returns JWT token and user info.
- `POST /login`: Accepts `{ username, password }`. Returns JWT token and user info.

### Analytics (Protected via Bearer Token)
- `POST /track`: Accepts `{ feature_name }`. Records a feature click event for the authenticated user.
- `GET /analytics`: Accepts query parameters (`start_date`, `end_date`, `age`, `gender`). Returns aggregated `barData` and `lineData`.

## 4. Seed Instructions
Running `npm run seed` in the `backend` folder will connect to PostgreSQL, drop the existing schemas (force sync), recreate the `User` and `FeatureClick` tables, and generate:
- 10 predefined users (alice, bob, charlie, etc.) with password `password123`.
- 80 mock tracking events spread randomly across various chart components and features over the past 60 days.

## 5. Architectural Choices
- **Monorepo Structure**: Kept frontend and backend separate but adjacent for easy full-stack debugging while maintaining the ability to deploy them independently.
- **Sequelize ORM**: Provided rapid schema definitions, robust validations, and easy relationship mapping between Users and their Clicks.
- **js-cookie**: Used to persist dashboard filters. Since cookies aren't strictly required for auth here (we use localStorage for JWT), we use them just for UI persistence so the dashboard "remembers" filter states for up to 7 days upon reload.
- **Fire-and-Forget Tracking**: Tracking events are fired without blocking the UI, providing a seamless user experience.

## 6. Scaling to 1 Million Write-Events Per Minute

If this dashboard needed to handle 1 million `POST /track` events per minute (~16,666 requests per second), the current direct-to-PostgreSQL architecture would immediately bottleneck at the database connection pool and disk I/O.

To handle this massive ingestion rate, the backend architecture must be reshaped:

1. **Message Queue (Kafka or Redis Streams)**: Direct synchronous database writes are too slow. We must introduce a message broker. When the Express app receives a track event, it will synchronously validate it, but immediately publish the payload to a Kafka topic or Redis Stream. It then returns a `202 Accepted` to the client. This decouples the edge API from the database.
2. **Write-Behind Caching & Batch Ingestion**: Specialized worker microservices will consume events from the message queue, aggregate them into small batches in memory (write-behind caching), and perform bulk inserts into the database. This drastically reduces database transactions per second.
3. **Horizontal Scaling of Express Workers**: I would containerize the Node.js application and run multiple instances managed by a load balancer. Since requests are stateless and only push to a queue, Express can scale horizontally effortlessly to handle the 16K RPS.
4. **Time-Series Optimized Storage**: Standard PostgreSQL B-Trees degrade quickly with millions of rows of time-stamped log data. The analytics database should be migrated to a specialized time-series database like **TimescaleDB** or a columnar datastore like **ClickHouse**, which are built for high-throughput ingestion and lightning-fast OLAP queries.
5. **Read Replicas**: Finally, because `GET /analytics` requires aggregations over massive datasets, read-heavy workloads must be isolated. I would implement database Read Replicas to ensure heavy analytic queries never block incoming writes.
