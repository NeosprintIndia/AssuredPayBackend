const auth_router = require("express").Router();
const Registration = require("../Models/UserRegister")
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
import "dotenv/config";



// When user SignUp on portal

auth_router.post('/registration', async (req: any, res: any) =>{
  const new_Register = new Registration({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_PHRASE).toString(),
    accountNumber: req.body.accountNumber
  })
  try {
    const saved_Register = await new_Register.save();
    res.status(201).json(saved_Register);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//When User login on portal
auth_router.post("/login", async (req: any, res: any) => {
  try {
    const user = await Registration.findOne({ firstName: req.body.firstName });

    console.log(user);
    !user && res.status(400).json("Wrong Credential");

    const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_PHRASE);
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    originalPassword !== req.body.password && res.status(400).json("Wrong Password");

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3D" });

    res.status(200).json({ token,user });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = auth_router;

