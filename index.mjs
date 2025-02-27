import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import { config } from "dotenv";
config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// URI
const mongodbURI = process.env.DB_URL;

let db;

async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(mongodbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = client.db();
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    app.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

connectToDatabase();

// handle errors
function handleError(res, status, message) {
  res.status(status).json({ error: message });
}

app.use((req, res, next) => {
  if (!db) {
    return handleError(res, 500, "Database connection is not ready");
  }
  next();
});

// Create a product
app.post("/postProduct", async (req, res) => {
  console.log("Product created function");
  try {
    const { name, description, price } = req.body;
    if (!name || name.trim() === "") {
      return handleError(res, 400, "Product name is required");
    }

    if (!price || price < 0) {
      return handleError(res, 400, "Product price must be a positive number");
    }

    const product = { name, description, price };
    console.log(product);

    const result = await db.collection("test").insertOne(product);
    const savedProduct = result.insertedId;

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
    const products = await db.collection("test").find().toArray();
    console.log(products);
    res.json(products);
  } catch (error) {
    console.log(error.message);
    handleError(res, 500, "Failed to get products");
  }
});

// Update product by ID
app.put("/api/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price } = req.body;

    // Validation
    if (!name || name.trim() === "") {
      return handleError(res, 400, "Product name is required");
    }

    if (!price || price < 0) {
      return handleError(res, 400, "Product price must be a positive number");
    }

    const updatedProduct = { name, description, price };
    const result = await db
      .collection("test")
      .updateOne({ _id: new ObjectId(productId) }, { $set: updatedProduct });

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
    const result = await db
      .collection("test")
      .deleteOne({ _id: new ObjectId(productId) });

    if (result.deletedCount === 0) {
      return handleError(res, 404, "Product not found");
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    handleError(res, 500, "Failed to delete product");
  }
});

app.get("/", async (req, res) => {
  res.send("Server is running");
});
