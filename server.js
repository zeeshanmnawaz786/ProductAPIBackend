const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas URI
const mongodbURI =process.env.DB_URL; 


async function run() {
  try {
  
 mongoose.connect(mongodbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,

})
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.log("Failed to connect to MongoDB:", error);
  }
}

run().catch(console.dir);

// Define the Product schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
});

const Product = mongoose.model("Product", productSchema);

// Rest of the CRUD routes and app.listen() can remain the same as before

app.post("/", async (req, res) => {
  console.log("Product created function");
  try {
    const { name, description, price } = req.body;
    console.log("DATA BODY ", req.body);

    // Validate the product data
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Product name is required" });
    }

    if (!price || price < 0) {
      return res
        .status(400)
        .json({ error: "Product price must be a positive number" });
    }

    const product = new Product({ name, description, price });
    console.log("check1");

    const savedProduct = await product.save({ wtimeout: 30000 });

    console.log("check2");
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to create product", errorMessage: error.message });
  }
});

// Get all products

app.get("/", async (req, res) => {
  console.log("Gett all products");
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to get products" });
  }
});

// Get a single product by ID
app.get("/api/products/:id", async (req, res) => {
  console.log("get Single Product");
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to get product" });
  }
});

// Update a product by ID
app.put("/api/products/:id", async (req, res) => {
  // console.log("Get Product by ID", req.params);
  try {
    const Updatedprduct= req.body;

    const id = req.params.id;
    const product = await Product.findOneAndUpdate( { _id: id } ,Updatedprduct ,  { new: true },);



    console.log(product)
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update product" });
  }
}); // Delete a product by ID
app.delete("/api/products/:id", async (req, res) => {
  console.log("Delete Product function called");
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndRemove(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to delete product", errorMessage: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
