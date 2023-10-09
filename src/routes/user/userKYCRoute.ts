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
    kycRedoRequested
 } from '../../Controller/user/userKYCControllers';

 import {
   getBusinessDetails,
   addBusinessInBusinessNetwork,
   getBusinessesFromBusinessNetwork,
   updateBusinessInBusinessNetwork, 
   getAllBusinessNamesByString
 } from '../../Controller/user/businessNetworkController';

router.post('/verifypan',[VerifyToken],verifyPAN)
router.post('/generateuuid',VerifyToken,userreferencenumber)
router.post('/getgstdetail',[VerifyToken],getGSTDetails)
router.get('/getsavedgstdetail',[VerifyToken],getsavedgstdetail)
router.post('/savegstdetail',[VerifyToken],saveGSTDetails)
router.post('/verifyadhar',[VerifyToken],verifyAadharNumber)
router.post('/verifyadharotp',[VerifyToken],verifyAadharNumberOTP)
router.post("/getglobalstatus",[VerifyToken],getglobalstatus) 
router.post("/kycRedoRequested",[VerifyToken],kycRedoRequested)

// buinessNetworkRoutes
router.get("/getBusinessDetails",[VerifyToken],getBusinessDetails)
router.get("/getAllBusinessNamesByString",[VerifyToken], getAllBusinessNamesByString)
router.post("/addBusinessNetwork",[VerifyToken],addBusinessInBusinessNetwork)
router.get("/getBusinessNetwork",[VerifyToken],getBusinessesFromBusinessNetwork)
router.put("/updateBusinessNetwork",[VerifyToken],updateBusinessInBusinessNetwork)




export default router;