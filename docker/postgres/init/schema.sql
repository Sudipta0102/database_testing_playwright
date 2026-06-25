-- ==========================================================
-- Users
-- ==========================================================

CREATE TABLE users (

    id              SERIAL PRIMARY KEY,

    first_name      VARCHAR(100) NOT NULL,

    last_name       VARCHAR(100) NOT NULL,

    username        VARCHAR(100) UNIQUE NOT NULL,

    email           VARCHAR(255) UNIQUE NOT NULL,

    is_active       BOOLEAN NOT NULL DEFAULT TRUE,

    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

);

-- ==========================================================
-- Roles
-- ==========================================================

CREATE TABLE roles (

    id              SERIAL PRIMARY KEY,

    name            VARCHAR(100) UNIQUE NOT NULL,

    description     TEXT

);

-- ==========================================================
-- Permissions
-- ==========================================================

CREATE TABLE permissions (

    id              SERIAL PRIMARY KEY,

    name            VARCHAR(100) UNIQUE NOT NULL,

    description     TEXT

);

-- ==========================================================
-- User Roles (Many-to-Many)
-- ==========================================================

CREATE TABLE user_roles (

    user_id         INTEGER NOT NULL,

    role_id         INTEGER NOT NULL,

    PRIMARY KEY (user_id, role_id),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE

);

-- ==========================================================
-- Role Permissions (Many-to-Many)
-- ==========================================================

CREATE TABLE role_permissions (

    role_id         INTEGER NOT NULL,

    permission_id   INTEGER NOT NULL,

    PRIMARY KEY (role_id, permission_id),

    FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE,

    FOREIGN KEY (permission_id)
        REFERENCES permissions(id)
        ON DELETE CASCADE

);

-- ==========================================================
-- Products
-- ==========================================================

CREATE TABLE products (

    id              SERIAL PRIMARY KEY,

    name            VARCHAR(255) NOT NULL,

    description     TEXT,

    price           DECIMAL(10,2) NOT NULL,

    quantity        INTEGER NOT NULL,

    is_available    BOOLEAN NOT NULL DEFAULT TRUE,

    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

);

-- ==========================================================
-- Orders
-- ==========================================================

CREATE TABLE orders (

    id              SERIAL PRIMARY KEY,

    user_id         INTEGER NOT NULL,

    total_amount    DECIMAL(10,2) NOT NULL,

    status          VARCHAR(50) NOT NULL,

    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE

);

-- ==========================================================
-- Order Items
-- ==========================================================

CREATE TABLE order_items (

    id              SERIAL PRIMARY KEY,

    order_id        INTEGER NOT NULL,

    product_id      INTEGER NOT NULL,

    quantity        INTEGER NOT NULL,

    unit_price      DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    FOREIGN KEY (product_id)
        REFERENCES products(id)

);