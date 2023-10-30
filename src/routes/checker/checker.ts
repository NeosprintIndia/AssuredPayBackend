import { Router } from 'express';
import verifyTokenUsers from '../../middlewares/verifyTokenUsers';

 import {
getmakerrequest,
checkeraction,
viewparticularrequest,
getpaymentrequest
} from '../../Controller/checker/checkerController';

const router: Router = Router();

router.get('/getmakerrequest',verifyTokenUsers,getmakerrequest)
router.get('/getpaymentrequest',verifyTokenUsers,getpaymentrequest)
router.post('/checkeraction',verifyTokenUsers,checkeraction)
router.get('/viewparticularrequest',verifyTokenUsers,viewparticularrequest)

export default router;