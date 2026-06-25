# Database Testing Architecture

## Overview

This framework is designed to support scalable database validation for end-to-end UI, API, and hybrid automation scenarios using **PostgreSQL** and **Playwright**.

The architecture prioritizes:

* Test isolation
* High parallelism
* Maintainability
* Scalability
* CI/CD compatibility

The framework intentionally supports **DQL** (`SELECT`) and **DML** (`INSERT`, `UPDATE`, `DELETE`) operations. Schema migration (DDL) testing is considered outside the scope of the automation framework and should be executed independently.

---

# Design Goals

The database layer is designed around the following principles:

* Every test must execute against an isolated database transaction.
* Database assertions should remain independent from SQL implementation details.
* Repositories should contain only SQL logic.
* Playwright fixtures should own the transaction lifecycle.
* Database infrastructure should remain reusable regardless of deployment environment (Docker, local PostgreSQL, cloud-hosted PostgreSQL, etc.).

---

## Key Features

* **Transaction-Based Test Isolation** – Every database-enabled test runs within its own transaction and is automatically rolled back, ensuring deterministic execution and eliminating cross-test contamination.
* **Connection Pooling for Performance** – Worker-scoped PostgreSQL connection pooling minimizes connection overhead while supporting parallel Playwright execution.
* **Layered Database Architecture** – Configuration, infrastructure, repositories, assertions, and fixtures are separated to promote maintainability and clear ownership of responsibilities.
* **Reusable Repository & Assertion Layers** – SQL is encapsulated within repositories, while business-level database validations are centralized in reusable assertion methods to reduce duplication.
* **Scalable & CI/CD Ready** – Designed for large automation suites with parallel execution, domain-based repository organization, and environment-agnostic configuration supporting local, Docker, and cloud-hosted PostgreSQL instances.


---

# Directory Structure

```text
src/
├── assertions/
│   └── DatabaseAssertions.ts
│
├── fixtures/
│   └── database.fixture.ts
│
├── infra/
│   └── database/
│       ├── DatabaseConfig.ts
│       ├── DatabasePool.ts
│       └── DatabaseSession.ts
│
├── repositories/
│   ├── auth/
│   ├── orders/
│   ├── products/
│   └── ...
│
├── factories/
│   ├── UserFactory.ts
│   ├── ProductFactory.ts
│   └── ...
│
├── types/
│   ├── User.ts
│   ├── Order.ts
│   └── ...
```

---

# Component Responsibilities

## DatabaseConfig

Responsible only for configuration.

* Reads environment variables
* Validates configuration
* Exposes database settings

No database connections are created here.

---

## DatabasePool

Worker-scoped component responsible for:

* Creating the PostgreSQL connection pool
* Acquiring connections
* Releasing connections
* Closing the pool

The pool does **not** execute SQL.

---

## DatabaseSession

Represents an isolated database session for a single Playwright test.

Responsibilities:

* Acquire connection
* Begin transaction
* Execute queries
* Rollback transaction
* Release connection

Each Playwright test receives a fresh `DatabaseSession`.

---

## Database Fixture

The database fixture owns the transaction lifecycle.

```text
beforeEach
    │
    ▼
Acquire Connection
    │
    ▼
BEGIN
    │
    ▼
Execute Test
    │
    ▼
ROLLBACK
    │
    ▼
Release Connection
```

Tests never manually begin or rollback transactions.

---

## Repositories

Repositories encapsulate SQL.

Responsibilities:

* Query construction
* Data retrieval
* Data modification

Repositories should not:

* perform assertions
* interact with Playwright
* manage transactions

Example:

```ts
await userRepository.getUserByEmail(session, email);
```

---

## DatabaseAssertions

Contains reusable business assertions.

Example:

```ts
await dbAssertions.expectUserExists(email);

await dbAssertions.expectOrderDeleted(orderId);
```

Internally:

```text
Assertion
    │
    ▼
Repository
    │
    ▼
DatabaseSession
```

This keeps tests expressive while preventing SQL duplication.

---

## Test Data Factories

Factories create test-owned data.

Example:

```ts
const user = await userFactory.create(session);
```

Instead of relying on shared seeded records, each test owns its own data.

Because every test runs inside a transaction, factory-created data is automatically removed during rollback.

---

# Transaction Strategy

Every database-enabled test executes inside a dedicated transaction.

```text
BEGIN;

Run Test

ROLLBACK;
```

Benefits:

* No shared data between tests
* No database cleanup scripts
* No backup/restore operations
* Fast execution
* Deterministic results

---

# Test Execution Flow

```text
Playwright Test
        │
        ▼
database.fixture
        │
        ▼
DatabaseSession
        │
      BEGIN
        │
        ▼
Repositories
        │
        ▼
DatabaseAssertions
        │
        ▼
PostgreSQL
        │
     ROLLBACK
```

---

# Local Development

The framework is deployment-independent.

Developers may connect to:

* Local PostgreSQL
* Docker PostgreSQL
* Dedicated development database
* Managed PostgreSQL service

Only configuration changes.

No framework code changes are required.

---

# CI/CD

The recommended CI strategy is:

```text
Start PostgreSQL Container
        │
        ▼
Run migrations
        │
        ▼
Seed database
        │
        ▼
Execute Playwright tests
        │
        ▼
Destroy container
```

Each pipeline executes against a fresh PostgreSQL instance.

---

# Scalability Considerations

The architecture is designed for large automation suites.

Typical target scale:

* 1,000+ automated tests
* 50+ application pages
* 40+ API endpoints
* Parallel Playwright workers
* Multiple engineers contributing simultaneously

The separation of configuration, infrastructure, repositories, assertions, and fixtures minimizes coupling and allows each layer to evolve independently.

Repositories are grouped by business domain rather than accumulating into a single folder, improving discoverability and maintainability as the application grows.

---

# Maintainability Considerations

Several deliberate design decisions improve long-term maintainability:

* Single Responsibility Principle across infrastructure components
* SQL isolated within repositories
* Assertions isolated from query implementation
* Transaction management centralized within fixtures
* Environment configuration separated from database infrastructure
* Strong typing for repository return models
* Factory-based test data creation to eliminate hidden dependencies on seeded data

These decisions reduce duplication, simplify future refactoring, and enable the framework to evolve without impacting existing tests.

---

# Why Transactions Instead of Backup/Restore?

Some database testing frameworks rely on database backups (`pg_dump`) and restoration (`psql`) between test runs.

This framework intentionally uses transaction rollback instead.

Advantages:

* Significantly faster execution
* Better support for parallel execution
* No temporary SQL dumps
* No database restore overhead
* Improved developer feedback cycle

Because the framework targets DML and DQL operations, transaction rollback provides excellent isolation while remaining highly performant.

---

# Future Extensions

The architecture intentionally leaves room for future enhancements, including:

* Multiple database providers
* Read/write database routing
* Query logging
* Performance metrics
* Database health checks
* Repository base classes
* Advanced assertion libraries

These additions can be introduced without altering existing test implementations due to the clear separation of responsibilities across the database layer.
