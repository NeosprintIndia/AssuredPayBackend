const UserKYC1 = require("../Models/UserKYC")
const authenticateToken = require("../Controller/Auth_Controller")
const sandbox = require("../Services/sandbox")
const Registration = require("../Models/UserRegister")

const AWS = require('aws-sdk');

exports.start = async function(req, res) {
    console.log("In start function")
    
    try {
       
        const {business_name, business_address, city, district, state, postalCode,GSTNumber,PAN_Company_number,aadharNumber,business_bank_account_no} = req.body;
        const user=req.userId
        console.log(req.userId)

        const newKYC = new UserKYC1({
            business_name,
            user,
            business_address,
            city,
            district,
            state,
            postalCode,
            GSTNumber,
            PAN_Company_number, 
            aadharNumber,
            business_bank_account_no
          });
      
          const saved_KYC = await newKYC.save();
          console.log(saved_KYC)
      
          res.json({ saved_KYC });

        
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });   
    }

  };



 //Upload Controller 
async function awsinitialise(Key,Body)
  {
    AWS.config.update({
      accessKeyId: process.env.YOUR_ACCESS_KEY_ID,
      secretAccessKey: process.env.YOUR_SECRET_ACCESS_KEY,
      region: 'ap-south-1' 
    });
  
  const s3 = new AWS.S3();
  const params = {
      Bucket: 'testbucketassurepay',
      Key: Key,
      Body: Body,
    };

    return {params,s3};
  }

  exports.uploadaadhars1 = async function(req,res)

  {
    const userId=req.userId
    console.log(userId)
    const Key=req.file.originalname;
    const Body= req.file.buffer;
    
   const {params,s3}= await awsinitialise(Key,Body)

     s3.upload(params, async(err, data) => {
        console.log(data)

        const updatedUserKYC1 = await UserKYC1.findOneAndUpdate(
            {user:userId},
            {$set: {aadharFileUrl: data.Location}}

        );
        res.send(updatedUserKYC1);
        
        if (err) {
          console.error(err);
          return res.status(500).send('Error uploading file');
        }
      });
    
  } ;

  exports.uploadaadhars2 = async function(req,res)

  {
    const userId=req.userId
    console.log(userId)
    const Key=req.file.originalname;
    const Body= req.file.buffer;
    
   const {params,s3}= await awsinitialise(Key,Body)

     s3.upload(params, async(err, data) => {
        console.log(data)

        const updatedUserKYC1 = await UserKYC1.findOneAndUpdate(
            {user:userId},
            {$set: {aadharBackUrl: data.Location}}

        );
        res.send(updatedUserKYC1);
        
        if (err) {
          console.error(err);
          return res.status(500).send('Error uploading file');
        }
      });
    
  } ;

  exports.uploadpan = async function(req,res)

  {
    const userId=req.userId
    console.log(userId)
    const Key=req.file.originalname;
    const Body= req.file.buffer;
    
   const {params,s3}= await awsinitialise(Key,Body)

     s3.upload(params, async(err, data) => {
        console.log(data)

        const updatedUserKYC1 = await UserKYC1.findOneAndUpdate(
            {user:userId},
            {$set: {PANFile: data.Location}}

        );
        res.send(updatedUserKYC1);
        
        if (err) {
          console.error(err);
          return res.status(500).send('Error uploading file');
        }
      });
    
  } ;

  exports.uploadgst = async function(req,res)

  {
    const userId=req.userId
    console.log(userId)
    const Key=req.file.originalname;
    const Body= req.file.buffer;
    
   const {params,s3}= await awsinitialise(Key,Body)

     s3.upload(params, async(err, data) => {
        console.log(data)

        const updatedUserKYC1 = await UserKYC1.findOneAndUpdate(
            {user:userId},
            {$set: {GSTFILE: data.Location}}

        );
        res.send(updatedUserKYC1);
        
        if (err) {
          console.error(err);
          return res.status(500).send('Error uploading file');
        }
      });
    
  } ;


//Verification Controller 



exports.verifypan = async function(req,res)
{
  try {
  const id=req.userId;
  const user = await UserKYC1.findOne({
    "user":id
  });
  const pan=user.PAN_Company_number;
  const business_name=user.business_name;
  console.log(pan)
  const result=await sandbox.PAN_KYC_SB({ "id_number": pan })
  const fullname=result.body.data.full_name
  if(business_name===fullname)
  {
    const updateisPANVerified = await UserKYC1.findOneAndUpdate(
      {"user":id},
      {$set: {isPANVerified: true}}

  );

  res.json(updateisPANVerified );

  }
  else{res.json("Your Pan detail doesn't match with the business name provided" );}
  
    
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });   
  }
 
  
}
 
exports.verifygst = async function(req,res)
{
  try {
  const id=req.userId;
  const user = await UserKYC1.findOne({
    "user":id
  });
  const gst=user.GSTNumber;
  const business_name=user.business_name;
  console.log(gst)
  const result=await sandbox.GST_KYC_SB({ "id_number": gst })
  const fullname=result.body.data.full_name
  if(business_name===fullname)
  {
    const updateisGSTVerified = await UserKYC1.findOneAndUpdate(
      {"user":id},
      {$set: {isGSTVerified: true}}

  );

  res.json(updateisGSTVerified );

  }
  else{res.json("Your GST detail doesn't match with the business name provided" );}
  
    
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });   
  }
 
  
}

exports.getgstdetail=async (req,res) => {
  try {
    const id=req.userId;
    // const user = await UserKYC1.findOne({
    //   "user":id
    // });
    const gst=req.body.GSTNumber;
    console.log(gst)
    const result=await sandbox.GST_KYC_SB({ "id_number": gst })
    res.json(result ); 
  }
    catch (error) {
      res.status(500).json({ error: 'An error occurred' });   
    }
}


// Send OTP

exports.verifyadharnumber = async function(req,res)
{
  try {
  const id=req.userId;
  const user = await UserKYC1.findOne({
    "user":id
  });
  const adhar=user.aadharNumber;
  console.log(adhar)
  const result=await sandbox.Aadhaar_KYC_S1({ "id_number": adhar })
  const RefID= result.body.data.ref_id
  const updateRefID = await UserKYC1.findOneAndUpdate(
    {"user":id},
    {$set: {aadhar_ref_id: RefID}})

  console.log(updateRefID)
  res.json(updateRefID );

  }
    catch (error) {
    res.status(500).json({ error: 'An error occurred' });   
  }
 
  
}

//To verify otp
exports.verifyadharnumberotp = async function(req,res)
{
  try {
  const id=req.userId;
  const user = await UserKYC1.findOne({
    "user":id
  });
  //const adharRef=user.aadhar_ref_id;
 // console.log(adharRef)
  const otp=req.body.otp
  const result=await sandbox.Aadhaar_KYC_S2({ otp: otp , refId: "4027359" })
  console.log(result)
  res.json(result );

  }
    catch (error) {
    res.status(500).json({ error: 'An error occurred' });   
  }
 
  
}


// Admin APIS
exports.Admin_Aadhars1_Approve=async (req,res) => {
  try {
    
    const {AdminAadhaarS1Verified,id}=req.body
    const result = await UserKYC1.findOneAndUpdate(
      {"user":id},
      {$set: {AdminAadhaarS1Verified: true}})
      console.log(result)
      res.json(result );
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' }); 
  }


}

exports.getallkyc=async (req, res) => {
  try {
    const result = await UserKYC1.find()
    console.log(result)
  res.json(result );
    
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' }); 
  }
}


  
