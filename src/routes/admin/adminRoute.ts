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
    rejectDocument,
    allActivities,
   
}
from '../../Controller/admin/adminControllers';

import {
    addCoupon,
    getCoupons,
    updateCoupon,
    deleteCoupon,
} from '../../Controller/admin/couponController';

import { 
    addIndustry,
    getIndustry,
    updateIndustry
} from '../../Controller/admin/industryController';

import { 
    addCategory,
    getCategory,
    updateCategory
} from '../../Controller/admin/categoryController';

import { 
    addProduct,
    getProduct,
    updateProduct
} from '../../Controller/admin/productController';

//onboardingRoutes
router.post('/setLimits',VerifyAdmin,setAllLimits)
router.get('/getconfiguration',VerifyAdmin,getconfiguration)
router.get('/getallkyc',VerifyAdmin,getAllKYCRecords);
router.get("/userbusinessdetail",VerifyAdmin,getuserbusinessdetail)
router.get("/businessrepresentativedetail",VerifyAdmin,getbusinessrepresentativedetail)
router.post("/approvedocument",VerifyAdmin,approveDocument)
router.post("/rejectDocument",VerifyAdmin,rejectDocument)
router.post("/finalstatus",VerifyAdmin,finalstatus)
router.get("/allactivities",VerifyAdmin,allActivities)

///////////////////////////////////////////////////////////////////////////////-------------------



// couponMangementRoutes
router.post("/addCoupon",VerifyAdmin,addCoupon)
router.get("/getCoupons",VerifyAdmin,getCoupons)
router.put("/updateCoupon",VerifyAdmin,updateCoupon)
router.delete("/deleteCoupon",VerifyAdmin,deleteCoupon)

// industryRoutes
router.post("/addIndustry",addIndustry)
router.get("/getIndustry",getIndustry)
router.put("/updateIndustry",updateIndustry)

// categoryRoutes
router.post("/addCategory",addCategory)
router.get("/getCategory",getCategory)
router.put("/updateCategory",updateCategory)

// productRoutes
router.post("/addProduct",addProduct)
router.get("/getProduct",getProduct)
router.put("/updateProduct",updateProduct)

export default router;