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


router.post('/verifypan',[VerifyToken],verifyPAN)
router.post('/generateuuid',VerifyToken,userreferencenumber)
router.post('/getgstdetail',[VerifyToken],getGSTDetails)
router.get('/getsavedgstdetail',[VerifyToken],getsavedgstdetail)
router.post('/savegstdetail',[VerifyToken],saveGSTDetails)
router.post('/verifyadhar',[VerifyToken],verifyAadharNumber)
router.post('/verifyadharotp',[VerifyToken],verifyAadharNumberOTP)
router.post("/getglobalstatus",[VerifyToken],getglobalstatus) 
router.post("/kycRedoRequested",[VerifyToken],kycRedoRequested)

export default router;