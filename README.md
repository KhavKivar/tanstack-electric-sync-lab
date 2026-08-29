# TanStack Electric Sync Lab

A focused real-time data experiment built with TanStack Start, TanStack DB, ElectricSQL, Drizzle, and PostgreSQL. The UI performs optimistic product mutations while Electric streams database changes back into a live collection.

## Data flow

```text
React UI -> TanStack DB collection -> TanStack server function -> PostgreSQL
    ^                                                       |
    |---------------- Electric shape stream ----------------|
```

The example supports creating and deleting products. Mutations are persisted through server functions, while `useLiveQuery` keeps the rendered collection synchronized.

## Getting started

Requirements: Node.js 20+, Docker, and PostgreSQL.

```bash
npm install
cp .env.example .env
docker compose up -d
npm run dev
```

The web application starts on `http://localhost:3000`; the local Electric service listens on `http://localhost:30000`. Create the `products` table using `drizzle/schema.ts` before opening the application.

## Configuration

- `DATABASE_URL`: server-side PostgreSQL connection used by Drizzle
- `ELECTRIC_DATABASE_URL`: direct PostgreSQL connection used by Electric
- `ELECTRIC_URL`: Electric service origin
- `ELECTRIC_SOURCE_ID` and `ELECTRIC_SECRET`: optional hosted-service credentials

## Validation

```bash
npm run lint
npm run check
npm run build
```

Committed configuration contains local placeholders only.
