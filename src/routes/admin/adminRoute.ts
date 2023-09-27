import { Router } from 'express';
import VerifyAdmin from '../../middlewares/adminTokens';



const router: Router = Router();

import { 
    getAllKYCRecords,
    setAllLimits,
    getconfiguration,
    getuserbusinessdetail,
    approveDocument,
    getbusinessrepresentativedetail,
    finalstatus,
    rejectDocument
   
}
from '../../Controller/admin/adminControllers';

import { addCoupon,
         getCoupons,
         updateCoupon,
         deleteCoupon,
} from '../../Controller/admin/couponController';

//onboardingRoutes

router.post('/setLimits',VerifyAdmin,setAllLimits)
router.get('/getconfiguration',VerifyAdmin,getconfiguration)
router.get('/getallkyc',VerifyAdmin,getAllKYCRecords);
router.get("/userbusinessdetail",VerifyAdmin,getuserbusinessdetail)
router.get("/businessrepresentativedetail",VerifyAdmin,getbusinessrepresentativedetail)
router.post("/approvedocument",VerifyAdmin,approveDocument)
router.post("/rejectDocument",VerifyAdmin,rejectDocument)
router.post("/finalstatus",VerifyAdmin,finalstatus)


// couponMangementRoutes

router.post("/addCoupon",VerifyAdmin,addCoupon)
router.get("/getCoupons/:page",VerifyAdmin,getCoupons)
router.put("/updateCoupon",VerifyAdmin,updateCoupon)
router.delete("/deleteCoupon",VerifyAdmin,deleteCoupon)

export default router;