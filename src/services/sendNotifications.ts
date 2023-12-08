import { SNS } from 'aws-sdk';

const sns = new SNS();

/**
 * Send a push notification to a specific user.
 * @param {string} userId 
 * @param {string} message
 * @param {function} callback 
 */
const sendNotification = (userId: string, message: string, callback: (error: Error | null, data: any) => void) => {
  const params: SNS.PublishInput = {
    Message: message,
    MessageStructure: 'string',
    TargetArn: `arn:aws:sns:ap-south-1:506962296907:apnotifications:${userId}`,
  };

  sns.publish(params, (err, data) => {
    if (err) {
      console.error(err);
      callback(err, null);
    } else {
      console.log('Notification sent:', data);
      callback(null, data);
    }
  });
};

export default sendNotification;
