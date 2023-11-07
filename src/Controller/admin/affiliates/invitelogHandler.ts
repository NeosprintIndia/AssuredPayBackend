import invitemodel from "../../../models/affiliateInviteModel"
import {getSkipAndLimitRange} from "../../../utils/pagination"


export const inviteLogsInternal = async (): Promise<any[]> => {
  try {
    const result = await invitemodel.aggregate([
      {
        $group: {
          _id: {
            affiliateId: '$affiliateId',
            //businessInvitedThrough: '$businessInvitedThrough'
          },
          businessSignupStatusCount: { $sum: { $cond: ['$businessSignupStatus', 1, 0] }},
          businessOnboardedStatusCount: { $sum: { $cond: ['$businessOnboardedStatus', 1, 0] }},
          businessEscrowOpenedStatusCount: { $sum: { $cond: ['$businessEscrowOpenedStatus', 1, 0] }},
          businessConvertedStatusCount: { $sum: { $cond: ['$businessConvertedStatus', 1, 0] }},
          TotalCount: { $sum: 1 } 
        }
      },
      {
        $project: {
          _id: 0,
          affiliateId: '$_id.affiliateId',
          businessInvitedThrough: '$_id.businessInvitedThrough',
          TotalCount: 1, 
          notsignedup: { $subtract: ['$TotalCount', '$businessSignupStatusCount'] },
          businessSignupStatusCount: 1,
          businessOnboardedStatusCount: 1,
          businessEscrowOpenedStatusCount: 1,
          businessConvertedStatusCount: 1,
          
        }
      }
    ]);
    console.log(result);
    return [true, result];
  } catch (error) {
    console.log(error);
    return [false, error];
  }
};

// export const inviteLogsSpecificAffiliateInternal = async (id:string): Promise<any[]> => {
//   try {
//    const result= await invitemodel.find({ affiliateId:id }, { businessInvitedNumber: 1, businessInvitedMail: 1,businessStatus:1, commissionWhileLastInviting: 1, commissionStatus: 1,_id: 0 })
//     console.log(result);
//     return [true, result];
//   } catch (error) {
//     console.log(error);
//     return [false, error];
//   }
// };
export const inviteLogsSpecificAffiliateInternal = async (userId, rowsPerPage, page, commission): Promise<any> => {
  try {
    let query; 
    let searchQuery;
    let result;
    let affiliateInviteDetails;
    const [skipLimit, limitRange] = await getSkipAndLimitRange(page, rowsPerPage);
    query = {affiliateId:userId}
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
      affiliateInviteDetails = await invitemodel.aggregate([searchQuery]).limit(limitRange).skip(skipLimit);;
      console.log("affiliateInviteDetails",affiliateInviteDetails)
      result = {
        affiliateInviteRecords: affiliateInviteDetails[0]?.["affiliateInviteRecords"],
        totalInvitations: affiliateInviteDetails[0]?.["totalInvitations"]?.[0]?.["totalInvitations"],
        commissionExpected: affiliateInviteDetails[0]?.["commissionExpected"]?.[0]?.["commissionExpected"],
        commissionSettled: affiliateInviteDetails[0]?.["commissionSettled"]?.[0]?.["commissionSettled"]
      }
    } else {
      affiliateInviteDetails = await invitemodel.find(query).limit(limitRange).skip(skipLimit);;
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
