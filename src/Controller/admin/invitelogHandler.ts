import invitemodel from "../../models/affiliateInviteModel"


export const inviteLogsInternal = async (): Promise<any[]> => {
  try {
    const result = await invitemodel.aggregate([
      {
        $group: {
          _id: {
            affiliateId: '$affiliateId',
            businessInvitedThrough: '$businessInvitedThrough'
          },
          businessSignupStatusCount: { $sum: { $cond: ['$businessSignupStatus', 1, 0] }},
          businessOnboardedStatusCount: { $sum: { $cond: ['$businessOnboardedStatus', 1, 0] }},
          businessEscrowOpenedStatusCount: { $sum: { $cond: ['$businessEscrowOpenedStatus', 1, 0] }},
          businessConvertedStatusCount: { $sum: { $cond: ['$businessConvertedStatus', 1, 0] }},
          TotalCount: { $sum: 1 } // Calculate the total count within the group
        }
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field
          affiliateId: '$_id.affiliateId',
          businessInvitedThrough: '$_id.businessInvitedThrough',
          TotalCount: 1, // Include the TotalCount field
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
