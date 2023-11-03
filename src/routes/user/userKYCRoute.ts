import { Router } from 'express';
import VerifyToken from '../../middlewares/verifyTokenUsers';

const router: Router = Router();

import {
    getglobalstatus,
    verifyPAN,
    getGSTDetails,
    verifyAadharNumber,
    verifyAadharNumberOTP,
    saveGSTDetails,
    getsavedgstdetail,
    userreferencenumber,
    kycRedoRequested,
    setglobalstatus
 } from '../../Controller/user/userKYCControllers';

 import {
   getBusinessDetails,
   addBusinessInBusinessNetwork,
   getBusinessesFromBusinessNetwork,
   updateBusinessInBusinessNetwork, 
   getAllBusinessNamesByString
 } from '../../Controller/user/businessNetworkController';

 import { 
  getIndustry
} from '../../Controller/admin/industryController';

import { 
  getCategory
} from '../../Controller/admin/categoryController';

import { 
  addProduct,
  getProduct
} from '../../Controller/admin/productController';
import {
  addIvite, 
  getInvite} from "../../Controller/user/affiliates/affiliatePortalController"
//onboardingRoutes

router.post('/verifypan',[VerifyToken],verifyPAN)
router.post('/generateuuid',VerifyToken,userreferencenumber)
router.post('/getgstdetail',[VerifyToken],getGSTDetails)
router.get('/getsavedgstdetail',[VerifyToken],getsavedgstdetail)
router.post('/savegstdetail',[VerifyToken],saveGSTDetails)
router.post('/verifyadhar',[VerifyToken],verifyAadharNumber)
router.post('/verifyadharotp',[VerifyToken],verifyAadharNumberOTP)
router.post("/setglobalstatus",[VerifyToken],setglobalstatus) 
router.post("/kycRedoRequested",[VerifyToken],kycRedoRequested)
router.get("/getglobalstatus",[VerifyToken],getglobalstatus)

// buinessNetworkRoutes
router.get("/getBusinessDetails",[VerifyToken],getBusinessDetails)
router.get("/getAllBusinessNamesByString",[VerifyToken], getAllBusinessNamesByString)
router.post("/addBusinessNetwork",[VerifyToken],addBusinessInBusinessNetwork)
router.get("/getBusinessNetwork",[VerifyToken],getBusinessesFromBusinessNetwork)
router.put("/updateBusinessNetwork",[VerifyToken],updateBusinessInBusinessNetwork)

// industryRoutes
router.get("/getIndustry",[VerifyToken],getIndustry)

// categoryRoutes
router.get("/getCategory",[VerifyToken],getCategory)

// productRoutes
router.post("/addProduct",[VerifyToken],addProduct)
router.get("/getProduct",[VerifyToken],getProduct)


// // affiliatePortal
// router.post("/invite",[VerifyToken],addIvite)
// router.get("/getInvite",[VerifyToken],getInvite)


export default router;