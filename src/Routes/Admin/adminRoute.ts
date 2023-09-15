import { Router } from 'express';
import VerifyToken from '../../Middlewares/verifyTokenUsers';
import VerifyAdmin from '../../Middlewares/adminTokens';
import { uploadMiddleware } from '../../Services/upload';


const router: Router = Router();

import { 
    getAllKYCRecords,
    couponCode,
    //setAllLimits,
} from '../../Controller/Admin/adminControllers';

router.get('/getallkyc',[VerifyToken,VerifyAdmin],getAllKYCRecords);
router.post('/couponupload',[uploadMiddleware],couponCode)
//router.post('/setLimits',VerifyAdmin,setAllLimits)


export default router;