import { Router } from 'express';
import VerifyAdmin from '../../middlewares/adminTokens';



const router: Router = Router();

import { 
    getAllKYCRecords,
    setAllLimits,
    getconfiguration,
    getuserbusinessdetail,
    approvebusinessdetail,
    getbusinessrepresentativedetail,
    approveDocument,
    rejectDocument
    //getbusinessdetail
} from '../../Controller/admin/adminControllers';
import { addCoupon,
    getCoupons,
    updateCoupon,
    deleteCoupon,
} from '../../Controller/admin/couponController';


router.post('/setLimits',VerifyAdmin,setAllLimits)
router.get('/getconfiguration',VerifyAdmin,getconfiguration)
router.get('/getallkyc',VerifyAdmin,getAllKYCRecords);
router.get("/userbusinessdetail",VerifyAdmin,getuserbusinessdetail)
router.get("/businessrepresentativedetail",VerifyAdmin,getbusinessrepresentativedetail)
router.post("/approvebusinessdetail",VerifyAdmin,approvebusinessdetail)
router.post("/approveDocument",approveDocument)
router.post("/rejectDocument",rejectDocument)
//router.post('/couponupload',[VerifyAdmin,uploadMiddleware],couponCode)
//router.post("/getbusinessdetail",getbusinessdetail)

// couponMangementRoutes
router.post("/addCoupon",addCoupon)
router.get("/getCoupons/:page",getCoupons)
router.put("/updateCoupon",updateCoupon)
router.delete("/deleteCoupon",deleteCoupon)

export default router;