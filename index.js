const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const { Pool } = require("pg");

const app = express();
const port = 3001;

// PostgreSQL Pool setup
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

// Routes
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, encode(image, 'base64') AS image, category, price, quantity FROM products"
    );
    const products = result.rows.map((product) => ({
      ...product,
      image: `data:image/jpeg;base64,${product.image}`,
    }));
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.post("/api/upload", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const file = req.files.file;
  const imageBuffer = file.data;

  res.json({ imageBuffer: imageBuffer.toString("base64") });
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, image, category, price, quantity } = req.body;
    const imageBuffer = Buffer.from(image, "base64");

    const result = await pool.query(
      "INSERT INTO products (name, image, category, price, quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, imageBuffer, category, price, quantity]
    );
    const product = result.rows[0];
    product.image = `data:image/jpeg;base64,${image}`;

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, category, price, quantity } = req.body;
    const imageBuffer = Buffer.from(image, "base64");

    const result = await pool.query(
      "UPDATE products SET name = $1, image = $2, category = $3, price = $4, quantity = $5 WHERE id = $6 RETURNING *",
      [name, imageBuffer, category, price, quantity, id]
    );
    const product = result.rows[0];
    product.image = `data:image/jpeg;base64,${image}`;

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    res.send("Product deleted successfully");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Category Routes
app.get("/api/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.put("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await pool.query(
      "UPDATE categories SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM categories WHERE id = $1", [id]);
    res.send("Category deleted successfully");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
