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

import{inviteLogs,inviteLogsSpecificAffiliate} from "../../Controller/admin/affiliates/invitelogController"

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

import { 
    createAffiliate,
    getAffiliates,
    updateAffiliate,
    verifyPAN,
    getGSTDetails
} from '../../Controller/admin/affiliates/affiliateController';

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
router.post("/addIndustry",VerifyAdmin,addIndustry)
router.get("/getIndustry",VerifyAdmin,getIndustry)
router.put("/updateIndustry",VerifyAdmin,updateIndustry)

// categoryRoutes
router.post("/addCategory",VerifyAdmin,addCategory)
router.get("/getCategory",VerifyAdmin,getCategory)
router.put("/updateCategory",VerifyAdmin,updateCategory)

// productRoutes
router.post("/addProduct",VerifyAdmin,addProduct)
router.get("/getProduct",VerifyAdmin,getProduct)
router.put("/updateProduct",VerifyAdmin,updateProduct)

// affiliateRoutes
router.get("/invitelogs",VerifyAdmin,inviteLogs)
router.get("/invitelogsspecificaffiliate",VerifyAdmin,inviteLogsSpecificAffiliate)
router.post("/createAffiliate",VerifyAdmin,createAffiliate)
router.get("/getAffiliates",VerifyAdmin,getAffiliates)
router.put("/updateAffiliate",VerifyAdmin,updateAffiliate)
router.post('/verifypan',[VerifyAdmin],verifyPAN)
router.post('/getgstdetail',[VerifyAdmin],getGSTDetails)

export default router;