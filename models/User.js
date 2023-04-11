const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: validateEmail,
            message: "Please provide a valid email",
        },
    },
    isProfileCompleted: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    
});

const User = mongoose.model("user", UserSchema);
User.createIndexes();
module.exports = User;