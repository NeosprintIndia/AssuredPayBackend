import { Router } from 'express';
import VerifyToken from '../../Middlewares/VerifyToken';

const router: Router = Router();

import {  verifyPAN,getGSTDetails,verifyAadharNumber,verifyAadharNumberOTP} from '../../Controller/User/UserKYCController';


router.get('/verifypan',[VerifyToken],verifyPAN)
router.get('/getgstdetail',[VerifyToken],getGSTDetails)
router.get('/verifyadhar',[VerifyToken],verifyAadharNumber)
router.post('/verifyadharotp',[VerifyToken],verifyAadharNumberOTP)