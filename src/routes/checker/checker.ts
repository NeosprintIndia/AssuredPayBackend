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
router.post('/createpaymentchecker',verifyTokenUsers,createPaymentChecker) 
router.get('/getallpaymentofchecker',verifyTokenUsers,getAllPaymentOfChecker)
router.post('/businessactiononpaymentrequest',verifyTokenUsers,businessActionOnPaymentRequest)
router.get('/getpaymentrequest',verifyTokenUsers,getpaymentrequest)
router.get('/viewparticularrequest',verifyTokenUsers,viewparticularrequest)
router.get('/getrecievables',verifyTokenUsers,getrecievables) // Payment Request



//Maker Routes
router.post("/actionpaymentrequest",actionPaymentRequest) //same
router.post('/checkeraction',verifyTokenUsers,checkeraction)//same
router.get('/getmakerrequest',verifyTokenUsers,getmakerrequest)
router.get('/getallmymaker',verifyTokenUsers,getAllMyMaker)
router.put('/managemymaker',verifyTokenUsers,manageMyMaker)


export default router;