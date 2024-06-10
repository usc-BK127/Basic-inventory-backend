CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    image TEXT,
    category VARCHAR(100),
    price DECIMAL(10, 2),
    quantity INTEGER
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

