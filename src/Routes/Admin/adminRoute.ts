import { Router } from 'express';
import VerifyAdmin from '../../Middlewares/adminTokens';
import { uploadMiddleware } from '../../Services/uploads';


const router: Router = Router();

import { 
    getAllKYCRecords,
    couponCode,
    setAllLimits,
    getconfiguration,
    getuserbusinessdetail,
    approvebusinessdetail
} from '../../Controller/Admin/adminControllers';

router.get('/getallkyc',VerifyAdmin,getAllKYCRecords);
router.post('/couponupload',[VerifyAdmin,uploadMiddleware],couponCode)
router.post('/setLimits',setAllLimits)
router.get('/getconfiguration',VerifyAdmin,getconfiguration)
router.post("/userbusinessdetail",VerifyAdmin,getuserbusinessdetail)
router.post("/approvebusinessdetail",VerifyAdmin,approvebusinessdetail)


export default router;