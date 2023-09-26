import { Router } from 'express';
import VerifyToken from '../../middlewares/verifyTokenUser';

const router: Router = Router();

import {
    getglobalstatus,
    verifyPAN,
    getGSTDetails,
    verifyAadharNumber,
    verifyAadharNumberOTP,
    saveGSTDetails,
    getsavedgstdetail,
    saveAadharDetails,
    userreferencenumber } from '../../Controller/user/userKYCController';


router.post('/verifypan',[VerifyToken],verifyPAN)
router.post('/generateuuid',VerifyToken,userreferencenumber)
router.post('/getgstdetail',[VerifyToken],getGSTDetails)
router.get('/getsavedgstdetail',[VerifyToken],getsavedgstdetail)
router.post('/savegstdetail',[VerifyToken],saveGSTDetails)
router.post('/verifyadhar',[VerifyToken],verifyAadharNumber)
router.post('/verifyadharotp',[VerifyToken],verifyAadharNumberOTP)
router.post('/saveaadhardetail',[VerifyToken],saveAadharDetails)
router.post("/getglobalstatus",[VerifyToken],getglobalstatus) 


export default router;