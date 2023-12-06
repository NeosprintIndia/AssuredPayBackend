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
getrecievables,
getrecievablesdashboard,
getacceptpaymentdashboard,
} from '../../Controller/checker/checkerController';

const router: Router = Router();
router.post('/createpaymentchecker',verifyTokenUsers,createPaymentChecker) 
router.get('/getallpaymentofchecker',verifyTokenUsers,getAllPaymentOfChecker)
router.post('/businessactiononpaymentrequest',verifyTokenUsers,businessActionOnPaymentRequest) // 
router.get('/viewparticularrequest',verifyTokenUsers,viewparticularrequest)
// Payment Request
router.get('/getrecievables',verifyTokenUsers,getrecievables) 
router.get('/getrecievablesdashboard',verifyTokenUsers,getrecievablesdashboard) 
router.get('/getacceptpaymentdashboard',verifyTokenUsers,getacceptpaymentdashboard) 


router.get('/getmakerrequest',verifyTokenUsers,getmakerrequest)
router.get('/getpaymentrequest',verifyTokenUsers,getpaymentrequest)
router.get('/getallmymaker',verifyTokenUsers,getAllMyMaker)
router.put('/managemymaker',verifyTokenUsers,manageMyMaker)
router.post("/actionpaymentrequest",actionPaymentRequest) //same
router.post('/checkeraction',verifyTokenUsers,checkeraction)//same




export default router;