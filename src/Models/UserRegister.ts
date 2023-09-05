const mongoose = require("mongoose");
const RegisterUserSchema = new mongoose.Schema({ 
    business_email: { type: String, required: true },
    business_mobile: { type: String, required: true, unique: true },
    
    //***Create Username of atleast 4 char */
    username: {
      type: String,
      required: true,
      unique: true,
      validate: {
          validator: function(value) {
              return value.length >= 4;
          },
          message: "Username must be at least 4 characters long.",
      },
  },
    password: { type: String, required: true },
    oldPasswords: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    lastActive: {
        type: String,
        required: false,
      },
      active: {
        type: Boolean,
        default: false,
      },
      role: {
        type: String,
        default: "Business_User",
      },
      otp: {
        type: String,
        required: true,
      }
});

RegisterUserSchema.methods.comparePassword = function(candidatePassword) {
    return candidatePassword === this.password;
};

const User = mongoose.model("RegisterUser", RegisterUserSchema)

module.exports = User;