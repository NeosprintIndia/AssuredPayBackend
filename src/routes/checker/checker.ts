import { Router } from 'express';
import verifyTokenUsers from '../../middlewares/verifyTokenUsers';

 import {
getmakerrequest,
checkeraction,
viewparticularrequest,
getpaymentrequest,
actionPaymentRequest,
businessActionOnPaymentRequest,
getAllMyMaker,
manageMyMaker,
createPaymentChecker
} from '../../Controller/checker/checkerController';

const router: Router = Router();

router.get('/getmakerrequest',verifyTokenUsers,getmakerrequest)// It is fetching all payment wether created by maker or by business user
router.get('/getpaymentrequest',verifyTokenUsers,getpaymentrequest)
router.post('/checkeraction',verifyTokenUsers,checkeraction)
router.get('/viewparticularrequest',verifyTokenUsers,viewparticularrequest)
router.post("/actionpaymentrequest",actionPaymentRequest)
router.post('/businessactiononpaymentrequest',verifyTokenUsers,businessActionOnPaymentRequest)
router.get('/getallmymaker',verifyTokenUsers,getAllMyMaker)
router.put('/managemymaker',verifyTokenUsers,manageMyMaker)
router.post('/createpaymentchecker',verifyTokenUsers,createPaymentChecker) 


export default router;