import PaymentRequestModel from "../../models/paymentRequest";
import userRegisterations from "../../models/userRegisterations";
import globalAdminSettings from "../../models/globalAdminSettings";
import userKYCs from "../../models/userKYCs"
import { generateOrderID } from "../../services/generateOrderID";
import subUsers from "../../models/subUsers";
import mongoose, { Schema, ObjectId,Document, Model, Types, } from 'mongoose';
import { getBusinessNetworkDetails} from "../../Controller/user/businessNetworkHandler"
import {getSkipAndLimitRange} from "../../utils/pagination"
import * as CryptoJS from "crypto-js";
import "dotenv/config";
import { sendDynamicMail } from "../../services/sendEmail";
import { sendSMS } from "../../services/sendSMS";

export const getMakerRequestInternal = async (userid: string): Promise<boolean | any> => {
  try {
    const paymentRequests = await PaymentRequestModel.find({
      requester: userid,
      checkerStatus: 'pending'
    });
    console.log("paymentRequests",paymentRequests)
    let modelResults = []; 

    for (const result of paymentRequests) {
      const createdby = result.createdby;
      const userId = result.requester;
      const businessName = result.recipient;
      const docId=result._id;
      const modelResult = await getBusinessDetails(userId, businessName, createdby,docId);
      modelResults.push(modelResult);
      console.log(modelResult);
    }
    // At this point, modelResults contains an array of all the results
    console.log(modelResults);

    return [true, modelResults]
  } catch (err) {
   
    console.error(err);
  }
};
export const getBusinessDetails = async (userId, businessName, createdby,docId) => {
  try {
    // Fetch the 'addedby' details
    const addedby = await userRegisterations.findOne({ _id: createdby });
console.log("businessName",businessName)
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

    if (result && result[0]) {
      // Combine the 'addedby' details with the aggregation results
      result[0].AddedBydetails = addedby.business_email;
      result[0].docId = docId;
      return result;
    } else {
      // Handle the case where result[0] is undefined
      return "No business details found";
    }
    // // Combine the 'addedby' details with the aggregation results
    // result[0].AddedBydetails = addedby.business_email;
    // result[0].docId = docId;
    // return result;
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
    let modelResults = []; 
    console.log("paymentRequests",paymentRequests)
      const requester = (paymentRequests as any).requester;
      const docId=(paymentRequests as any)._id;
      const modelResult = await getRequestDetails(userid, requester);
      modelResults.push(modelResult);
    return [true, modelResults]
  } catch (err) {
    
    console.error(err);
  }
};
export const getRequestDetails = async (userId, requester) => {
  try {
    // Continue with the existing aggregation pipeline
    
    const fuserid=new mongoose.Types.ObjectId(userId)
    console.log(fuserid)
    console.log(requester)

    // const result = await PaymentRequestModel.aggregate([
    //   {
    //     $match: { "recipient": fuserid }
    //   },
    //   {
    //     $lookup: {
    //       from: "userkycs",
    //       localField: "requester",
    //       foreignField: "user",
    //       as: "businessNetworkDetails"
    //     }
    //   },
    //   {
    //     $unwind: "$businessNetworkDetails"
    //   },
    //   {
    //     $match: { "businessNetworkDetails.user": "$recipient.requester" }
    //   },
    //   {
    //     $project: {

    //       "requester":1,
    //       "recipient":1,
    //       "paymentType":1,
    //      "recipientStatus":1,
    //       "orderTitle":1,
    //        "orderAmount": 1,
    //       "paymentIndentifier":1,  
    //       businessNetworkDetails: {
    //         Legal_Name_of_Business: 1,
    //         GSTIN_of_the_entity: 1,
    //       }
    //     }
    //   },
    //   {
    //     $project: {
    //       "Legal_Name_of_Business": "$Legal_Name_of_Business",
    //       "GSTIN_of_the_entity":"$GSTIN_of_the_entity",
    //       "recipient":"$recipient",
    //       "requester": "$requester",
    //       "paymentType": "$paymentType",
    //       "recipientStatus": "$recipientStatus",
    //       "orderTitle": "$orderTitle",
    //       "orderAmount": "$orderAmount",
    //       "paymentIndentifier": "$paymentIndentifier",
    //     }
    //   }
    // ]);

    const result = await PaymentRequestModel.aggregate([
      {
        $match: { "recipient": fuserid }
      },
      {
        $lookup: {
          from: "userkycs",
          localField: "requester",
          foreignField: "user",
          as: "businessNetworkDetails"
        }
      },
      {
        $unwind: "$businessNetworkDetails"
      },
      {
        $project: {
          "Legal_Name_of_Business": "$businessNetworkDetails.Legal_Name_of_Business",
          "GSTIN_of_the_entity": "$businessNetworkDetails.GSTIN_of_the_entity",
          "recipient": 1,
          "requester": 1,
          "paymentType": 1,
          "recipientStatus": 1,
          "orderTitle": 1,
          "orderAmount": 1,
          "paymentIndentifier": 1
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
    const orderId= await generateOrderID();
    const expireDate=await globalAdminSettings.findOne({}).select("buyerpaymentRequestDuration")
    console.log("expireDate",(expireDate as any).buyerpaymentRequestDuration)
    const expdays=(expireDate as any).buyerpaymentRequestDuration
    var currentDate = new Date();
    console.log(currentDate)
    var newDate = new Date(currentDate.getTime() + expdays * 24 * 60 * 60 * 1000)
    console.log(newDate)
    const timestamp = new Date(newDate).getTime();
    console.log(timestamp)
    const actionResult=await PaymentRequestModel.findOneAndUpdate({_id:docId},
    {
      $set:
      {
      checkerStatus:action,
       remark:remark,
       orderID:orderId,
       proposalExpireDate:timestamp
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
export const actionPaymentRequestInternal = async (
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
    if(action!=="Approve"){
      return[true,actionResult]
    }
    const paymentRequest = await PaymentRequestModel.findOne({_id:docId});

    if (paymentRequest) {
        // Update the date in each milestoneDetails object
        (paymentRequest as any).milestoneDetails.forEach(item => {
            item.date = updateDate( item.days);
        });

        // Save the updated document
      const finalactionResult = await paymentRequest.save();
        return [true,finalactionResult]
    } else {
      return [false,'Payment request not found']
    
    }

   
     
  } catch (err) {
    return [false,err]
  }
};
const updateDate = (days) => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + days);
  return currentDate.toLocaleDateString('en-GB'); // Assuming date format is 'dd/MM/yyyy'
};
export const businessActionOnPaymentRequestInternal = async (
  docId: string,
  action:string,
  remark:string): Promise<boolean | any> => {
  try {
    const actionResult=await PaymentRequestModel.findOneAndUpdate({_id:docId},
      {
        $set:
        {
          recipientStatus:action,
          remark:remark
      } 
    },
    {new:true})
    if(action!=="Approve"){
      return[true,actionResult]
    }
    const paymentRequest = await PaymentRequestModel.findOne({_id:docId});

    if (paymentRequest) {
        // Update the date in each milestoneDetails object
        (paymentRequest as any).milestoneDetails.forEach(item => {
            item.date = updateDate( item.days);
        });

        // Save the updated document
      const finalactionResult = await paymentRequest.save();
        return [true,finalactionResult]
    } else {
      return [false,'Payment request not found']
    
    }

   
     
  } catch (err) {
    return [false,err]
  }
};
export const getAllMyMakerInternal = async (
  userid: any,
  page: any,
  rowsLimitInPage: any
): Promise<[boolean, any] | undefined> => {
  try {
    const userIdObject = new mongoose.Types.ObjectId(userid);
    const [skipLimit, limitRange] = await getSkipAndLimitRange(page, rowsLimitInPage);
    const result = await subUsers.aggregate([
      {
        $facet: {
          totalCount: [
            { $match: { belongsTo: userIdObject } },
            { $count: 'value' }
          ],
          subusers: [
            { $match: { belongsTo: userIdObject } },
            { $skip: skipLimit },
            { $limit: limitRange },
            {
              $lookup: {
                from: 'registerusers',
                localField: 'userId',
                foreignField: '_id',
                as: 'userDetails'
              }
            },
            { $unwind: '$userDetails' },
            {
              $project: {
                _id: 0,
                currentStatus: '$currentStatus',
                userId: '$userId',
                business_email: '$userDetails.business_email',
                username: '$userDetails.username',
                business_mobile: '$userDetails.business_mobile'
                // Add other fields from RegisterUser as needed
              }
            }
          ]
        }
      }
    ]);
    const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].value : 0;
    const subusers = result[0].subusers; 
    return [true, { totalCount, subusers }];
  } catch (err) {
    console.error(err);
    return [false, err];
  }
};
export const manageMyMakerInternal = async (user:any,status:string): Promise<any> => {
  try {
    if (!user || !status) {
      throw new Error("Invalid input parameters");
    }
    const result = await userRegisterations.findOneAndUpdate(
      { userId: user },
      { $set: { currentStatus: status } },
      { new: true }
    );
    console.log("Maker updated successfully");
    return [true, result];
  } catch (error) {
    console.log("Error occured while updating the Maker", error);
    return  [false, error.message];
  }
};
// export const createPaymentRequestHandler = async (
//   orderTitle:string,
//   business_id: string,
//   paymentType: string,
//   POPI: string,
//   orderAmount: number,
//   paymentIndentifier: string,
//   paymentDays: number,
//   MilestoneDetails: object,
//   userId: string,
//   remark:string
// ): Promise<boolean | any> => {
//   try {
//     if (!orderTitle || !business_id || !paymentType || !POPI || !orderAmount || !paymentIndentifier || !paymentDays || !MilestoneDetails || !userId) {
//       throw new Error("Missing required input parameters.");
//     }
//     const paidto = (paymentIndentifier === "buyer") ? business_id : userId;
//     const paidby = (paymentIndentifier === "buyer") ? userId : business_id;
//     const paymentRequestData = {
//       paymentType: paymentType,
//       POPI: POPI,
//       orderAmount: orderAmount,
//       paymentIndentifier: paymentIndentifier,
//       paymentDays: paymentDays,
//       MilestoneDetails: MilestoneDetails,
//       createdby: userId,
//       requester: userId, 
//       checkerStatus:"approved",
//       recipientStatus:"pending",
//       recipient: business_id,
//       orderTitle:orderTitle,
//       paidTo:paidto,
//       paidBy:paidby
//     }; 
//     const newPaymentRequest = new PaymentRequestModel(paymentRequestData);
//     const finalresult = await newPaymentRequest.save();
//     const orderId= await generateOrderID();
//     const expireDate=await globalAdminSettings.findOne({}).select("buyerpaymentRequestDuration")
//     console.log("expireDate",(expireDate as any).buyerpaymentRequestDuration)
//     const expdays=(expireDate as any).buyerpaymentRequestDuration
//     var currentDate = new Date();
//     console.log(currentDate)
//     var newDate = new Date(currentDate.getTime() + expdays * 24 * 60 * 60 * 1000)
//     console.log(newDate)
//     const timestamp = new Date(newDate).getTime();
//     console.log(timestamp)
//     const actionResult=await PaymentRequestModel.findOneAndUpdate({_id:finalresult._id},
//     {
//       $set:
//       {
//        remark:remark,
//        orderID:orderId,
//        proposalExpireDate:timestamp
//     }
//   },
//     {new:true})
//     return [true,actionResult]
//   } catch (error) {
//     console.error("Error in createPaymentRequestHandler:", error);
//     return [false, "Error creating payment request. Please try again."];
//   }
// };

export const createPaymentRequestHandler = async (
  orderTitle: string,
  business_id: string,
  paymentType: string,
  POPI: string,
  orderAmount: number,
  paymentIndentifier: string,
  paymentDays: number,
  MilestoneDetails: object,
  userId: string,
  remark: string
): Promise<[boolean, any]> => {
  try {
    const requiredInputs = [orderTitle, business_id, paymentType, POPI, orderAmount, paymentIndentifier, paymentDays, MilestoneDetails, userId];

    if (requiredInputs.some(input => !input)) {
      throw new Error("Missing required input parameters.");
    }

    const isBuyerPayment = paymentIndentifier === "buyer";
    const paidto = isBuyerPayment ? business_id : userId;
    const paidby = isBuyerPayment ? userId : business_id;

    const paymentRequestData = {
      paymentType,
      POPI,
      orderAmount,
      paymentIndentifier,
      paymentDays,
      MilestoneDetails,
      createdby: userId,
      requester: userId,
      checkerStatus: "approved",
      recipientStatus: "pending",
      recipient: business_id,
      orderTitle,
      paidTo: paidto,
      paidBy: paidby,
    };
    const newPaymentRequest = new PaymentRequestModel(paymentRequestData);
    const finalresult = await newPaymentRequest.save();
    const orderId = await generateOrderID();
    const expireDate = (await globalAdminSettings.findOne({})).buyerpaymentRequestDuration;
    const expdays = expireDate;
    const timestamp = Date.now() + expdays * 24 * 60 * 60 * 1000;

    const actionResult = await PaymentRequestModel.findOneAndUpdate(
      { _id: finalresult._id },
      {
        $set: {
          remark,
          orderID: orderId,
          proposalExpireDate: timestamp,
        },
      },
      { new: true }
    );
    return [true, actionResult];
  } catch (error) {
    console.error("Error in createPaymentRequestHandler:", error);
    return [false, "Error creating payment request. Please try again."];
  }
};

export const getAllPaymentOfCheckerInternal = async (userid: string, paymentIndentifier:any): Promise<any[]> => {
  try {
    const paymentRequests = await PaymentRequestModel.find({ requester: userid, paymentIndentifier })
      .select("recipient orderID proposalCreatedDate orderAmount MilestoneDetails paymentIndentifier");
    const paymentsWithTotalApFees = await Promise.all(paymentRequests.map(async (payment) => {
      const { MilestoneDetails, ...paymentWithoutMilestones } = payment.toObject();
      const totalApFees = MilestoneDetails.reduce((sum, milestone) => sum + milestone.ApFees, 0);

      // Fetch Legal_Name_of_Business from userkycs collection using the recipient's ObjectId
      const recipientUserKyc = await userKYCs.findOne({ user: payment.recipient });
      console.log("recipientUserKyc", recipientUserKyc);
      const legalNameOfBusiness = recipientUserKyc?.Legal_Name_of_Business || null; // Adjust the default value as needed
      return {
        ...paymentWithoutMilestones,
        totalApFees,
        legalNameOfBusiness,
      };
    }));
    console.log("paymentRequestsWithTotalApFees", paymentsWithTotalApFees);
    return [true, paymentsWithTotalApFees];
  } catch (err) {
    console.error(err);
    throw new Error(err.message); // Throw an exception instead of returning an array
  }
};




