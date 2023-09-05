const Registration = require("../Models/UserRegister")
const Referral=require("../Models/RefferalCode")
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
import "dotenv/config";
const { generateOTP } = require('../Services/OTP');
const{generateReferralCode}=require("../Services/referral_code")
const { sendMail } = require('../Services/MAIL');
const crypto = require('crypto');


exports.Register = async (req, res) => {
  const { business_email,username,business_mobile, password} = req.body;
  console.log(req.body.refferal_code)
  let refferal_code=null
  if(req.body.refferal_code != null)
  {
    refferal_code= req.body.refferal_code
    console.log("Inside ifss")
    console.log(refferal_code)
  }

 

  const isExisting = await findUserByEmail_username(business_email,username);
  if (isExisting) {
    return res.send('Already existing business or Username');
  }

  // create new user
  const newUser = await createUser (business_email, password,business_mobile,username,refferal_code);
  console.log(newUser)
  if (!newUser[0]) {
    return res.status(400).send({
      message: 'Unable to create new user',
    });
  }
  
  res.send(newUser);
};

exports.RegisterAdmin=async (req,res) => {
  const { business_email,username,business_mobile, password} = req.body;
  console.log(req.body.refferal_code)
  let refferal_code=null
  if(req.body.refferal_code != null)
  {
    refferal_code= req.body.refferal_code
    console.log("Inside ifss")
    console.log(refferal_code)
  }
  const isExisting = await findUserByEmail_username(business_email,username);
  if (isExisting) {
    return res.send('Already existing business or Username');
  }
   // create new user
   const newUser = await createAdminUser (business_email, password,business_mobile,username,refferal_code);
   console.log(newUser)
   if (!newUser[0]) {
     return res.status(400).send({
       message: 'Unable to create new user',
     });
   }
   
   res.send(newUser);

}

const findUserByEmail_username = async (business_email,username) => {
  const user = await Registration.findOne({
    $and: [
      { business_email },
      { username }
    ]
  });
  if (!user) {
    return false;
  }
  return user;
};
exports.verifyEmail = async (req, res) => {
  const { business_email, otp } = req.body;
  const user = await validateUserSignUp(business_email, otp);
  res.send(user);
};
const createAdminUser = async (business_email, password, business_mobile, username, refferal_code) => {
  try {
    const hashedPassword = await CryptoJS.AES.encrypt(password, process.env.PASS_PHRASE).toString();
    const otpGenerated = await generateOTP();
    const Refer_code = await generateReferralCode(username, business_mobile);
    console.log(Refer_code)

    let updatedReferral = null;

    if (refferal_code != null) {
      const updatedReferral = await Referral.findOneAndUpdate(
        { "refferal_code": refferal_code }, // Check the correct property name
        { $inc: { count: 1 } },
        { new: true }
      );
      console.log(updatedReferral);
      if (!updatedReferral) {
        return [false, null];
      }
    }
    

    const newUser = await Registration.create({
      business_email: business_email,
      business_mobile: business_mobile,
      password: hashedPassword,
      username: username,
      oldPasswords: [hashedPassword],
      otp: otpGenerated,
      role:"Admin"
    });
    console.log(newUser);

    const Generate_Referral = await Referral.create({
      user: newUser._id,
      refferal_code: Refer_code
    });
    console.log(Generate_Referral);

    await sendMail({
      to: business_email,
      OTP: otpGenerated,
    });
   return [true, newUser];
  } catch (error) {
    console.error("Error in createUser:", error);
    return [false, 'Unable to sign up, please try again later', error];
  }
};

const createUser = async (business_email, password, business_mobile, username, refferal_code) => {
  try {
    const hashedPassword = await CryptoJS.AES.encrypt(password, process.env.PASS_PHRASE).toString();
    const otpGenerated = await generateOTP();
    const Refer_code = await generateReferralCode(username, business_mobile);
    console.log(Refer_code)

    let updatedReferral = null;

    if (refferal_code != null) {
      const updatedReferral = await Referral.findOneAndUpdate(
        { "refferal_code": refferal_code }, // Check the correct property name
        { $inc: { count: 1 } },
        { new: true }
      );
      console.log(updatedReferral);
      if (!updatedReferral) {
        return [false, null];
      }
    }
    

    const newUser = await Registration.create({
      business_email: business_email,
      business_mobile: business_mobile,
      password: hashedPassword,
      username: username,
      oldPasswords: [hashedPassword],
      otp: otpGenerated
    });
    console.log(newUser);

    const Generate_Referral = await Referral.create({
      user: newUser._id,
      refferal_code: Refer_code
    });
    console.log(Generate_Referral);

    await sendMail({
      to: business_email,
      OTP: otpGenerated,
    });
   return [true, newUser];
  } catch (error) {
    console.error("Error in createUser:", error);
    return [false, 'Unable to sign up, please try again later', error];
  }
};


const validateUserSignUp = async (business_email, otp) => {
  const user = await Registration.findOne({
    business_email,
  });
  if (!user) {
    return [false, 'User not found'];
  }
  if (user && user.otp !== otp) {
    return [false, 'Invalid OTP'];
  }
  const updatedUser = await Registration.findByIdAndUpdate(user._id, {
    $set: { active: true },
  });
  return [true, updatedUser];
};

  //When User login on portal
  exports.Login = async function(req, res) {
    try {
      const user = await Registration.findOne({ business_email: req.body.business_email });
  
      console.log(user);
      !user && res.status(400).json("Wrong Credential");
  
      const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_PHRASE);
      const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
  
      originalPassword !== req.body.password && res.status(400).json("Wrong Password");
  
      const token = jwt.sign({ userId: user._id,role:user.role }, process.env.JWT_SECRET, { expiresIn: "3D" });
  
      res.status(200).json(token);
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };



  exports.ChangePass= async (req, res) => {
    const { business_email, oldPassword, newPassword } = req.body;

    try {
        const user = await Registration.findOne({ business_email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.comparePassword(oldPassword)) {
            return res.status(401).json({ message: 'Invalid old password' });
        }

        if (user.oldPasswords.includes(newPassword)) {
            return res.status(400).json({ message: 'New password cannot be an old password' });
        }

        user.oldPasswords.push(user.password);
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
 
// Generate a temporary password
function generateTemporaryPassword() {
  return crypto.randomBytes(8).toString('hex'); // 16 characters long hexadecimal string
}
exports.forgotpass=async (req,res) => {
  const email = req.body.business_email;
console.log(email)
  try {
    // Check if the user exists in the database
 
    const user = await Registration.findOne({ "business_email":email });
    console.log(user)

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
     // Generate a temporary password
     const tempPassword = generateTemporaryPassword();
     // Update the user's password in the database
     user.oldPasswords.push(tempPassword);
     user.password = tempPassword;
     await user.save();
     console.log(email)
     await sendMail({
      to: email,
      OTP: tempPassword,
    });
    return res.status(200).json({ message: 'Password has been sent to an email' });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }


}


// exports.Register = async function(req, res) {
   
//     console.log(req.body)
//     const new_Register = new Registration({
//       business_name: req.body.business_name,
//       email: req.body.email,
//       password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_PHRASE).toString(),
//     })
//     try {
//       const saved_Register = await new_Register.save();
//       res.status(201).json(saved_Register);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   };
  