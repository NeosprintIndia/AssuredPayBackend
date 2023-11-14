import PaymentRequestModel from "../../models/paymentRequest";
import userRegisterations from "../../models/userRegisterations";
import subUsers from "../../models/subUsers";
import {findUserByEmailUsername,generateTemporaryPassword} from "../../Controller/auth/authHandler"

import * as CryptoJS from "crypto-js";
import "dotenv/config";
import { sendDynamicMail } from "../../services/sendEmail";
import { sendSMS } from "../../services/sendSMS";

export const createPaymentRequestHandler = async (
  orderTitle:string,
  business_id: string,
  paymentType: string,
  POPI: string,
  orderAmount: number,
  paymentIndentifier: string,
  paymentDays: number,
  MilestoneDetails: object,
  userId: string,
): Promise<boolean | any> => {
  try {
    const requester = await subUsers.findOne({"userId":userId})
    //.select('belongsTo');  bad mai sahi krna hai projection se belong to lena hai
  
    const paidto = (paymentIndentifier === "buyer") ? business_id :  requester.belongsTo;
    const paidby = (paymentIndentifier === "buyer") ?  requester.belongsTo : business_id;

    const paymentRequestData = {
      paymentType: paymentType,
      POPI: POPI,
      orderAmount: orderAmount,
      paymentIndentifier: paymentIndentifier,
      paymentDays: paymentDays,
      MilestoneDetails: MilestoneDetails,
      createdby: userId,
      requester: requester.belongsTo,  // CHnage after
      checkerStatus:"pending",
      recipientStatus:"pending",
      recipient: business_id,
      orderTitle:orderTitle,
      paidTo:paidto,
      paidBy:paidby
    }; // Assuming the request body contains the data for the payment request

    const newPaymentRequest = new PaymentRequestModel(paymentRequestData);
    const finalresult = await newPaymentRequest.save();

    return [true, finalresult];
  } catch (error) {
    return [false, error];
  }
};

export const performRegistration = async (
  business_email: string,
  username: string,
  business_mobile: string,
  role: string,
  userid:string
): Promise<boolean | any> => {
  try {
    const isExisting = await findUserByEmailUsername(
     // business_email,
       username);

    if (isExisting) {
      return [false, "Already existing business or Username"];
    } else {
      const newUser = await createUser(
        business_email,
        business_mobile,
        username,
        role,
        userid
      );
  
      if (!newUser[0]) {
        return [false, "Unable to create new user"];
      } else {
        return [true, newUser];
      }
    }
  } catch (error) {
    return [false, error];
  }
};

const createUser = async (
  business_email: string,
  business_mobile: string,
  username: string,
  role:string,
  userid:string
): Promise<[boolean, any]> => {
  try {
    const tempPassword = generateTemporaryPassword();
    const hashedPassword = await CryptoJS.AES.encrypt(
      tempPassword,
      process.env.PASS_PHRASE
    ).toString();
  
    const newUser = await userRegisterations.create({
      business_email,
      business_mobile,
      password: hashedPassword,
      username,
      oldPasswords: [hashedPassword],
      role:role
    });
    const newSU = await subUsers.create({
      userId:newUser._id,
      belongsTo:userid
     
    });
    console.log("TEMP PASSWORD",tempPassword)
// change the email format for temporary password for subuser
    const reqData = {
      Email_slug: "Verification_OTP",
      email: business_email,
      VariablesEmail: [username, tempPassword],

      receiverNo: business_mobile,
      Message_slug: "Verification_OTP",
      VariablesMessage: [username, tempPassword],
    };
    await sendDynamicMail(reqData);
    await sendSMS(reqData);

    
    return [true, newUser];
  } catch (error) {
    console.error("Error in createUser:", error);
    return [false, error]; 
  }
};
