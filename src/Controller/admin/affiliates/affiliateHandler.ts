import { stat } from 'fs/promises';
import affiliate from '../../../models/affiliateModel';
import affiliateSettlement from '../../../models/affiliateSettlement';
import { generateReferralCode } from "../../../services/referralCodes";
import userRegisterations from "../../../models/userRegisterations";
import Referral from "../../../models/refferalCodes";
import {findUserByEmailUsername,generateTemporaryPassword} from "../../../Controller/auth/authHandler"
import { sendDynamicMail } from "../../../services/sendEmail";
import { sendSMS } from "../../../services/sendSMS";
import {getSkipAndLimitRange} from "../../../utils/pagination"
import mongoose from 'mongoose';
import {isValidObjectId} from "mongoose";
import * as CryptoJS from "crypto-js";
import {
  PAN_KYC_SB,
  GST_KYC_SB
} from "../../../services/sandboxs";

export const findAndInsert = async (affiliateDetails): Promise<any> => {
  try {
    const {username, business_mobile, business_email, role} = affiliateDetails;
    if(!username ||  !business_mobile || !business_email) throw({message: "Cannot add affilaite as some details are missing in order to create affiliate."});
    const isExisting = await findUserByEmailUsername(username);
    if(isExisting) return [false, "Already existing  username"];
    else {
    const referralCode = await generateReferralCode(username, business_mobile);
    const tempPassword = await generateTemporaryPassword();
    const hashedPassword = await CryptoJS.AES.encrypt(
      tempPassword,
      process.env.PASS_PHRASE
    ).toString();
    console.log("password and hashedPassword", tempPassword, hashedPassword)
    const newUser = await userRegisterations.create({
      business_email,
      business_mobile,
      password: hashedPassword,
      username,
      oldPasswords: [hashedPassword],
      role:role
    });
    if(newUser._id) {
      let keys = ["business_email", "business_mobile", "username", "role"]
      for(let key of keys) {
        delete affiliateDetails[key]
      }
      affiliateDetails.userId = newUser._id;
    } else throw({message: "Error occured registering the user."})
    const newAffiliate = await affiliate.create(affiliateDetails);
    console.log("Affiliate created successfully");
    const referral_result=await Referral.create({
      user: newUser._id,
      refferal_code: referralCode,
    });
    console.log("Reffereal Created",referral_result)
    if(newAffiliate._id) {
        const reqData = {
          Email_slug: "Affiliate_Created",
          email: business_email,
          VariablesEmail: [username,tempPassword,"affiliate.assuredpay.in"],
      
          receiverNo: business_mobile,
          Message_slug: "Affiliate_Created",
          VariablesMessage: [username,tempPassword,"affiliate.assuredpay.in"],
        };
      await sendDynamicMail(reqData);
      await sendSMS(reqData);
    }
      return [true, newUser];
    }
  } catch (error) {
    console.log("Error occured while creating the affiliate", error);
    return  [false, error.message];
  }
};

// export const find = async (role: string, searchKey: string, page: number, rowsLimitInPage: number): Promise<any> => {
//   try {
//     let searchQuery;
//     let regexSearch = {$regex: searchKey, $options: "i"};
//     const [skipLimit, rowsLimitPerPage] = await getSkipAndLimitRange(page, rowsLimitInPage);
//     if(!role && !searchKey) searchQuery = {$match: {$or:[{role: "affiliatePartner"}, {role: "affiliateSales"}]}};
//     else if(role && searchKey) searchQuery = {$match: {$and: [{role}, {$or:[{username: regexSearch}, {business_email: regexSearch}]}]}}
//     else if(role && !searchKey) searchQuery = {$match: {role}}
//     else if(!role && searchKey) searchQuery = {$match: {$or:[{username: regexSearch}, {business_email: regexSearch}]}}
//    const result = await userRegisterations.aggregate([
//     searchQuery,
//     {$skip: Number(skipLimit)}, 
//     {$limit: Number(rowsLimitPerPage)},
//     {
//       $project: {
//         business_email: 1,
//         business_mobile: 1, 
//         role: 1, 
//         username: 1
//       }
//     },
//     {
//       $lookup:{
//         from: "affiliates",      
//         localField: "_id",   
//         foreignField: "userId", 
//         as: "affiliates"        
//       }
//     },
//     { $unwind:"$affiliates" },
//     {
//       $project: {
//         business_email: 1,
//         business_mobile: 1,
//         role: 1,
//         username: 1,
//         "affiliates.userId": 1, 
//         "affiliates.type": 1,
//         "affiliates.status": 1, 
//         "affiliates.type": 1,
      
//       }
//    ])
//     console.log("Affiliates fetched successfully");
//     return [true, result];
//   } catch (error) {
//     console.log("Error occured while fetching the affiliate on the given search parameters.", error);
//     return  [false, error.message];
//   }
// };

export const find = async (role: string, searchKey: string, page: number, rowsLimitInPage: number): Promise<any> => {
  try {
    let searchQuery;
    let regexSearch = {$regex: searchKey, $options: "i"};
    const [skipLimit, rowsLimitPerPage] = await getSkipAndLimitRange(page, rowsLimitInPage);
    if (!role && !searchKey) searchQuery = {$match: {$or: [{role: "affiliatePartner"}, {role: "affiliateSales"}]}};
    else if (role && searchKey) searchQuery = {$match: {$and: [{role}, {$or: [{username: regexSearch}, {business_email: regexSearch}]}]}}
    else if (role && !searchKey) searchQuery = {$match: {role}}
    else if (!role && searchKey) searchQuery = {$match: {$or: [{username: regexSearch}, {business_email: regexSearch}]}}
    
    const result = await userRegisterations.aggregate([
      searchQuery,
      {$skip: Number(skipLimit)}, 
      {$limit: Number(rowsLimitPerPage)},
      {
        $lookup: {
          from: "affiliates",
          localField: "_id",
          foreignField: "userId",
          as: "affiliates"
        }
      },
      {$unwind: "$affiliates"},
      {
        $project: {
          _id: 1,
          business_email: 1,
          business_mobile: 1, 
          role: 1, 
          username: 1,
          currentStatus:1,
          'affiliates._id': 1,
          'affiliates.userId': 1,
          'affiliates.type': 1,
          'affiliates.referralCode': 1,
          'affiliates.date': 1
        }
      }
    ]);

    console.log("Affiliates fetched successfully");
    return [true, result];
  } catch (error) {
    console.log("Error occurred while fetching the affiliate on the given search parameters.", error);
    return [false, error.message];
  }
};
export const findAndUpdate = async (affiliateId: string, affiliateDetails): Promise<any> => {
  try {
    if(!isValidObjectId(affiliateId)) throw({message: "Affiliate Id not valid."});
    const {status} = affiliateDetails;
    const result = await userRegisterations.findOneAndUpdate({_id: new mongoose.Types.ObjectId(affiliateId)}, {currentStatus: status}, {new:true});
    console.log("Affiliate updated successfully");
    return [true, result];
  } catch (error) {
    console.log("Error occured while updating the affiliate", error);
    return  [false, error.message];
  }
};
export const verifyPANDetails = async (
  PanNumber: string,
  id: string
): Promise<any | string> => {
  try {
    const result = await PAN_KYC_SB({ id_number: PanNumber,userlog:id });
    const firstName = result.body.data.first_name;
    const last_name = result.body.data.last_name;
    return[true,{firstName,last_name}]
  } catch (error) {
    throw error;
  }
};
export const getGSTDetailsInternal = async (
  gst: string,
  userId: string
): Promise<any> => {
  try {
    const result = await GST_KYC_SB({ id_number: gst, userlog:userId })
    return[true,result]
  } catch (error) {
    return [false, error];
  }
};
export const createSettlement = async (
  Paidto: string,
  Paidfor:string,
  bankAccountNumber: string,
  paymentMode: string,
  amount: number,
  utrRef: string,
  transactionId: string,
  remark: string,
  userId:string
): Promise<any> => {
  try {
      // Check if utrRef is unique
      const existingUtrRef = await affiliateSettlement.findOne({ utrRef });
      if (existingUtrRef) {
        throw new Error('Duplicate UTR Reference');
      }
  
      // Check if transactionId is unique
      const existingTransactionId = await affiliateSettlement.findOne({ transactionId });
      if (existingTransactionId) {
        throw new Error('Duplicate Transaction ID');
      }
  
      // Prepare the data to be inserted
      const settlementData = {
        "paidby":userId,
        Paidto,
        Paidfor,
        bankAccountNumber,
        paymentMode,
        amount,
        utrRef,
        transactionId,
        remark,
      };
  
      // Insert the data into the 'affiliatesettlements' collection
      const result = await affiliateSettlement.create(settlementData);
    return[true,result]
  } catch (error) {
    return [false, error];
  }
}