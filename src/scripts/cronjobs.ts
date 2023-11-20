import cron from 'node-cron'
import PaymentRequestModel from "../models/paymentRequest";

function UpdateProposalStatus() {cron.schedule('26 21 * * *', async () => {
    try {
        console.log('Cron job is running.');
      // Find all payment requests where proposalStatus is not accepted
      const paymentRequestsToUpdate = await PaymentRequestModel.find({
        recipientStatus: { $ne: 'approved' },
      });
  
      // Update the proposalStatus to expired for each payment request
      await Promise.all(
        paymentRequestsToUpdate.map(async (paymentRequest) => {
          paymentRequest.proposalStatus = 'expired';
          await paymentRequest.save();
        })
      );
  
      console.log('Payment requests updated successfully.');
    } catch (error) {
      console.error('Error updating payment requests:', error);
    }
  });}

  export default UpdateProposalStatus;