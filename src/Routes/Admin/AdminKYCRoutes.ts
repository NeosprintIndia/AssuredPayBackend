import { Router } from 'express';
import VerifyToken from '../../Middlewares/VerifyToken';
import VerifyAdmin from '../../Middlewares/VerifyAdmin';

const router: Router = Router();

import { getAllKYCRecords} from '../../Controller/Admin/AdminKYCController';

<<<<<<< Updated upstream
router.get('/getallkyc',[VerifyToken,VerifyAdmin],getAllKYCRecords);
=======
router.get('/getallkyc',[VerifyToken,VerifyAdmin],getAllKYCRecords);
export default router;
>>>>>>> Stashed changes
