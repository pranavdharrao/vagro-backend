const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const fetchUser = require('../middleware/fetchUser');
const { body, validationResult } = require('express-validator');


// ROUTE 1: Add a new Product using: POST "/api/product/addproduct". Login required
router.post('/addproduct', fetchUser, [
    body("title", "Enter valid Product name").exists(),
    body("description", "Enter valid description")
      .isLength({ min: 200 })
      .withMessage("Description should have minimum 200 characters"),
    body("brand", "Specify brand to which product belongs"),
    body("category", "Specify category of product"),

  ], async (req, res) => {
        try {
            const { title, description, brand, category } = req.body;

            // If there are errors, return Bad request and the errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const product = new Product({
                title, description, brand, category, user: req.user.id
            })
            const savedProduct = await product.save()

            res.json(savedProduct)

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    })



// ROUTE 2: Find the product with the given ID using: GET "/api/products/:id". Login required
router.get('/products/:id', fetchUser, async (req, res) => {
    try {
        const product = await Product.findById(id);
        if (!product) {
            res.status(404).send();
          } else {
            res.json(product)
          }
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


// ROUTE 3: Update an existing Product details using: PUT "/api/product/updateproduct". Login required
router.patch('/updateproduct/:id', fetchUser, async (req, res) => {
    const { title, description, brand, category } = req.body;
    try {
        // Create a newProduct object
        const newProduct = {};
        if (title) { newProduct.title = title };
        if (description) { newProduct.description = description };
        if (brand) { newProduct.brand = brand };
        if (category) { newProduct.category = category };

        // Find the product to be updated and update it
        let product = await Product.findById(req.params.id);
        if (!product) { return res.status(404).send("Product not found") }

        if (product.user.toString() !== req.user.id) {
            return res.status(401).send("Access denied!");
        }
        product = await Product.findByIdAndUpdate(req.params.id, { $set: newProduct }, { new: true })
        res.json({ product });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 4: Delete an existing Product using: DELETE "/api/product/deleteproduct". Login required
router.delete('/deleteproduct/:id', fetchUser, async (req, res) => {
    try {
        // Find the product to be delete and delete it
        let product = await Product.findById(req.params.id);
        if (!product) { return res.status(404).send("Product not found") }

        // Allow deletion only if user owns that product
        if (product.user.toString() !== req.user.id) {
            return res.status(401).send("Access denied!");
        }

        product = await Product.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Product has been deleted", product: product });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router