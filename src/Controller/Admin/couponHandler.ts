import coupon from '../../Models/coupon';
 
export const findAndInsert = async (couponDetails): Promise<any> => {
  try {
    const doucment = await coupon.find({code:couponDetails.code},"_id");
    if(!doucment.length) {
      const result = await coupon.create(couponDetails);
      console.log("Coupon inserted successfully", result);
      return [true,  result ];
    } else {
      return [true,  "Coupon code already exists" ];
    }
  } catch (error) {
    return  [false, error];
  }
};

export const find = async (page): Promise<any> => {
  try {
    const limitRange = 10;
    const skipLimit  = page*limitRange - limitRange; 
    const result = await coupon.find().limit(limitRange).skip(skipLimit);
    console.log("Coupons fetched successfully", result);
    return [true,  result ];
  } catch (error) {
    return  [false, error];
  }
};

export const findAndUpdate = async (couponDetails): Promise<any> => {
  try {
    const result = await coupon.findOneAndUpdate({code:couponDetails.code}, couponDetails, {new:true});
    console.log("Coupon updated successfully", result);
    return [true,  result ];
  } catch (error) {
    return  [false, error];
  }
};

export const deleteCouponByCode = async (code): Promise<any> => {
  try {
    const result = await coupon.deleteOne({code: code});
    console.log("Coupon Deleted Successfully", result);
    return [true,  result ];
  } catch (error) {
    return  [false, error];
  }
};