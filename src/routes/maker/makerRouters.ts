import { Router } from 'express';
import verifyTokenUsers from '../../middlewares/verifyTokenUsers';

import {createPaymentRequest,
    createsubuser

} from '../../Controller/maker/makerController';

const router: Router = Router();

router.post('/createsubuser',verifyTokenUsers,createsubuser)
router.post('/createPaymentRequest',verifyTokenUsers,createPaymentRequest)

export default router;