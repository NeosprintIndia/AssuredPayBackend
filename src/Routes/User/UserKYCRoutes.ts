import { Router } from 'express';
import VerifyToken from '../../Middlewares/verifyTokenUser';

const router: Router = Router();

import {
    getglobalstatus,
    verifyPAN,
    getGSTDetails,
    verifyAadharNumber,
    verifyAadharNumberOTP,
    saveGSTDetails,
    getsavedgstdetail,
    saveAadharDetails } from '../../Controller/User/userKYCController';


router.get('/verifypan',[VerifyToken],verifyPAN)
router.post('/getgstdetail',[VerifyToken],getGSTDetails)
router.get('/getsavedgstdetail',[VerifyToken],getsavedgstdetail)
router.post('/savegstdetail',[VerifyToken],saveGSTDetails)
router.post('/verifyadhar',[VerifyToken],verifyAadharNumber)
router.post('/verifyadharotp',[VerifyToken],verifyAadharNumberOTP)
router.post('/saveaadhardetail',[VerifyToken],saveAadharDetails)

router.post("/getglobalstatus",[VerifyToken],getglobalstatus) 


export default router;