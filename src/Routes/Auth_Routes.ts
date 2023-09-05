const auth_router = require("express").Router();
import "dotenv/config";
var Auth=require('../Controller/Auth_Controller')
const authenticateToken = require('../Middlewares/verifyToken');
const verifyAdmin = require('../Middlewares/verifyAdmin');



// When user SignUp on portal
auth_router.post('/registration', Auth.Register);
auth_router.post('/registeradmin',[authenticateToken,verifyAdmin], Auth.RegisterAdmin);

//When User login on portal
auth_router.post("/login", Auth.Login);

auth_router.post('/verify', Auth.verifyEmail);

//Change Password
auth_router.post('/change-password',Auth.ChangePass)

//Forgot Password
auth_router.post('/forgot-password',Auth.forgotpass)




module.exports = auth_router;

