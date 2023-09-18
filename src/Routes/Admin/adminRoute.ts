import { Router } from 'express';
import VerifyToken from '../../Middlewares/verifyTokenUsers';
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

router.get('/getallkyc',getAllKYCRecords);
router.post('/couponupload',[VerifyAdmin,uploadMiddleware],couponCode)
router.post('/setLimits',VerifyAdmin,setAllLimits)
router.get('/getconfiguration',VerifyAdmin,getconfiguration)
router.post("/userbusinessdetail",getuserbusinessdetail)
router.post("/approvebusinessdetail",approvebusinessdetail)



export default router;