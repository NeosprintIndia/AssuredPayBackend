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
    getAllIndustriesByString,
    updateIndustry,
} from '../../Controller/admin/industryController';

import { 
    addCategory,
    getCategory,
    getAllCategoriesByString,
    getCategoryByIndustryId,
    updateCategory,
} from '../../Controller/admin/categoryController';

import { 
    addProduct,
    getProduct,
    getAllProductsByString,
    getProductByCategoryId,
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
router.get("/getCoupons/:page",VerifyAdmin,getCoupons)
router.put("/updateCoupon",VerifyAdmin,updateCoupon)
router.delete("/deleteCoupon",VerifyAdmin,deleteCoupon)

// industryRoutes
router.post("/addIndustry",VerifyAdmin,addIndustry)
router.get("/getIndustry",VerifyAdmin,getIndustry)
router.get("/getIndustryBySearchKey",VerifyAdmin,getAllIndustriesByString)
router.put("/updateIndustry",VerifyAdmin,updateIndustry)

// categoryRoutes
router.post("/addCategory",VerifyAdmin,addCategory)
router.get("/getCategory",VerifyAdmin,getCategory)
router.get("/getCategoryBySearchKey",VerifyAdmin,getAllCategoriesByString)
router.get("/getCategoryByIndustryId",VerifyAdmin,getCategoryByIndustryId)
router.put("/updateCategory",VerifyAdmin,updateCategory)

// productRoutes
router.post("/addProduct",VerifyAdmin,addProduct)
router.get("/getProduct",VerifyAdmin,getProduct)
router.get("/getProductBySearchKey",VerifyAdmin,getAllProductsByString)
router.get("/getProductByCategoryId",VerifyAdmin,getProductByCategoryId)
router.put("/updateProduct",VerifyAdmin,updateProduct)

export default router;