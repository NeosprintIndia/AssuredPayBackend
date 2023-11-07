import { Router } from 'express';
import VerifyToken from '../../middlewares/affiliateToken';

const router: Router = Router();

import {
  addIvite, 
  getInvite,
  addBankAccount,
  getBankAccounts,
 // verifyBankAccount
} from "../../Controller/user/affiliates/affiliatePortalController"


// affiliatePortal
router.post("/invite",[VerifyToken],addIvite)
router.get("/getInvite",[VerifyToken],getInvite)
router.post("/addbankaccount",[VerifyToken],addBankAccount)
router.post("/addbankaccount",[VerifyToken],addBankAccount)
router.get("/getbankaccounts",[VerifyToken],getBankAccounts)

export default router;