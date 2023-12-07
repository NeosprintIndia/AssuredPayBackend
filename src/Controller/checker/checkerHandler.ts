import PaymentRequestModel from "../../models/paymentRequest";
import userRegisterations from "../../models/userRegisterations";
import globalAdminSettings from "../../models/globalAdminSettings";
import bbFDSchema from "../../models/bbFDSchema";
import rcFDSchema from "../../models/rcFDSchema";
import userKYCs from "../../models/userKYCs"
import walletTransaction from "../../models/walletTransaction"
import walletModel from "../../models/walletModel"
import { generateOrderID } from "../../services/generateOrderID";
import subUsers from "../../models/subUsers";
import mongoose, { Schema, ObjectId, Document, Model, Types, } from 'mongoose';
import { getBusinessNetworkDetails } from "../../Controller/user/businessNetworkHandler"
import { getSkipAndLimitRange } from "../../utils/pagination"
import * as CryptoJS from "crypto-js";
import "dotenv/config";
import { sendDynamicMail } from "../../services/sendEmail";
import { sendSMS } from "../../services/sendSMS";
import Wallettransaction from "../../models/walletTransaction";

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
    console.log("requiredInputs", requiredInputs)
    if (requiredInputs.some(input => !input)) {
      throw new Error("Missing required input parameters.");
    }
    const walletres = await walletModel.findOne({ "userId": userId })
    console.log("Before order amount",orderAmount)
    console.log("Wallet order amount", walletres.amount)
    if (orderAmount > walletres.amount) {
      console.log("After order amopunt")
      return [false, "You don't have sufficient balance in your account to create payment request"]
    }
 
    const isBuyerPayment = paymentIndentifier === "buyer";
    const paidto = isBuyerPayment ? business_id : userId;
    const paidby = isBuyerPayment ? userId : business_id;
    console.log("isBuyerPayment", isBuyerPayment)
    console.log("paidto", paidto)
    console.log("paidby", paidby)

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
    console.log("paymentRequestData", paymentRequestData)
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
    console.log("before hold")
    if (actionResult.paymentIndentifier == "buyer") {
      const walletres = await walletModel.findOne({ "userId": userId })
      const amountFinal=walletres.amount-orderAmount
      const updatedWallet=await walletModel.findOneAndUpdate({ "userId": userId },{$set:{"amount":amountFinal}})
      console.log("UPDATED WALLET",updatedWallet)
      console.log("wallet", walletres)
      const walletid = walletres._id
      const paidby = (actionResult as any).paidTo
      const paidto = (actionResult as any).paidBy
      const paymenttype = "debit"
      const paymentstatus = "hold"
      await createWalletTransaction(walletid, paidby, paidto, paymenttype, paymentstatus,orderAmount)
      if (actionResult.paymentType !== "full")
        await cascadeUpdateMilestoneAndPaymentRequest(actionResult._id);
    }
    return [true, actionResult];
  } catch (error) {
    console.error("Error in createPaymentRequestHandler:", error);
    return [false, "Error creating payment request. Please try again."];
  }
};
export const getAllPaymentOfCheckerInternal = async (userid: string, paymentIndentifier: any): Promise<any[]> => {
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
export const businessActionOnPaymentRequestInternal = async (
  docId: string,
  action: string,
  remark: string,
  userId: string
): Promise<boolean | any> => {
  try {
    const actionResult = await PaymentRequestModel.findOneAndUpdate({ _id: docId },
      {
        $set:
        {
          recipientStatus: action,
          remark: remark
        }
      },
      { new: true })
    if (action !== "Approve") {
      return [true, actionResult]
    }
    const paymentRequest = await PaymentRequestModel.findOne({ _id: docId });
    if (paymentRequest) {
      // Update the date in each milestoneDetails object
      (paymentRequest as any).milestoneDetails.forEach(item => {
        item.date = updateDate(item.days);
      });

      // Save the updated document
      const finalactionResult = await paymentRequest.save();

      // Hold the amount if payment requester is buyer.
      if ((action as "Approve") === "Approve" && (paymentRequest.paymentIndentifier as "buyer") === "buyer") {
        // Create Bank FD
        await createBBFDRecords(docId);
        // Create RC FD
        await createRCFDRecords(docId);
      }

      if ((action as "Reject") === "Reject" && (paymentRequest.paymentIndentifier as "buyer") === "buyer") {
        // Revert Wallet Amount
        const walletres = await walletModel.findOne({ "userid": userId })
        const walletid = walletres._id
        await RevertHoldWalletAmount(walletid);
        // Create RC FD
        await RevertRCRecordfinal(docId);
      }
      return [true, finalactionResult]
    } else {
      return [false, 'Payment request not found']

    }



  } catch (err) {
    return [false, err]
  }
};
export const viewparticularrequestInternal = async (
  docId: string,
): Promise<boolean | any> => {
  try {
    const actionResult = await PaymentRequestModel.findOne({ _id: docId })
    const recipient=actionResult.recipient
    const recipientDetail = await userKYCs.findOne({user:recipient})
    return [true, { actionResult, recipientDetail }]
  } catch (err) {
    console.error(err);
  }
};
// Get recievables between a date range
export const getrecievablesInternal = async (
  userid: string,
  startDate: any,
  endDate: any
): Promise<boolean | any> => {
  try {
    const userIdObject = new mongoose.Types.ObjectId(userid)
    let matchQuery = {
      'paidTo': userIdObject,
    };
    if (startDate && endDate) {
      matchQuery['MilestoneDetails.date'] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    console.log("MATCH QUERY",matchQuery)
    const milestones = await PaymentRequestModel.aggregate([
      {
        $match: matchQuery,
      },
      {
        $unwind: '$MilestoneDetails',
      },
      {
        $match: {
          ...matchQuery,
          'MilestoneDetails.utilisedbySeller': { $eq: 0 }, // Exclude milestones where utilisedbySeller > 0
        },
      },
      {
        $lookup: {
        from: 'userkycs',
        localField: 'paidBy',
        foreignField: 'user',
        as: 'userkyc',
      },
    },
      // {
      //   $addFields: {
      //     'MilestoneDetails.isFDAllowed': {
      //       $cond: {
      //         if: {
      //           $gt: [
      //             { $subtract: [new Date(endDate), new Date(startDate)] }, // Calculate the difference
      //             7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      //           ],
      //         },
      //         then: 'yes',
      //         else: 'no',
      //       },
      //     },
      //   },
      // },
      {
        $project: {
          _id: '$_id',
          orderID: 1,
          paidBy: 1,
          proposalCreatedDate:1,
          recievingDate: '$MilestoneDetails.date', 
          utilisedbySeller: '$MilestoneDetails.utilisedbySeller',
          ApFees: '$MilestoneDetails.ApFees',
          ApproxInterest: '$MilestoneDetails.ApproxInterest',
          amount: '$MilestoneDetails.amount',
          recievablewhichpr:'$MilestoneDetails.recievablewhichpr',
          Legal_Name_of_Business: { $arrayElemAt: ['$userkyc.Legal_Name_of_Business', 0] },
        },
      },
    ]);

    return [true, milestones]
  } catch (err) {
    console.error(err);
  }
};



//Dashboard
export const getWalletBalanceInternal = async (
  userId: string,
): Promise<any | any> => {
  try {
    const wallet = await walletModel.findOne({ userId:userId }).select('amount');
    console.log("Wallet",wallet)
    if (wallet) {
      const balance = wallet.get('amount');
      return [true,{availableBalance:balance}];
    } else {
      return [false,"Requested wallet Balance not Found"];
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};
export const getbookedpaymentdashboardInternal = async (
  userid: string,
): Promise<boolean | any> => {
  try {
    const userIdObject = new mongoose.Types.ObjectId(userid);

    // Scenario 1: User as the creator (paidBy) and recipientStatus is "approved," and paymentIndentifier is "buyer."
    const queryCreator = {
      "paidBy": userIdObject,
      "recipientStatus": "approved",
      "paymentIndentifier": "buyer",
    };
    const resultCreator = await PaymentRequestModel.find(queryCreator);

    // Scenario 2: User as the recipient and recipientStatus is "approved," and paymentIndentifier is "seller."
    const queryRecipient = {
      "recipient": userIdObject,
      "recipientStatus": "approved",
      "paymentIndentifier": "seller",
    };
    const resultRecipient = await PaymentRequestModel.find(queryRecipient);
    const combinedResult = [...resultCreator, ...resultRecipient];
    const sumOrderAmount = combinedResult.reduce((sum, item) => sum + item.orderAmount, 0);
    const documentCount = combinedResult.length;

    return [true, { sumOrderAmount, documentCount }];
  } catch (err) {
    console.error(err);
    return [false, err]; 
  }
};
export const getrecievablesdashboardInternal = async (
  userid: string,
): Promise<boolean | any> => {
  try {
    const userIdObject = new mongoose.Types.ObjectId(userid);
    const upcomingMilestonesQuery = { "MilestoneDetails.date": { "$gte": new Date() } };

    // Scenario 1: User as the creator (paidTo) and recipientStatus is "approved," and paymentIndentifier is "seller."
    const queryCreator = {
      "paidTo": userIdObject,
      "recipientStatus": "approved",
      "paymentIndentifier": "seller",
      ...upcomingMilestonesQuery
    };
    const resultCreator = await PaymentRequestModel.find(queryCreator);
    console.log("resultCreator",resultCreator)

    // Scenario 2: User as the recipient and recipientStatus is "approved," and paymentIndentifier is "buyer."
    const queryRecipient = {
      "paidTo": userIdObject,
      "recipientStatus": "approved",
      "paymentIndentifier": "buyer",
      ...upcomingMilestonesQuery
    };
    const resultRecipient = await PaymentRequestModel.find(queryRecipient);
    console.log("resultRecipient",resultRecipient)

    const combinedResult = [...resultCreator, ...resultRecipient];

    let totalMilestones = 0;
    let totalReceivable = 0;

    combinedResult.forEach(({ MilestoneDetails }) => {
      MilestoneDetails.forEach(({ amount, utilisedbySeller, ApFees }) => {
        totalMilestones++;
        totalReceivable += amount - utilisedbySeller - ApFees;
      });
    });

    console.log("Total Number of Milestones:", totalMilestones);
    console.log("Total Receivable Amount:", totalReceivable);

    return [true, { totalMilestones, totalReceivable }];
  } catch (err) {
    console.error(err);
    return [false, err]; 
  }
};
export const getacceptpaymentdashboardInternal = async (
  userid: string,
): Promise<boolean | any> => {
  try {
    const userIdObject = new mongoose.Types.ObjectId(userid)
    const query = {
      "paidTo": userIdObject,
      "recipientStatus": "pending",
    }
    console.log("QUERY", query)
    const projection = {
      "orderAmount": 1,
      "paymentIndentifier": 1,
    };
    console.log("projection", projection)
    const result = await PaymentRequestModel.find(query, projection)
    console.log("RESULT", result)
    // Calculate the sum and count
    const sumOrderAmount = result.reduce((sum, item) => sum + item.orderAmount, 0);
    const documentCount = result.length;
    return [true, {sumOrderAmount,documentCount,}];
  } catch (err) {
    console.error(err);
  }
};
export const getpaymentrequestdashboardInternal = async (
  userid: string,
): Promise<boolean | any> => {
  try {
    const userIdObject = new mongoose.Types.ObjectId(userid)
    const query = {
      "paidBy": userIdObject,
      "recipientStatus": "pending",
    }
    console.log("QUERY", query)
    const projection = {
      "orderAmount": 1,
      "paymentIndentifier": 1,
    };
    console.log("projection", projection)
    const result = await PaymentRequestModel.find(query, projection)
    console.log("RESULT", result)
    // Calculate the sum and count
    const sumOrderAmount = result.reduce((sum, item) => sum + item.orderAmount, 0);
    const documentCount = result.length;
    return [true, {sumOrderAmount,documentCount,}];
  } catch (err) {
    console.error(err);
  }
};

//Dashboard Action page
// export const getpaymentrequestInternal = async (userid: string): Promise<boolean | any> => {
//   try {

//     const paymentRequests = await PaymentRequestModel.find({
//       paidTo:userid,
//       recipient: userid,
//       recipientStatus: 'pending'
//     })
//     let modelResults = [];
//     console.log("paymentRequests", paymentRequests)
//     const requester = (paymentRequests as any).requester;
//     const docId = (paymentRequests as any)._id;
//     const modelResult = await getRequestDetails(userid, requester);
//     modelResults.push(modelResult);
//     return [true, modelResults]
//   } catch (err) {

//     console.error(err);
//   }
// };
export const getpaymentrequestInternal = async (userid: string): Promise<boolean | any> => {
  try {
    const paymentRequests = await PaymentRequestModel.find({
      paidTo:userid,
      recipient: userid,
      recipientStatus: 'pending'
    })

    console.log("paymentRequests", paymentRequests);

    let modelResults = [];

    for (const paymentRequest of paymentRequests) {
      const requester = paymentRequest.paidBy;
      const docId = paymentRequest._id;

      const modelResult = await getRequestDetails(userid, requester);
      modelResults.push(modelResult);
    }

    console.log("modelResults", modelResults);

    return [true, modelResults];
  } catch (err) {
    console.error(err);
    return [false, err]; // Handle error appropriately
  }
};
// export const getPaymentToPayInternal = async (userid: string): Promise<boolean | any> => {
//   try {

//     const paymentRequests = await PaymentRequestModel.find({
//       paidBy:userid,
//       recipient: userid,
//       recipientStatus: 'pending'
//     })
//     let modelResults = [];
//     console.log("paymentRequests", paymentRequests)
//     const requester = (paymentRequests as any).requester;
//     const docId = (paymentRequests as any)._id;
//     const modelResult = await getRequestDetails(userid, requester);
//     modelResults.push(modelResult);
//     return [true, modelResults]
//   } catch (err) {

//     console.error(err);
//   }
// };
export const getPaymentToPayInternal = async (userid: string): Promise<boolean | any> => {
  try {
    const paymentRequests = await PaymentRequestModel.find({
      paidBy:userid,
      recipient: userid,
      recipientStatus: 'pending'
    })

    console.log("paymentRequests", paymentRequests);

    let modelResults = [];

    for (const paymentRequest of paymentRequests) {
      const requester = paymentRequest.paidTo;
      const docId = paymentRequest._id;

      const modelResult = await getRequestDetails(userid, requester);
      modelResults.push(modelResult);
    }

    console.log("modelResults", modelResults);

    return [true, modelResults];
  } catch (err) {
    console.error(err);
    return [false, err]; // Handle error appropriately
  }
};
// export const getBookedPaymentRequestInternal = async (userid: string): Promise<boolean | any> => {
//   try {

//     const paymentRequests = await PaymentRequestModel.find({
//       paidBy:userid,
//       recipientStatus: 'approved'
//     })
//     console.log("paymentRequests",paymentRequests)
//     let modelResults = [];
//     console.log("paymentRequests", paymentRequests)
//     const requester = await (paymentRequests as any).paidTo;
//     console.log("Before AWAIT",requester)
//     const docId = (paymentRequests as any)._id;
//     const modelResult = await getRequestDetails(userid, requester);
//     modelResults.push(modelResult);
//     return [true, modelResults]
//   } catch (err) {

//     console.error(err);
//   }
// };
export const getBookedPaymentRequestInternal = async (userid: string): Promise<boolean | any> => {
  try {
    const paymentRequests = await PaymentRequestModel.find({
      paidBy: userid,
      recipientStatus: 'approved'
    });

    console.log("paymentRequests", paymentRequests);

    let modelResults = [];

    for (const paymentRequest of paymentRequests) {
      const requester = paymentRequest.paidTo;
      const docId = paymentRequest._id;

      const modelResult = await getRequestDetails(userid, requester);
      modelResults.push(modelResult);
    }

    console.log("modelResults", modelResults);

    return [true, modelResults];
  } catch (err) {
    console.error(err);
    return [false, err]; // Handle error appropriately
  }
};








//MAker checker

export const getMakerRequestInternal = async (userid: string): Promise<boolean | any> => {
  try {
    const paymentRequests = await PaymentRequestModel.find({
      requester: userid,
      checkerStatus: 'pending'
    });
    console.log("paymentRequests", paymentRequests)
    let modelResults = [];

    for (const result of paymentRequests) {
      const createdby = result.createdby;
      const userId = result.requester;
      const businessName = result.recipient;
      const docId = result._id;
      const modelResult = await getBusinessDetails(userId, businessName, createdby, docId);
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
export const checkeractionInternal = async (
  docId: string,
  action: string,
  remark: string,
  userid: string): Promise<boolean | any> => {
  try {
    const orderId = await generateOrderID();
    const expireDate = await globalAdminSettings.findOne({}).select("buyerpaymentRequestDuration")
    console.log("expireDate", (expireDate as any).buyerpaymentRequestDuration)
    const expdays = (expireDate as any).buyerpaymentRequestDuration
    var currentDate = new Date();
    console.log(currentDate)
    var newDate = new Date(currentDate.getTime() + expdays * 24 * 60 * 60 * 1000)
    console.log(newDate)
    const timestamp = new Date(newDate).getTime();
    console.log(timestamp)
    const actionResult = await PaymentRequestModel.findOneAndUpdate({ _id: docId },
      {
        $set:
        {
          checkerStatus: action,
          remark: remark,
          orderID: orderId,
          proposalExpireDate: timestamp
        }
      },
      { new: true })
    console.log(actionResult)
    if (action == "Approve" && actionResult.paymentIndentifier == "buyer") {

      const walletres = await walletModel.findOne({ "userid": userid })

      const walletid = walletres._id
      const paidby = (actionResult as any).paidTo
      const paidto = (actionResult as any).paidBy
      const paymenttype = "debit"
      const paymentstatus = "hold"
      const orderAmount=(actionResult as any).orderAmount
      await createWalletTransaction(walletid, paidby, paidto, paymenttype, paymentstatus,orderAmount)
    }
    return [true, actionResult]
  } catch (err) {
    console.error(err);
  }
};
export const actionPaymentRequestInternal = async (
  docId: string,
  action: string,
  remark: string,
  userId: string): Promise<boolean | any> => {
  try {
    const walletres = await walletModel.findOne({ "userid": userId })
    const paymentRequest = await PaymentRequestModel.findOne({ _id: docId });
    if (paymentRequest.orderAmount > walletres.amount) {
      return [true, "You don't have sufficient balance in your account"]
    }
    const actionResult = await PaymentRequestModel.findOneAndUpdate({ _id: docId },
      {
        $set:
        {
          checkerStatus: action,
          remark: remark
        }
      },
      { new: true })
    if (action !== "Approve") {
      return [true, actionResult]
    }


    if (paymentRequest) {
      // Update the date in each milestoneDetails object
      (paymentRequest as any).milestoneDetails.forEach(item => {
        item.date = updateDate(item.days);
      });

      // Save the updated document
      const finalactionResult = await paymentRequest.save();

      if (action == "Approve" && paymentRequest.paymentIndentifier == "buyer") {

        const walletid = walletres._id
        const paidby = (paymentRequest as any).paidTo
        const paidto = (paymentRequest as any).paidBy
        const paymenttype = "debit"
        const paymentstatus = "hold"
        const orderAmount=(paymentRequest as any).orderAmount
        await createWalletTransaction(walletid, paidby, paidto, paymenttype, paymentstatus,orderAmount)
        await cascadeUpdateMilestoneAndPaymentRequest(paymentRequest._id);
      }

      return [true, finalactionResult]
    } else {
      return [false, 'Payment request not found']

    }



  } catch (err) {
    return [false, err]
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
export const manageMyMakerInternal = async (user: any, status: string): Promise<any> => {
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
    return [false, error.message];
  }
};




// Helping Functions


export const getBusinessDetails = async (userId, businessName, createdby, docId) => {
  try {
    // Fetch the 'addedby' details
    const addedby = await userRegisterations.findOne({ _id: createdby });
    console.log("businessName", businessName)
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
          "user": 1,
          "GSTIN_of_the_entity": 1,
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
          "GSTIN_of_the_entity": "$GSTIN_of_the_entity",
          "recipient": "$user",
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
export const getRequestDetails = async (userId, requester) => {
  try {
    // Continue with the existing aggregation pipeline

    const fuserid = new mongoose.Types.ObjectId(userId)
    const businessDetail = new mongoose.Types.ObjectId(requester)
    console.log("fuserid",fuserid)
    console.log("requester",businessDetail)
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
          "paymentIndentifier": 1,
          "MilestoneDetails":1,
          "orderID":1,
          "proposalCreatedDate":1,
          "proposalStatus":1,
        }
      }

    ]);


    return result;
  } catch (error) {
    return error.message;
  }
}
// To create Wallert Transaction
export const createWalletTransaction = async (
  walletID: string,
  paidBy: string,
  paidto: string,
  paymentype: string,
  paymentstatus: string,
  orderAmount:number
): Promise<boolean | any> => {
  try {
    const finalbody = {
      "walletID": walletID,
      "paidBy": paidBy,
      "paidto": paidto,
      "paymentype": paymentype,
      "paymentstatus": paymentstatus,
      "BankBalanceAmount":orderAmount,
      "updated_at": new Date()
    }
    const walletTransactionres = new walletTransaction(finalbody);
    const savedTransaction = await walletTransactionres.save();
    return savedTransaction
  } catch (error) {
    return (error.message);
  }
};
const cascadeUpdateMilestoneAndPaymentRequest = async (paymentRequestId) => {
  try {
    const paymentRequest = await PaymentRequestModel.findById(paymentRequestId);

    if (!paymentRequest) {
      throw new Error('Payment request not found');
    }
    const utilisedforpr = paymentRequest._id
    // Find milestones that meet specific conditions
    const milestonesToUpdate = paymentRequest.MilestoneDetails.filter(
      (milestone) =>
        milestone.recievablewhichpr &&
        milestone.recievablewhichms

    );

    // Iterate over the selected milestones
    for (const milestone of milestonesToUpdate) {
      // Extract relevant information
      const { recievableUsed, recievablewhichpr, recievablewhichms } = milestone;
      const milestoneId = (milestone as any)._id;

      // Find other payment requests with the same utilisedforpr value
      const relatedPaymentRequests = await PaymentRequestModel.find({
        '_id': recievablewhichpr,
      });

      // Iterate over related payment requests and update utilisedbySeller
      for (const relatedPaymentRequest of relatedPaymentRequests) {
        const relatedMilestone = relatedPaymentRequest.MilestoneDetails.find(
          (m) => (m as any)._id.toString() === recievablewhichms
        );

        if (relatedMilestone) {
          // Update utilisedbySeller for the related milestone
          relatedMilestone.utilisedbySeller = recievableUsed;
          relatedMilestone.utilisedforpr = utilisedforpr;
          relatedMilestone.utilisedforms = milestoneId;

          // Save the updated payment request
          await relatedPaymentRequest.save();

          console.log(`Updated utilisedbySeller for milestone ${milestoneId} in payment request ${relatedPaymentRequest._id}`);
        }
      }
    }

    console.log('Cascade update completed successfully');
  } catch (error) {
    console.error('Error in cascade update:', error.message);
  }
};
const RevertRCRecordfinal = async (paymentRequestId) => {
  try {
    const paymentRequest = await PaymentRequestModel.findById(paymentRequestId);

    if (!paymentRequest) {
      throw new Error('Payment request not found');
    }
    const utilisedforpr = paymentRequest._id
    // Find milestones that meet specific conditions
    const milestonesToUpdate = paymentRequest.MilestoneDetails.filter(
      (milestone) =>
        milestone.recievablewhichpr &&
        milestone.recievablewhichms

    );

    // Iterate over the selected milestones
    for (const milestone of milestonesToUpdate) {
      // Extract relevant information
      const { recievableUsed, recievablewhichpr, recievablewhichms } = milestone;
      const milestoneId = (milestone as any)._id;

      // Find other payment requests with the same utilisedforpr value
      const relatedPaymentRequests = await PaymentRequestModel.find({
        '_id': recievablewhichpr,
      });

      // Iterate over related payment requests and update utilisedbySeller
      for (const relatedPaymentRequest of relatedPaymentRequests) {
        const relatedMilestone = relatedPaymentRequest.MilestoneDetails.find(
          (m) => (m as any)._id.toString() === recievablewhichms
        );

        if (relatedMilestone) {
          // Update utilisedbySeller for the related milestone
          relatedMilestone.utilisedbySeller = 0;
          relatedMilestone.utilisedforpr = null;
          relatedMilestone.utilisedforms = null;

          // Save the updated payment request
          await relatedPaymentRequest.save();

          console.log(`Updated utilisedbySeller for milestone ${milestoneId} in payment request ${relatedPaymentRequest._id}`);
        }
      }
    }

    console.log('Cascade update completed successfully');
  } catch (error) {
    console.error('Error in cascade update:', error.message);
  }
};
const updateDate = (days) => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + days);
  return currentDate.toLocaleDateString('en-GB'); // Assuming date format is 'dd/MM/yyyy'
};
// const RevertRCRecord = async (paymentRequestId) => {
//   try {
//     const paymentRequest = await PaymentRequestModel.findById(paymentRequestId);

//     if (!paymentRequest) {
//       throw new Error('Payment request not found');
//     }

//     // Find milestones that meet specific conditions
//     const milestonesToUpdate = paymentRequest.MilestoneDetails.filter(
//       (milestone) =>
//         milestone.utilisedforpr &&
//         milestone.utilisedbySeller &&
//         milestone.recievableUsedStatus
//     );

//     // Iterate over the selected milestones
//     for (const milestone of milestonesToUpdate) {
//       // Extract relevant information
//       const { utilisedforpr, utilisedbySeller } = milestone;
//       const milestoneId = (milestone as any)._id;

//       // Find other payment requests with the same utilisedforpr value
//       const relatedPaymentRequests = await PaymentRequestModel.find({
//         'MilestoneDetails.utilisedforpr': utilisedforpr,
//       });

//       // Iterate over related payment requests and revert utilisedforpr and utilisedbySeller
//       for (const relatedPaymentRequest of relatedPaymentRequests) {
//         const relatedMilestone = relatedPaymentRequest.MilestoneDetails.find(
//           (m) => (m as any)._id.toString() === milestoneId.toString()
//         );

//         if (relatedMilestone) {
//           // Revert utilisedforpr and utilisedbySeller for the related milestone
//           relatedMilestone.utilisedforpr = null;
//           relatedMilestone.utilisedbySeller = null;

//           // Save the updated payment request
//           await relatedPaymentRequest.save();

//           console.log(`Reverted utilisedforpr and utilisedbySeller for milestone ${milestoneId} in payment request ${relatedPaymentRequest._id}`);
//         }
//       }
//     }

//     console.log('Revert RC record completed successfully');
//   } catch (error) {
//     console.error('Error reverting RC record:', error.message);
//   }
// };
const RevertHoldWalletAmount = async (walletId) => {
  try {
    // Find and update WalletTransactionSchema
    const walletTransaction = await Wallettransaction.findOneAndUpdate(
      { wallet: walletId, paymentStatus: 'hold' },
      { $set: { paymentStatus: 'rejected' } },
      { new: true }
    );

    if (!walletTransaction) {
      throw new Error('Wallet transaction not found or already updated');
    }

    // Update WalletSchema
    const wallet = await walletModel.findOneAndUpdate(
      { _id: walletId },
      { $inc: { amount: walletTransaction.BankBalanceAmount } },
      { new: true }
    );

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    console.log('Reverted hold wallet amount successfully');
  } catch (error) {
    console.error('Error reverting hold wallet amount:', error.message);
  }
};
const createRCFDRecords = async (paymentRequestId) => {
  try {
    const paymentRequest = await PaymentRequestModel.findById(paymentRequestId);

    if (!paymentRequest) {
      throw new Error('Payment request not found');
    }

    // Iterate over MilestoneDetails and create a record in rcfdSchema for each milestone
    for (const milestone of paymentRequest.MilestoneDetails) {
      // Check if utilisedforpr exists
      if (!milestone.recievablewhichpr) {
        console.warn(`recievablewhichpr not found for milestone ${(milestone as any)._id}`);
        continue; // Skip this milestone if utilisedforpr is not found
      }

      // Find the related payment request using utilisedforpr
      const relatedPaymentRequest = await PaymentRequestModel.findById(milestone.recievablewhichpr);

      if (!relatedPaymentRequest) {
        console.warn(`Related payment request not found for milestone ${(milestone as any)._id}`);
        continue; // Skip this milestone if the related payment request is not found
      }
      const finaldate = relatedPaymentRequest.MilestoneDetails
      // Create a new record in rcfdSchema
      const newRCFDRecord = new rcFDSchema({
        paymentRequest: paymentRequest._id,
        milestoneDetails: (milestone as any)._id,
        recievablewhichpr: milestone.recievablewhichpr,
        recievablewhichms: milestone.recievablewhichms,
        creationDate: new Date(),
        endDate: milestone.date,
        getrcdate: (finaldate as any).date, // Adjust this line based on the actual structure of your MilestoneDetails
        amount: milestone.utilisedbySeller,
        eliglibleforInterest: 'your_eligible_for_interest_value', // Replace with your actual value
      });

      // Save the new RCFD record
      await newRCFDRecord.save();

      console.log(`RCFD record created for milestone ${(milestone as any)._id}`);
    }

    console.log('RCFD records creation completed successfully');
  } catch (error) {
    console.error('Error creating RCFD records:', error.message);
  }
};
const createBBFDRecords = async (paymentRequestId) => {
  try {
    const paymentRequest = await PaymentRequestModel.findById(paymentRequestId);

    if (!paymentRequest) {
      throw new Error('Payment request not found');
    }

    // Iterate over MilestoneDetails and create a record in bbfdSchema for each milestone
    for (const milestone of paymentRequest.MilestoneDetails) {
      const newBBFDRecord = new bbFDSchema({
        paymentRequest: paymentRequest._id,
        creationDate: new Date(),
        endDate: milestone.date,
        amount: milestone.balancedUsed,
      });

      // Save the new BBFD record
      await newBBFDRecord.save();

      console.log(`BBFD record created for milestone ${(milestone as any)._id}`);
    }

    console.log('BBFD records creation completed successfully');
  } catch (error) {
    console.error('Error creating BBFD records:', error.message);
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






// export const getbookedpaymentdashboardInternal = async (
//   userid: string,
// ): Promise<boolean | any> => {
//   try {
//     const userIdObject = new mongoose.Types.ObjectId(userid)
//     const query = {
//       "paidBy": userIdObject,
//       "recipientStatus": "accepted",
//       "recipient": userIdObject || "", // Add this condition to filter by paymentIndentifier
//     }
//     console.log("QUERY", query)
//     const projection = {
//       "orderAmount": 1,
//       "paymentIndentifier": 1,
//     };
//     console.log("projection", projection)
//     const result = await PaymentRequestModel.find(query, projection)
//     console.log("RESULT", result)

//     // Calculate the sum and count
//     const sumOrderAmount = result.reduce((sum, item) => sum + item.orderAmount, 0);
//     const documentCount = result.length;
//     return [true, {sumOrderAmount,documentCount,}];
//   } catch (err) {
//     console.error(err);
//   }
// };









