import express from "express";
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890', 20)
import { MongoClient } from "mongodb"

// import './config/index.mjs'

const mongodbURI = `mongodb+srv://ylm3GapOPhSkGXml:167StUDOVCJpQBMn@products.eq1eekg.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(mongodbURI);
const database = client.db('ecom');
const productsCollection = database.collection('products');


const app = express();
app.use(express.json());

// For reading all products from the database
app.get("/", async (req, res) => {
  const allProducts = await productsCollection.find().toArray();
  res.send({
    message: "all products",
    data: allProducts
  });
});

// For creating a product in the database
app.post("/", async (req, res) => {
  const { name, price, description } = req.body;
  if (!name || !price || !description) {
    res.status(400).send({ message: "Please provide name, price, and description for the product." });
    return;
  }

  const doc = {
    id: nanoid(),
    name,
    price,
    description,
  };
  await productsCollection.insertOne(doc);
  res.status(201).send({ message: "created product", data: doc });
});

// For updating a product in the database
app.put("/product/:id", async (req, res) => {
  const productId = req.params.id;
  const { name, price, description } = req.body;
  const updatedFields = {};
  if (name) updatedFields.name = name;
  if (price) updatedFields.price = price;
  if (description) updatedFields.description = description;

  const updatedProduct = await productsCollection.findOneAndUpdate(
    { id: productId },
    { $set: updatedFields },
    { returnOriginal: false }
  );

  if (!updatedProduct.value) {
    res.status(404);
    res.send({ message: "product not found" });
  } else {
    res.send({
      message: "product is updated with id: " + updatedProduct.value.id,
      data: updatedProduct.value,
    });
  }
});

// For deleting a product from the database
app.delete("/product/:id", async (req, res) => {
  const productId = req.params.id;
  const deleteResult = await productsCollection.deleteOne({ id: productId });
  if (deleteResult.deletedCount === 0) {
    res.status(404);
    res.send({ message: "product not found" });
  } else {
    res.send({ message: "product is deleted" });
  }
});




const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});