import { Router } from 'express';
import VerifyToken from '../../middlewares/affiliateToken';

const router: Router = Router();

import {
  addIvite, 
  getInvite} from "../../Controller/user/affiliates/affiliatePortalController"


// affiliatePortal
router.post("/invite",[VerifyToken],addIvite)
router.get("/getInvite",[VerifyToken],getInvite)


export default router;