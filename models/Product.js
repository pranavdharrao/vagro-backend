const mongoose = require("mongoose");
const ImageSchema = require("./ImageSchema");
const { Schema } = mongoose;

const productSchema = new Schema({
 
//   image:{
//     type:ImageSchema,
//     required:true
//   },

  title:{
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  brand: String,
  category: {
    type: String,
    required: true
  },
//   seller:{
//     type: String,
//     required: true,  
//   },
//   reviews: [{
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     },
//     title: String,
//     body: String,
//     rating: Number,
//     createdAt: {
//       type: Date,
//       default: Date.now
//     }
//   }],
  
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;