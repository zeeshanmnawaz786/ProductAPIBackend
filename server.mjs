import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import { config } from 'dotenv';
config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas URI
const mongodbURI = process.env.DB_URL; 

let db;

async function run() {
  try {
    const client = await MongoClient.connect(mongodbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = client.db(); // Get the database instance
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.log("Failed to connect to MongoDB:", error);
  }
}

run().catch(console.dir);

// Define the collection name
const collectionName = "products";

// Create a function to handle errors
function handleError(res, status, message) {
  res.status(status).json({ error: message });
}

// Create a product
app.post("/", async (req, res) => {
  console.log("Product created function");
  try {
    const { name, description, price } = req.body;

    // Validate the product data
    if (!name || name.trim() === "") {
      return handleError(res, 400, "Product name is required");
    }

    if (!price || price < 0) {
      return handleError(res, 400, "Product price must be a positive number");
    }

    const product = { name, description, price };
    const result = await db.collection(collectionName).insertOne(product);
    const savedProduct = result.ops[0];

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);
    handleError(res, 500, "Failed to create product");
  }
});

// Get all products
app.get("/check", async (req, res) => {
  console.log("Get all products");
  try {
    const products = await db.collection(collectionName).find().toArray();
    res.json(products);
  } catch (error) {
    console.log(error);
    handleError(res, 500, "Failed to get products");
  }
});

// Get a single product by ID
app.get("/api/products/:id", async (req, res) => {
  console.log("Get Single Product");
  try {
    const productId = req.params.id;
    const product = await db.collection(collectionName).findOne({ _id: ObjectId(productId) });
    if (!product) {
      return handleError(res, 404, "Product not found");
    }
    res.json(product);
  } catch (error) {
    console.log(error);
    handleError(res, 500, "Failed to get product");
  }
});

// Update a product by ID
app.put("/api/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price } = req.body;

    // Validate the product data
    if (!name || name.trim() === "") {
      return handleError(res, 400, "Product name is required");
    }

    if (!price || price < 0) {
      return handleError(res, 400, "Product price must be a positive number");
    }

    const updatedProduct = { name, description, price };
    const result = await db.collection(collectionName).updateOne(
      { _id: ObjectId(productId) },
      { $set: updatedProduct }
    );

    if (result.modifiedCount === 0) {
      return handleError(res, 404, "Product not found");
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    handleError(res, 500, "Failed to update product");
  }
});

// Delete a product by ID
app.delete("/api/products/:id", async (req, res) => {
  console.log("Delete Product function called");
  try {
    const productId = req.params.id;
    const result = await db.collection(collectionName).deleteOne({ _id: ObjectId(productId) });

    if (result.deletedCount === 0) {
      return handleError(res, 404, "Product not found");
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    handleError(res, 500, "Failed to delete product");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
