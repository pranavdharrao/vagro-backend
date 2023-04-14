const connectToMongo = require("./modules/db");
const express = require("express");
const dotenv = require("dotenv").config();
const port = process.env.PORT || 5000;
var cors = require("cors");

connectToMongo();
const app = express();


app.use(cors());
app.use(express.json());

// Available Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/product', require('./routes/product'));

app.listen(port, () => {
  console.log(`backend listening at http://localhost:${port}`);
});