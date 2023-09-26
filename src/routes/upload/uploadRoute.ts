import { Router } from 'express';
import VerifyToken from '../../middlewares/verifyTokenUsers';
import { uploadAadhars1,
    uploadAadhars2,
    uploadPan,
    uploadGst,
    uploaddoc
} from '../../Controller/upload/uploadController';
import { uploadMiddleware } from '../../services/uploads';

const router: Router = Router();

// Define the route to handle file uploads
router.post('/uploadaadhars1', [VerifyToken, uploadMiddleware], uploadAadhars1);
router.post('/uploadaadhars2', [VerifyToken, uploadMiddleware], uploadAadhars2);
router.post('/uploadPan', [VerifyToken, uploadMiddleware], uploadPan);
router.post('/uploadGst', [VerifyToken, uploadMiddleware], uploadGst);
router.post('/uploaddoc', [VerifyToken, uploadMiddleware], uploaddoc);


export default router;