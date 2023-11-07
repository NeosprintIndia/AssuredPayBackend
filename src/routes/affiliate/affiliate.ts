import { Router } from 'express';
import VerifyToken from '../../middlewares/affiliateToken';

const router: Router = Router();

import {
  addIvite, 
  getInvite,
  addBankAccount} from "../../Controller/user/affiliates/affiliatePortalController"


// affiliatePortal
router.post("/invite",[VerifyToken],addIvite)
router.get("/getInvite",[VerifyToken],getInvite)
router.post("/addbankaccount",[VerifyToken],addBankAccount)

export default router;