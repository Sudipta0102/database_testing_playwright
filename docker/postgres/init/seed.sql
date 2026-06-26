-- ==========================================================
-- Roles
-- ==========================================================

INSERT INTO roles (name, description)
VALUES
    ('Admin', 'System administrator'),
    ('Manager', 'Business manager'),
    ('Customer', 'Regular customer');

-- ==========================================================
-- Permissions
-- ==========================================================

INSERT INTO permissions (name, description)
VALUES
    ('CREATE_PRODUCT', 'Create products'),
    ('UPDATE_PRODUCT', 'Update products'),
    ('DELETE_PRODUCT', 'Delete products'),
    ('VIEW_PRODUCT', 'View products'),
    ('PLACE_ORDER', 'Place customer orders'),
    ('VIEW_ORDER', 'View orders');

-- ==========================================================
-- Role Permissions
-- ==========================================================

INSERT INTO role_permissions (role_id, permission_id)
VALUES
    (1,1),
    (1,2),
    (1,3),
    (1,4),
    (1,5),
    (1,6),

    (2,2),
    (2,4),
    (2,6),

    (3,4),
    (3,5);

-- ==========================================================
-- Users
-- ==========================================================

INSERT INTO users
(
    first_name,
    last_name,
    username,
    email,
    is_active
)
VALUES

(
    'John',
    'Doe',
    'jdoe',
    'john.doe@test.com',
    TRUE
),

(
    'Jane',
    'Smith',
    'jsmith',
    'jane.smith@test.com',
    TRUE
),

(
    'Bob',
    'Wilson',
    'bwilson',
    'bob.wilson@test.com',
    FALSE
);

-- ==========================================================
-- User Roles
-- ==========================================================

INSERT INTO user_roles (user_id, role_id)
VALUES
    (1,1),
    (2,2),
    (3,3);

-- ==========================================================
-- Products
-- ==========================================================

INSERT INTO products
(
    name,
    description,
    price,
    quantity,
    is_available
)
VALUES

(
    'Mechanical Keyboard',
    'RGB Mechanical Keyboard',
    99.99,
    50,
    TRUE
),

(
    'Gaming Mouse',
    'Wireless Gaming Mouse',
    59.99,
    100,
    TRUE
),

(
    'USB-C Dock',
    'USB-C Multiport Dock',
    149.99,
    20,
    TRUE
),

(
    'Noise Cancelling Headphones',
    'Wireless Headphones',
    249.99,
    15,
    TRUE
);

-- ==========================================================
-- Orders
-- ==========================================================

INSERT INTO orders
(
    user_id,
    total_amount,
    status
)
VALUES

(
    2,
    159.98,
    'COMPLETED'
),

(
    2,
    249.99,
    'PENDING'
),

(
    3,
    99.99,
    'CANCELLED'
);

-- ==========================================================
-- Order Items
-- ==========================================================

INSERT INTO order_items
(
    order_id,
    product_id,
    quantity,
    unit_price
)
VALUES

(
    1,
    1,
    1,
    99.99
),

(
    1,
    2,
    1,
    59.99
),

(
    2,
    4,
    1,
    249.99
),

(
    3,
    1,
    1,
    99.99
);