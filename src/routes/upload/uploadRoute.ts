import { Router } from 'express';
import VerifyToken from '../../middlewares/verifyTokenUsers';
import { 
    uploaddoc
} from '../../Controller/upload/uploadController';
import { uploadMiddleware } from '../../services/uploads';

const router: Router = Router();

router.post('/uploaddoc', [VerifyToken, uploadMiddleware], uploaddoc);

export default router;