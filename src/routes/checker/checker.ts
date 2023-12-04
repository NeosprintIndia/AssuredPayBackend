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
createPaymentChecker,
getAllPaymentOfChecker,
getrecievables
} from '../../Controller/checker/checkerController';

const router: Router = Router();

router.get('/getmakerrequest',verifyTokenUsers,getmakerrequest)
router.get('/getallpaymentofchecker',verifyTokenUsers,getAllPaymentOfChecker)
router.get('/getpaymentrequest',verifyTokenUsers,getpaymentrequest)
router.post('/checkeraction',verifyTokenUsers,checkeraction)//same
router.get('/viewparticularrequest',verifyTokenUsers,viewparticularrequest)
router.post("/actionpaymentrequest",actionPaymentRequest) //same
router.post('/businessactiononpaymentrequest',verifyTokenUsers,businessActionOnPaymentRequest) // 
router.get('/getallmymaker',verifyTokenUsers,getAllMyMaker)
router.put('/managemymaker',verifyTokenUsers,manageMyMaker)
router.post('/createpaymentchecker',verifyTokenUsers,createPaymentChecker) 


// Payment Request
router.get('/getrecievables',verifyTokenUsers,getrecievables) 

export default router;