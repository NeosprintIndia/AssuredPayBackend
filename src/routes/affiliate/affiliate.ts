import { Router } from 'express';
import VerifyToken from '../../middlewares/affiliateToken';

const router: Router = Router();

import {
  addIvite, 
  getInvite,
  addBankAccount,
  getBankAccounts,
  addBankNames,
  BankNames,
 
} from "../../Controller/user/affiliates/affiliatePortalController"


// affiliatePortal
router.post("/invite",[VerifyToken],addIvite)
router.get("/getInvite",[VerifyToken],getInvite)
router.post("/addbankaccount",[VerifyToken],addBankAccount)
router.get("/getbankaccounts",[VerifyToken],getBankAccounts)
router.post("/addbanknames",addBankNames)
router.get("/banknames",BankNames)

export default router;