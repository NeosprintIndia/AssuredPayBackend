import affiliateInvite from '../../../models/affiliateInviteModel';
import affiliate from '../../../models/affiliateModel';
import bank from '../../../models/bankAP';
import {getSkipAndLimitRange} from "../../../utils/pagination"
import globalSettings from '../../../models/globalAdminSettings';
import { sendDynamicMail } from "../../../services/sendEmail";
import { sendSMS } from "../../../services/sendSMS";
import Referral from "../../../models/refferalCodes";
import { Bank_Account_Verify } from "../../../services/sandboxs";
const isSignedUp = async( businessInvitedMail, businessInvitedNumber) => {
    let searchQuery 
    if(businessInvitedMail) searchQuery = {businessInvitedMail}
    else if (businessInvitedNumber) searchQuery = {businessInvitedNumber}
    else throw({message: "Please provide email or mobile number to send the invite." })
    let affiliateInviteDetails = await affiliateInvite.find(searchQuery);
    if(!affiliateInviteDetails.length) return false;
    else {
        for(let affiliateInviteObject of affiliateInviteDetails){
            if(affiliateInviteObject["businessSignupStatus"]) return true;
        }
    }
    return false;
  };
export const findAndInsert = async (userId, businessInvitedMail, businessInvitedNumber): Promise<any> => {
  try {
    console.log("USER ID",userId)
    let searchQuery;
    let affiliateId
    let affiliateCode
    let referralCode = await Referral.find({ user:userId }, "referralCode");
    console.log("referralCode",referralCode)
    let affiliateDetails = await affiliate.find({ userId }, "_id userId referralCode");
    if(!affiliateDetails.length) throw({message: "Affiliate does not exist with this user id."})
    else {
      affiliateId = affiliateDetails[0].userId;
      affiliateCode = referralCode[0].refferal_code;
  } 
    const isAlreadySignedUp = await isSignedUp( businessInvitedMail, businessInvitedNumber);
    if(isAlreadySignedUp) return [true,  "Invited user has already signed up. Thanks for inviting."]
    if(businessInvitedMail) searchQuery = {$and: [{affiliateId}, {businessInvitedMail}]};
    else  searchQuery = {$and: [{affiliateId}, {businessInvitedNumber}]};
    const refferalCommission = await globalSettings.find({},{ refferalCommission: 1 }) // details are still not there
    let currentCommission = refferalCommission.length > 0 ? refferalCommission[0].refferalCommission : 0;
    const doucment = await affiliateInvite.find(searchQuery);
    if(!doucment.length) {
        //invite through mail and sms
      let affiliateInviteObject = {
        affiliateId: affiliateId,
        commissionWhileLastInviting: currentCommission 
      }
      if(businessInvitedMail) {
        affiliateInviteObject["businessInvitedMail"] = businessInvitedMail;
        affiliateInviteObject["businessInvitedThrough"] = "mail";
      } else{
        affiliateInviteObject["businessInvitedNumber"] = businessInvitedNumber;
        affiliateInviteObject["businessInvitedThrough"] = "mobileNumber";

      } 
      const result = await affiliateInvite.create(affiliateInviteObject);
      const reqData = {
        Email_slug: "Affiliate_Invited_Business",
        email: businessInvitedMail,
        VariablesEmail: ["URL",affiliateCode],
  
        receiverNo: businessInvitedNumber,
        Message_slug: "Affiliate_Invited_Business",
        VariablesMessage: ["URL",affiliateCode],
      };
      await sendDynamicMail(reqData);
      await sendSMS(reqData);
      return [true, result];
    } else {
        const result = await affiliateInvite.findOneAndUpdate(searchQuery, {
            $inc: {invitedTimes: 1},
            $set: {commissionWhileLastInviting: currentCommission, date: new Date()}  
        }, {new: true});
        if(result){
            console.log("User invited document has updated successfully.")
            const reqData = {
              Email_slug: "Affiliate_Invited_Business",
              email: businessInvitedMail,
              VariablesEmail: ["URL",affiliateCode],
        
              receiverNo: businessInvitedNumber,
              Message_slug: "Affiliate_Invited_Business",
              VariablesMessage: ["URL",affiliateCode],
            };
            await sendDynamicMail(reqData);
            await sendSMS(reqData);
            return [true, result]
        } else throw({message: "Error while updating the invite."})
    }
    
  } catch (error) {
    console.log("Error occured while inserting the affiliateInvite.", error);
    return  [false, error.message];
  }
  };
export const get = async (userId, rowsPerPage, page, commission): Promise<any> => {
    try {
      let query; 
      let searchQuery;
      let result;
      let affiliateInviteDetails;
      const [skipLimit, limitRange] = await getSkipAndLimitRange(page, rowsPerPage);
       let affiliateId = await getAffiliateId(userId);
      
      console.log("affiliateId",affiliateId)
      if(!affiliateId) throw ({message: "Affiliate does not exist with this user id."})
      query = {affiliateId}
      if(commission == "true") {
        searchQuery  = {
          "$facet": {
            "affiliateInviteRecords" : [
              {"$match" : query},
              {"$skip": skipLimit}, 
              {"$limit": limitRange}
            ],
            "totalInvitations": [
              { "$match" : query},
              { "$count": "totalInvitations" },
            ],
            "commissionExpected": [
              { "$match" : {$and: [query, {commissionStatus: "eligible"}]}},
              {$group: {
                _id: null,
                commissionExpected: { $sum: "$commissionWhileLastInviting" }
              }}
            ],
            "commissionSettled": [
              { "$match" :{$and: [query, {commissionStatus: "settled"}]}},
              {$group: {
                _id: null,
                commissionSettled: { $sum: "$commissionWhileLastInviting" }
              }}
            ]
          }
        }
        console.log("searchQuery",searchQuery)
        affiliateInviteDetails = await affiliateInvite.aggregate([searchQuery]).limit(limitRange).skip(skipLimit);;
        console.log("affiliateInviteDetails",)
        result = {
          affiliateInviteRecords: affiliateInviteDetails[0]?.["affiliateInviteRecords"],
          totalInvitations: affiliateInviteDetails[0]?.["totalInvitations"]?.[0]?.["totalInvitations"],
          commissionExpected: affiliateInviteDetails[0]?.["commissionExpected"]?.[0]?.["commissionExpected"],
          commissionSettled: affiliateInviteDetails[0]?.["commissionSettled"]?.[0]?.["commissionSettled"]
        }
      } else {
        affiliateInviteDetails = await affiliateInvite.find(query).limit(limitRange).skip(skipLimit);;
        result = {
          affiliateInviteRecords : affiliateInviteDetails
        }
      }
      console.log("Affiliate invite details have been fetched successfully.");
      return [true, result];
    } catch (error) {
      console.log("Error occured while fetching the affiliateInvite.", error);
      return  [false, error.message];
    }
  };
  const getAffiliateId = async (userId) => {
    let affiliateId;
    let affiliateDetails = await affiliate.find({userId}, "userId");
    if(!affiliateDetails.length) throw({message: "Affiliate does not exist with this user id."})
    else  affiliateId = affiliateDetails[0].userId;
    return affiliateId;
  }
  export const addBankAccountInternal = async (
    bankAccountNumber: string,
    ifsc: string,
    beneficiaryName: string,
    bankName: string,
    userId: string
  ): Promise<[boolean, string]> => {
    try {
      const affiliateData = await affiliate.findOne({ userId: userId });
  
      if (affiliateData && affiliateData.AccountDetails.length >=2) {
        return [false, "You have reached the maximum limit of 3 bank accounts."];
      }
      const result = await Bank_Account_Verify({
        ifsc: ifsc,
        account_number: bankAccountNumber,
        mobile: "9555676903",
        name: beneficiaryName
      });
      const nameAtBank = result.body.data.name_at_bank;
      console.log("nameAtBank",nameAtBank)
      let beneName ="";
      if (affiliateData.type === "individual") {
        (beneName as any) = affiliateData.panFirstName;
      } else if (affiliateData.type === "businessFirm") {
        (beneName as any) = affiliateData.legalNameOfBusiness.toLowerCase();
      }
      const normalizedBeneName = beneName.replace(/\s/g, "").toLowerCase();
      const normalizedNameAtBank = nameAtBank.replace(/\s/g, "").toLowerCase();
      const checkNameAtBank = normalizedNameAtBank.startsWith(normalizedBeneName);
      if (!checkNameAtBank) {
        return [false, "Beneficiary name does not match the provided bank account details."];
      }
      const updateResult = await affiliate.updateOne(
        { userId: userId },
        {
          $push: {
            AccountDetails: {
              bankAccountNumber: bankAccountNumber,
              ifsc: ifsc,
              bankName: bankName,
              beneficiaryName: beneficiaryName,
              name_at_bank:nameAtBank
            },
          },
        }
      );
  
      if (updateResult.modifiedCount === 1) {
        return [true, "Bank account details added successfully."];
      } else {
        return [false, "Failed to add bank account details."];
      }
    } catch (error) {
      console.error("Error occurred while inserting the AccountDetails.", error);
      return [false, error.message];
    }
  };
  export const getBankAccountsInternal = async (userId): Promise<any[]> => {
    try {
      const user = await affiliate.findOne({ "userId": userId });
      if (user && user.AccountDetails && user.AccountDetails.length > 0) {
        const modifiedAccountDetails = user.AccountDetails.map(account => {
          return {
            bankAccountNumber: account.bankAccountNumber,
            ifsc: account.ifsc,
            bankName: account.bankName,
            benificiaryName:account.benificiaryName,
            name_at_bank:account.name_at_bank
          };
        });
        return [true,modifiedAccountDetails];
      } else {
        return [];
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  export const addBankNamesInternal = async (
    bankName: string,
  ): Promise<[boolean, string]> => {
    try {
      const existingBank = await bank.findOne({ bankName });
      if (existingBank) {
        return [false, 'Bank account with this name already exists'];
      }
      const newBank = await bank.create({
        bankName,
      });
      if (newBank) {
        return [true, 'Bank account added successfully'];
      } else {
        return [false, 'Failed to add bank account'];
      }
    } catch (error) {
   
      console.error('Error adding bank account:', error.message);
      return [false, 'An error occurred while adding the bank account'];
    }
  };
  export const BankNamesInternal = async (
    bankName?: string, // Make bankName optional
  ): Promise<[boolean, any]> => {
    try {
      if (!bankName) {
        // If bankName is not provided, return the full bank list
        const allBanks = await bank.find({});
        const allBankNames = allBanks.map((bank) => bank.bankName);
        return [true, allBankNames];
      }
  
      // Perform a case-insensitive partial search using a regular expression
      const regex = new RegExp(bankName, 'i');
      const matchingBanks = await bank.find({ bankName: regex });
  
      if (matchingBanks.length > 0) {
        // Extract the names of matching banks into an array of objects
        const matchingBankNames = matchingBanks.map((bank) => bank.bankName);
        return [true, matchingBankNames];
      } else {
        return [false, []];
      }
    } catch (error) {
      console.error('Error in BankNamesInternal:', error);
      throw error;
    }
  };
  
  
