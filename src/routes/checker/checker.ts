import { Router } from 'express';
import verifyTokenUsers from '../../middlewares/verifyTokenUsers';

 import {
getmakerrequest,
checkeraction,
viewparticularrequest,
getPaymentToAccept,
actionPaymentRequest,
businessActionOnPaymentRequest,
getAllMyMaker,
manageMyMaker,
createPaymentChecker,
getAllPaymentOfChecker,
getrecievables,
getrecievablesdashboard,
getacceptpaymentdashboard,
getbookedpaymentdashboard,
getWalletBalance,
getpaymentrequestdashboard,
getPaymentToPay,
getBookedPaymentRequest
} from '../../Controller/checker/checkerController';

const router: Router = Router();
router.post('/createpaymentchecker',verifyTokenUsers,createPaymentChecker) 
router.get('/getallpaymentofchecker',verifyTokenUsers,getAllPaymentOfChecker)// landing page
router.post('/businessactiononpaymentrequest',verifyTokenUsers,businessActionOnPaymentRequest) // 
router.get('/viewparticularrequest',verifyTokenUsers,viewparticularrequest)
router.get('/getrecievables',verifyTokenUsers,getrecievables) // Action Page available RC and Fetch RC while configuring

//dashboard
router.get('/getwalletbalance',verifyTokenUsers,getWalletBalance) 
router.get('/getbookedpaymentdashboard',verifyTokenUsers,getbookedpaymentdashboard) 
router.get('/getrecievablesdashboard',verifyTokenUsers,getrecievablesdashboard) 
router.get('/getacceptpaymentdashboard',verifyTokenUsers,getacceptpaymentdashboard) 
router.get('/getpaymentrequestdashboard',verifyTokenUsers,getpaymentrequestdashboard) 

// dashboard action page 
router.get('/getpaymentrequest',verifyTokenUsers,getPaymentToAccept) // Paid TO ME
router.get('/getsentpaymentrequest',verifyTokenUsers,getPaymentToPay)// Paid By ME
router.get('/getbookedpaymentrequest',verifyTokenUsers,getBookedPaymentRequest)// Paid By ME

// maker-checker
router.get('/getmakerrequest',verifyTokenUsers,getmakerrequest)
router.get('/getallmymaker',verifyTokenUsers,getAllMyMaker)
router.put('/managemymaker',verifyTokenUsers,manageMyMaker)
router.post("/actionpaymentrequest",actionPaymentRequest) //same
router.post('/checkeraction',verifyTokenUsers,checkeraction)//same




export default router;