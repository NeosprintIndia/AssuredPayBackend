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
    userreferencenumber
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

// buinessNetworkRoutes
router.get("/getBusinessDetails",getBusinessDetails)
router.get("/getAllBusinessNamesByString", getAllBusinessNamesByString)
router.post("/addBusinessNetwork",addBusinessInBusinessNetwork)
router.get("/getBusinessNetwork",getBusinessesFromBusinessNetwork)
router.put("/updateBusinessNetwork",updateBusinessInBusinessNetwork)

export default router;