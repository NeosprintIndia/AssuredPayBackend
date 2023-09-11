import { Router } from 'express';
import VerifyToken from '../../Middlewares/VerifyTokenUser';
import VerifyAdmin from '../../Middlewares/Verifyadmin';

const router: Router = Router();

import { getAllKYCRecords} from '../../Controller/Admin/AdminKYCController';

router.get('/getallkyc',[VerifyToken,VerifyAdmin],getAllKYCRecords);

export default router;