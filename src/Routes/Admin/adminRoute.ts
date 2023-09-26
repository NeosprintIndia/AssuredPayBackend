import { Router } from 'express';
import VerifyAdmin from '../../middlewares/adminTokens';
import { uploadMiddleware } from '../../services/uploads';


const router: Router = Router();

import { 
    getAllKYCRecords,
    couponCode,
    setAllLimits,
    getconfiguration,
    getuserbusinessdetail,
    approvebusinessdetail,
    getbusinessrepresentativedetail,
    approveDocument,
    rejectDocument
    //getbusinessdetail
} from '../../Controller/admin/adminControllers';


router.post('/setLimits',VerifyAdmin,setAllLimits)
router.get('/getconfiguration',VerifyAdmin,getconfiguration)
router.get('/getallkyc',VerifyAdmin,getAllKYCRecords);
router.get("/userbusinessdetail",VerifyAdmin,getuserbusinessdetail)
router.get("/businessrepresentativedetail",VerifyAdmin,getbusinessrepresentativedetail)
router.post("/approvebusinessdetail",VerifyAdmin,approvebusinessdetail)
router.post("/approveDocument",VerifyAdmin,approveDocument)
router.post("/rejectDocument",rejectDocument)
router.post('/couponupload',[VerifyAdmin,uploadMiddleware],couponCode)
//router.post("/getbusinessdetail",getbusinessdetail)


export default router;