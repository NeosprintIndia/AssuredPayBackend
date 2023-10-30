import PaymentRequestModel from "../../models/paymentRequest";
import userRegisterations from "../../models/userRegisterations";
import userKYCs from "../../models/userKYCs"
import subUsers from "../../models/subUsers";
import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { getBusinessNetworkDetails} from "../../Controller/user/businessNetworkHandler"

import * as CryptoJS from "crypto-js";
import "dotenv/config";
import { sendDynamicMail } from "../../services/sendEmail";
import { sendSMS } from "../../services/sendSMS";

export const getMakerRequestInternal = async (userid: string): Promise<boolean | any> => {
  try {

    const paymentRequests = await PaymentRequestModel.find({
      requester: userid,
      checkerStatus: 'pending'
    })
    let modelResults = []; // Initialize an empty array to store the results

    for (const result of paymentRequests) {
      const createdby = result.createdby;
      const userId = result.requester;
      const businessName = result.recipient;
      const docId=result._id;
      const modelResult = await getBusinessDetails(userId, businessName, createdby,docId);
      // Push the modelResult into the array
      modelResults.push(modelResult);
      // Do something with the modelResult
      console.log(modelResult);
    }

    // At this point, modelResults contains an array of all the results
    console.log(modelResults);

    return [true, modelResults]
  } catch (err) {
    // Handle any errors here
    console.error(err);
  }
};
export const getBusinessDetails = async (userId, businessName, createdby,docId) => {
  try {
    // Fetch the 'addedby' details
    const addedby = await userRegisterations.findOne({ _id: createdby });

    // Continue with the existing aggregation pipeline
    const result = await userKYCs.aggregate([
      {
        $match: { "user": businessName }
      },
      {
        $lookup: {
          from: "business_networks",
          localField: "user",
          foreignField: "businessId",
          as: "businessNetworkDetails"
        }
      },
      {
        $unwind: "$businessNetworkDetails"
      },
      {
        $match: { "businessNetworkDetails.userId": userId }
      },
      {
        $project: {
          "Legal_Name_of_Business": 1,
          "user":1,
          "GSTIN_of_the_entity":1,
          businessNetworkDetails: {
            industryId: 1,
            categoryId: 1,
            productIds: 1,
            businessId: 1,
          }
        }
      },
      {
        $lookup: {
          from: "industries",
          localField: "businessNetworkDetails.industryId",
          foreignField: "_id",
          as: "industryDetails"
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "businessNetworkDetails.categoryId",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },
      {
        $lookup: {
          from: "registerusers",
          localField: "businessNetworkDetails.businessId",
          foreignField: "_id",
          as: "UserDetails"
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "businessNetworkDetails.productIds",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $project: {
          "Legal_Name_of_Business": "$Legal_Name_of_Business",
          "GSTIN_of_the_entity":"$GSTIN_of_the_entity",
          "recipient":"$user",
          "business_email": "$UserDetails.business_email",
          "industryName": "$industryDetails.industryName",
          "categoryName": "$categoryDetails.categoryName",
          "productDetails": "$productDetails.productName"
        }
      }
    ]);

    // Combine the 'addedby' details with the aggregation results
    result[0].AddedBydetails = addedby.business_email;
    result[0].docId = docId;
    return result;
  } catch (error) {
    return error.message;
  }
}

export const getpaymentrequestInternal = async (userid: string): Promise<boolean | any> => {
  try {

    const paymentRequests = await PaymentRequestModel.find({
      recipient: userid,
      recipientStatus: 'pending'
    })
    let modelResults = []; // Initialize an empty array to store the results
console.log("paymentRequests",paymentRequests)
    for (const result of paymentRequests) {
      const requester = result.requester;
      const docId=result._id;
      const modelResult = await getRequestDetails(userid, requester);
      // Push the modelResult into the array
      modelResults.push(modelResult);
      // Do something with the modelResult
      console.log(modelResult);
    }

    // At this point, modelResults contains an array of all the results
    console.log(modelResults);

    return [true, modelResults]
  } catch (err) {
    // Handle any errors here
    console.error(err);
  }
};
export const getRequestDetails = async (userId, requester) => {
  try {
    // Continue with the existing aggregation pipeline
    const result = await PaymentRequestModel.aggregate([
      {
        $match: { "recipient": userId }
      },
      {
        $lookup: {
          from: "userkyc",
          localField: "requester",
          foreignField: "user",
          as: "businessNetworkDetails"
        }
      },
      {
        $unwind: "$businessNetworkDetails"
      },
      {
        $match: { "businessNetworkDetails.user": requester }
      },
      {
        $project: {

          "requester":1,
          "recipient":1,
          "paymentType":1,
         "recipientStatus":1,
          "orderTitle":1,
           "orderAmount": 1,
          "paymentIndentifier":1,  
          businessNetworkDetails: {
            Legal_Name_of_Business: 1,
            GSTIN_of_the_entity: 1,
           
          }
        }
      },
      {
        $project: {
          "Legal_Name_of_Business": "$Legal_Name_of_Business",
          "GSTIN_of_the_entity":"$GSTIN_of_the_entity",
          "recipient":"$recipient",
          "requester": "$requester",
          "paymentType": "$paymentType",
          "recipientStatus": "$recipientStatus",
          "orderTitle": "$orderTitle",
          "orderAmount": "$orderAmount",
          "paymentIndentifier": "$paymentIndentifier",
        }
      }
    ]);
  
   return result;
  } catch (error) {
    return error.message;
  }
}
export const checkeractionInternal = async (
  docId: string,
  action:string,
  remark:string): Promise<boolean | any> => {
  try {
    
    const actionResult=await PaymentRequestModel.findOneAndUpdate({_id:docId},
    {
      $set:
      {
      checkerStatus:action,
       remark:remark
    }
  },
  {new:true})
      return [true,actionResult]
  } catch (err) {
    console.error(err);
  }
};

export const viewparticularrequestInternal = async (
  docId: string,
  gst:string,
  userid:string,
  businessName:string,
  ): Promise<boolean | any> => {
  try {
    
    const actionResult=await PaymentRequestModel.findOne({_id:docId})
    const recipientDetail=await getBusinessNetworkDetails(userid,gst,businessName)
      return [true,{actionResult,recipientDetail}]
  } catch (err) {
    console.error(err);
  }
};