import { Request, Response } from 'express';
import {
  findAndInsert,
  find,
  findAndUpdate,
  deleteCouponByCode
} from './couponHandler';

export const addCoupon = async (req: Request, res: Response): Promise<void> => {
    const couponDetails = req.body;
    const [success,result] = await findAndInsert(couponDetails);
    if (success) {
      res.send({result,Active:true});
    } else {
      res.status(500).send({
        message: result,Active:false
      });
    }
};

export const getCoupons = async (req: Request, res: Response): Promise<void> => {
  const {page, rowsLimitInPage, status} = req.query;
  const [success,result] = await find(page, rowsLimitInPage, status);
  if (success) {
    res.send({result,Active:true});
  } else {
    res.status(500).send({
      message: result,Active:false
    });
  }
};

export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  const couponDetails = req.body;
    const [success,result] = await findAndUpdate(couponDetails);
    if (success) {
      res.send({result,Active:true});
    } else {
      res.status(500).send({
        message: result,Active:false
      });
    }
};

export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  const code = req.query.code;
  const [success,result] = await deleteCouponByCode(code);
  if (success) {
    res.send({result,Active:true});
  } else {
    res.status(500).send({
      message: result,Active:false
    });
  }
};
