const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const { Pool } = require("pg");
const path = require("path");

const app = express();
const port = 3001;

// PostgreSQL Pool setup
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "products",
  password: "1235",
  port: 5432,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

// Static files for uploaded images
app.use("/images", express.static(path.join(__dirname, "images")));

// Routes
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
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
  const uploadPath = path.join(__dirname, "images", file.name);

  file.mv(uploadPath, (err) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(500).send(err);
    }
    res.json({ imageUrl: `/images/${file.name}` });
  });
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, image, category, price, quantity } = req.body;
    const result = await pool.query(
      "INSERT INTO products (name, image, category, price, quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, image, category, price, quantity]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, category, price, quantity } = req.body;
    const result = await pool.query(
      "UPDATE products SET name = $1, image = $2, category = $3, price = $4, quantity = $5 WHERE id = $6 RETURNING *",
      [name, image, category, price, quantity, id]
    );
    res.json(result.rows[0]);
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
