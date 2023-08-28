const mongoose = require("mongoose");
const RegisterUserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    accountNumber: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
})

const User = mongoose.model("RegisterUser", RegisterUserSchema)

module.exports = User;