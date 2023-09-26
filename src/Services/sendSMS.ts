import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { findAlertsTemplate } from "./findTemplates";
import {replaceVarsInSequence} from "./replaceVariableInTemplate"

export const sendSMS = async (
    data:any
) => {
    try {
        // Fetch the SMS template using the provided slug
        const templateDoc = await findAlertsTemplate(data.Message_slug);

        // Replace placeholders in the message with the provided OTP
        const message: string = replaceVarsInSequence(templateDoc.data.Message, data.VariablesMessage);
        // const message = templateDoc.data.Message.replace('{#var#}', replace);

        const instance = axios.create({
            baseURL: 'http://103.16.101.52:8080',
        });

        const config: AxiosRequestConfig = {
            method: 'GET',
            url: '/bulksms/bulksms',
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                username: process.env.Route_Mobile_SMS_USERID,
                password: process.env.Route_Mobile_SMS_PASSWORD,
                entityid: "1601100000000000368",
                tempid: templateDoc.data.Template_ID,
                type: "0",
                destination: data.receiverNo,
                dlr: "1",
                source: "TRAMOP",
                message:message,
            },
        };

        console.log(config);

        const response = await instance.request(config);
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error(error);
        return error;
    }
};
