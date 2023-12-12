import cron from 'node-cron'
import PaymentRequestModel from "../models/paymentRequest";

function UpdateProposalStatus() {cron.schedule('26 21 * * *', async () => {
    try {
        console.log('Cron job is running.');
      const paymentRequestsToUpdate = await PaymentRequestModel.find({
        recipientStatus: { $ne: 'approved' },
      });
      await Promise.all(
        paymentRequestsToUpdate.map(async (paymentRequest) => {
          paymentRequest.proposalStatus = 'expired';
          paymentRequest.orderStatus = 'expired';
          await paymentRequest.save();
        })
      );
  
      console.log('Payment requests updated successfully.');
    } catch (error) {
      console.error('Error updating payment requests:', error);
    }
  });}
  
  export default UpdateProposalStatus;