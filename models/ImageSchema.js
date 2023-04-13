const mongoose = require("mongoose");
const { Schema } = mongoose;

const ImageSchema = new Schema({
    link: { type: String, required: true },
    filename: {
        type: String,
        required: true,
    },
});

module.exports = ImageSchema;
