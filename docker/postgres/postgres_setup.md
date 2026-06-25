# PostgreSQL Setup

This project uses a **Dockerized PostgreSQL** instance for database validation with Playwright.

---

# Directory Structure

```text
docker/
└── postgres/
    ├── init/
    │   ├── schema.sql
    │   └── seed.sql
    └── postgres_setup.md
```

---

# Docker Compose

The project root contains:

```text
docker-compose.yml
```

The compose file provisions a PostgreSQL container using the official PostgreSQL image.

Its responsibilities include:

* Creating a PostgreSQL instance.
* Reading configuration from `.env`.
* Initializing the database.
* Persisting database data using Docker volumes.
* Providing a consistent environment across local development and CI.

Start PostgreSQL:

```bash
docker compose up -d
```

Stop PostgreSQL:

```bash
docker compose down
```

Recreate the database:

```bash
docker compose down -v
docker compose up -d
```

---

# Database Initialization

PostgreSQL automatically executes every SQL file located under:

```text
docker/postgres/init/
```

during the **first startup** of the container.

Initialization order:

```text
schema.sql
      ↓
seed.sql
```

The schema is created first, followed by insertion of deterministic sample data.

> **Note**
>
> Initialization scripts are executed only when the PostgreSQL data volume is created for the first time.
>
> If the volume already exists, PostgreSQL skips these scripts.

To recreate the database from scratch:

```bash
docker compose down -v
docker compose up -d
```

---

# schema.sql

`schema.sql` defines the complete relational database used throughout the framework.

Rather than modelling a full production application, the schema is intentionally **small but relationally rich**. It demonstrates advanced database validation techniques without unnecessary business complexity.

The schema includes:

* One-to-Many relationships
* Many-to-Many relationships
* Composite Primary Keys
* Foreign Key Constraints
* Cascade Deletes
* Join Tables
* Aggregate Queries
* Transaction Rollback
* CRUD Operations

The schema contains the following tables:

```text
users
roles
permissions
user_roles
role_permissions
products
orders
order_items
```
---

# Authentication Model

The authentication model implements a typical **Role-Based Access Control (RBAC)** design.

```text
users
    ↕
user_roles
    ↕
roles
    ↕
role_permissions
    ↕
permissions
```

The seeded dataset contains three predefined roles.

| Role     | Permissions |
| -------- | ----------: |
| Admin    |           6 |
| Manager  |           3 |
| Customer |           2 |

This model enables realistic validation scenarios such as:

* Verify a user has been assigned the correct role.
* Verify a user inherits permissions from assigned roles.
* Verify a role contains multiple permissions.
* Validate many-to-many relationships.
* Verify role updates.
* Execute complex authorization joins.

Example:

```sql
SELECT
    u.email,
    r.name AS role,
    p.name AS permission
FROM users u
JOIN user_roles ur
    ON ur.user_id = u.id
JOIN roles r
    ON r.id = ur.role_id
JOIN role_permissions rp
    ON rp.role_id = r.id
JOIN permissions p
    ON p.id = rp.permission_id
WHERE u.email = 'john.doe@test.com';
```

---

# E-commerce Model

The ordering model represents a simplified e-commerce workflow.

```text
users
    ↓
orders
    ↓
order_items
    ↓
products
```

This enables realistic end-to-end database validation after UI or API operations.

Typical validation scenarios include:

* Verify an order is created after checkout.
* Verify the correct user owns the order.
* Verify purchased products are linked correctly.
* Verify inventory quantities are updated.
* Verify calculated order totals.
* Verify cascade delete behaviour.
* Verify transaction rollback.
* Execute aggregate reporting queries.

Example:

```sql
SELECT
    o.id,
    u.email,
    p.name,
    oi.quantity,
    oi.unit_price
FROM orders o
JOIN users u
    ON u.id = o.user_id
JOIN order_items oi
    ON oi.order_id = o.id
JOIN products p
    ON p.id = oi.product_id
WHERE o.id = 1;
```

Aggregate example:

```sql
SELECT
    u.email,
    COUNT(o.id) AS total_orders,
    SUM(o.total_amount) AS total_spent
FROM users u
JOIN orders o
    ON o.user_id = u.id
GROUP BY u.email;
```

---

# seed.sql

`seed.sql` inserts deterministic sample data after the schema has been created.

The dataset includes:

* Users
* Roles
* Permissions
* User-role mappings
* Role-permission mappings
* Products
* Orders
* Order items

The data is intentionally compact while supporting:

* CRUD operations
* Repository implementations
* Database assertions
* Complex joins
* Aggregate queries
* Transaction rollback
* End-to-end workflow validation

Because the seed data is deterministic, every developer and every CI run begins with the same baseline.

---

# How to set-up

The project becomes completely self-contained.

```text
git clone
      ↓
docker compose up -d
      ↓
npm install
      ↓
npx playwright test
```

---

# Database Lifecycle

Every database-enabled Playwright test follows the same lifecycle.

```text
Acquire Connection
        ↓
BEGIN Transaction
        ↓
Execute Test
        ↓
Database Validation
        ↓
ROLLBACK Transaction
        ↓
Release Connection
```

The rollback guarantees that every test leaves the database in exactly the same state in which it started.

No cleanup scripts or database restores are required.

---

# Best Practices

* Treat `schema.sql` as the single source of truth for the database structure.
* Keep `seed.sql` deterministic and stable.
* Do not modify seed data directly inside tests.
* Use repositories for database access.
* Use factories to generate additional test data.
* Use assertions to verify business rules rather than writing SQL directly inside tests.
* If the schema changes, update both `schema.sql` and `seed.sql`.
* After modifying initialization scripts, recreate the Docker volume to apply the changes.
