import { Router } from 'express';
import VerifyToken from '../../Middlewares/VerifyTokenUser';
import VerifyAdmin from '../../Middlewares/AdminToken';
import { uploadMiddleware } from '../../Services/upload';


const router: Router = Router();

import { getAllKYCRecords,couponCode} from '../../Controller/Admin/AdminController';

router.get('/getallkyc',[VerifyToken,VerifyAdmin],getAllKYCRecords);
router.post('/couponupload',[uploadMiddleware],couponCode)

export default router;