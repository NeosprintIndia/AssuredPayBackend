import { Router } from 'express';
import verifyTokenUsers from '../../middlewares/verifyTokenUsers';

 import {
getAllwallet,postwallet,getwalletbyid,updatewalletbyid,deletewalletbyid

} from '../../Controller/wallet/walletController';

const router: Router = Router();

router.get('/wallets',verifyTokenUsers,getAllwallet)
router.post('/wallets',verifyTokenUsers,postwallet)
router.get('/wallets/:id',verifyTokenUsers,getwalletbyid)
router.put('/wallets/:id',verifyTokenUsers,updatewalletbyid)
router.delete('/wallets/:id',verifyTokenUsers,deletewalletbyid)



export default router;