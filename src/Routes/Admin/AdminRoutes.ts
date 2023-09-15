import { Router } from 'express';
import VerifyToken from '../../Middlewares/verifyTokenUser';
import VerifyAdmin from '../../Middlewares/adminToken';
import { uploadMiddleware } from '../../Services/upload';


const router: Router = Router();

import { 
    getAllKYCRecords,
    couponCode,
    //setAllLimits,
} from '../../Controller/Admin/adminController';

router.get('/getallkyc',[VerifyToken,VerifyAdmin],getAllKYCRecords);
router.post('/couponupload',[uploadMiddleware],couponCode)
//router.post('/setLimits',VerifyAdmin,setAllLimits)


export default router;