import * as AWS from "aws-sdk";
import { SESConfig } from "../services/awsInitialise";
import { findAlertsTemplate } from "../services/findTemplate";
import { replaceVarsInSequence } from "../services/replaceVariableInTemplate";
// Import other necessary modules as needed

const sendDynamicMail = async (data: any) => {
    try {
        // Fetch the template using the provided slug
        const templateDoc = await findAlertsTemplate(data.Email_slug);

        const emailContent: string = replaceVarsInSequence(
            templateDoc.data.Email,
            data.VariablesEmail
        );

        const subject = templateDoc.data.Subject;

        AWS.config.update(SESConfig);

        // Create sendEmail params
        const params: AWS.SES.SendEmailRequest = {
            Destination: {
                CcAddresses: [data.email],
                ToAddresses: [data.email],
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: emailContent, // Use the updated email content
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: "",
                    },
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: subject, // Use the updated subject
                },
            },
            Source: "developer@neosprint.in",
            ReplyToAddresses: ["developer@neosprint.in"],
        };

        // Create the promise and SES service object
        const sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
            .sendEmail(params)
            .promise();

        // Handle promise's fulfilled/rejected states
        const response = await sendPromise;
        console.log(response.MessageId);
    } catch (error) {
        console.error(error, error.stack);
    }
};

export { sendDynamicMail };
