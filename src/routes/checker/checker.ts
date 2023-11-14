import { Router } from 'express';
import verifyTokenUsers from '../../middlewares/verifyTokenUsers';

 import {
getmakerrequest,
checkeraction,
viewparticularrequest,
getpaymentrequest,
actionPaymentRequest,
businessActionOnPaymentRequest
} from '../../Controller/checker/checkerController';

const router: Router = Router();

router.get('/getmakerrequest',verifyTokenUsers,getmakerrequest)
router.get('/getpaymentrequest',verifyTokenUsers,getpaymentrequest)
router.post('/checkeraction',verifyTokenUsers,checkeraction)
router.get('/viewparticularrequest',verifyTokenUsers,viewparticularrequest)
router.post("/actionpaymentrequest",actionPaymentRequest)
router.post('/businessactiononpaymentrequest',verifyTokenUsers,businessActionOnPaymentRequest)

export default router;