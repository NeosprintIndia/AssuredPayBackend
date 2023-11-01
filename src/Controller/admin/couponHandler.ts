import coupon from '../../models/coupon';
import {getSkipAndLimitRange} from "../../utils/pagination"
 
export const findAndInsert = async (couponDetails): Promise<any> => {
  try {
    const doucment = await coupon.find({code:couponDetails.code},"_id");
    if(!doucment.length) {
      const result = await coupon.create(couponDetails);
      console.log("Coupon inserted successfully");
      return [true, result];
    } else {
      return [true,  "Coupon code already exists" ];
    }
  } catch (error) {
    console.log("Error occured while inserting the coupon", error);
    return  [false, error.message];
  }
};

export const find = async (page, rowsLimitInPage, status): Promise<any> => {
  try {
    let query;
    const [skipLimit, limitRange] = await getSkipAndLimitRange(page, rowsLimitInPage);
    if(status) query = {status}
    else query = {}
    let searchQuery;
    searchQuery = {
        "$facet": {
          "records" : [
            {"$match" : query},
            {"$skip": skipLimit}, 
            {"$limit": limitRange}
          ],
          "all": [
            { "$match" : {}},
            { "$count": "all" },
          ],
          "active": [
            { "$match" : {"status": "active"}},
            { "$count": "active" }
          ],
          "expired": [
            { "$match" :{"status": "expired"}},
            { "$count": "expired" }
          ]
        }
      }

    const couponDetails = await coupon.aggregate([searchQuery])
    console.log("Coupons fetched successfully");
    let result = {
      results: couponDetails[0]?.["records"],
      count : {
        all: couponDetails[0]?.["all"]?.[0]?.["all"],
        active: couponDetails[0]?.["active"]?.[0]?.["active"],
        expired: couponDetails[0]?.["expired"]?.[0]?.["expired"]
      }
    }
    return [true, result];
  } catch (error) {
    console.log("Error occured while finding the coupon", error);
    return  [false, error.message];
  }
};

export const findAndUpdate = async (couponDetails): Promise<any> => {
  try {
    const result = await coupon.findOneAndUpdate({code:couponDetails.code}, couponDetails, {new:true});
    console.log("Coupon updated successfully");
    return [true, result];
  } catch (error) {
    console.log("Error occured while updating the coupon", error);
    return  [false, error.message];
  }
};

export const deleteCouponByCode = async (code): Promise<any> => {
  try {
    const result = await coupon.deleteOne({code: code});
    console.log("Coupon Deleted Successfully");
    return [true, result];
  } catch (error) {
    console.log("Error occured while deleting the coupon", error);
    return  [false, error.message];
  }
};