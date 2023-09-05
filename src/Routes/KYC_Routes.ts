const kyc_router = require("express").Router();
import "dotenv/config";
const KYC=require('../Controller/KYC_Controller')
const multer = require('multer');
const authenticateToken = require('../Middlewares/verifyToken');
const verifyAdmin = require('../Middlewares/verifyAdmin');
// const upload=require('../Services/upload')


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // limit file size to 5MB
    },
  });

// To start KYC
kyc_router.post('/start',authenticateToken,KYC.start);



// Define the route to handle file uploads
kyc_router.post('/uploadaadhars1',[authenticateToken,upload.single('document')],KYC.uploadaadhars1)

kyc_router.post('/uploadaadhars2',[authenticateToken,upload.single('document')],KYC.uploadaadhars2)

kyc_router.post('/uploadpan',[authenticateToken,upload.single('document')],KYC.uploadpan)

kyc_router.post('/uploadgst',[authenticateToken,upload.single('document')],KYC.uploadgst)


// Define the route to Get KYC Details from Sandbox API
kyc_router.post('/getgstdetail',authenticateToken,KYC.getgstdetail)

// Define the route to Verify KYC Details
kyc_router.get('/verifypan',authenticateToken,KYC.verifypan)
kyc_router.get('/verifygst',authenticateToken,KYC.verifygst)
kyc_router.get('/verifyadhar',authenticateToken,KYC.verifyadharnumber)
kyc_router.post('/verifyadharotp',authenticateToken,KYC.verifyadharnumberotp)


// Admin APIS for approval of KYC
kyc_router.post('/start',[authenticateToken,verifyAdmin],KYC.Admin_Aadhars1_Approve);
kyc_router.get('/getallkyc',[authenticateToken,verifyAdmin],KYC.getallkyc);



module.exports = kyc_router;