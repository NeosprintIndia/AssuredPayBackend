import { Router } from 'express';
import {
  register,
  login,
  verifyEmail,
  changePass,
  forgotPass,
  registerAdmin,
} from '../../Controller/Auth/AuthController';
import VerifyToken from '../../Middlewares/VerifyToken';
import verifyAdmin from '../../Middlewares/VerifyAdmin';

<<<<<<< Updated upstream
const authRouter: Router = Router();

authRouter.post('/registerbusiness', register);
authRouter.post('/verify', verifyEmail);
authRouter.post('/login', login);
// Change Password
authRouter.post('/change-password', changePass);
// Forgot Password
authRouter.post('/forgot-password', forgotPass);

authRouter.post('/registeradmin', [VerifyToken, verifyAdmin], registerAdmin);

export default authRouter;
=======
const router: Router = Router();

router.post('/registerbusiness', register);
router.post('/verify', verifyEmail);
router.post('/login', login);
// Change Password
router.post('/change-password', changePass);
// Forgot Password
router.post('/forgot-password', forgotPass);

router.post('/registeradmin', [VerifyToken, verifyAdmin], registerAdmin);

export default router;
>>>>>>> Stashed changes
