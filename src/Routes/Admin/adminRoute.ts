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
import { addCoupon,
    getAllCoupons,
    updateCoupon,
    deleteCoupon,
} from '../../Controller/Admin/couponController';

router.get('/getallkyc',VerifyAdmin,getAllKYCRecords);
router.post('/couponupload',[VerifyAdmin,uploadMiddleware],couponCode)
router.post('/setLimits',VerifyAdmin,setAllLimits)
router.get('/getconfiguration',VerifyAdmin,getconfiguration)
router.post("/userbusinessdetail",VerifyAdmin,getuserbusinessdetail)
router.post("/approvebusinessdetail",VerifyAdmin,approvebusinessdetail)

// couponMangementRoutes
router.post("/addCoupon",addCoupon)
router.get("/getAllCoupons",getAllCoupons)
router.put("/updateCoupon",updateCoupon)
router.delete("/deleteCoupon",deleteCoupon)





export default router;