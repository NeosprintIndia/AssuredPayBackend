import * as AWS from "aws-sdk";
import { SESConfig } from "../services/awsInitialise";
import { findAlertsTemplate } from "../services/findTemplate";
import { replaceVarsInSequence } from "../services/replaceVariableInTemplate";

const sendDynamicMail = async (data: any) => {
    try {
        const templateDoc = await findAlertsTemplate(data.Email_slug);
        const emailContent: string = replaceVarsInSequence(
            templateDoc.data.Email,
            data.VariablesEmail
        );
        const subject = templateDoc.data.Subject;
        AWS.config.update(SESConfig);
        const params: AWS.SES.SendEmailRequest = {
            Destination: {
                CcAddresses: [],
                ToAddresses: [data.email],
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: emailContent, 
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: "",
                    },
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: subject, 
                },
            },
            Source: "developer@neosprint.in",
            ReplyToAddresses: ["developer@neosprint.in"],
        };
        const sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
            .sendEmail(params)
            .promise();
             const response = await sendPromise;   
    } catch (error) {
        console.error(error, error.stack);
    }
};
export { sendDynamicMail };
