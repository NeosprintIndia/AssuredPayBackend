import affiliateInvite from '../../../models/affiliateInviteModel';
import affiliate from '../../../models/affiliateModel';
import {getSkipAndLimitRange} from "../../../utils/pagination"
import globalSettings from '../../../models/globalAdminSettings';
 
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
}
export const findAndInsert = async (userId, businessInvitedMail, businessInvitedNumber): Promise<any> => {
  try {
    let searchQuery;
    let affiliateId
    let affiliateDetails = await affiliate.find({userId}, "_id");
    if(!affiliateDetails.length) throw({message: "Affiliate does not exist with this user id."})
    else  affiliateId = affiliateDetails[0]._id;
    const isAlreadySignedUp = await isSignedUp( businessInvitedMail, businessInvitedNumber);
    if(isAlreadySignedUp) return [true,  "Invited user has already signed up. Thanks for inviting."]
    if(businessInvitedMail) searchQuery = {$and: [{affiliateId}, {businessInvitedMail}]};
    else  searchQuery = {$and: [{affiliateId}, {businessInvitedNumber}]};
    // const currentCommission = await globalSettings.find({}) // details are still not there
    const currentCommission = 600;
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
      console.log("Affiliate invited the person successfully.");
      return [true, result];
    } else {
        const result = await affiliateInvite.findOneAndUpdate(searchQuery, {
            $inc: {invitedTimes: 1},
            $set: {commissionWhileLastInviting: currentCommission, date: new Date()}  
        }, {new: true});
        if(result){
            console.log("User invited document has updated successfully.")
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
        affiliateInviteDetails = await affiliateInvite.aggregate([searchQuery]).limit(limitRange).skip(skipLimit);;
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
    let affiliateDetails = await affiliate.find({userId}, "_id");
    if(!affiliateDetails.length) throw({message: "Affiliate does not exist with this user id."})
    else  affiliateId = affiliateDetails[0]._id;
    return affiliateId.toString();
  }