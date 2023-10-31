import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { findAlertsTemplate } from "../services/findTemplate";
import {replaceVarsInSequence} from "../services/replaceVariableInTemplate"

export const sendSMS = async (data:any) => {
    try {
    
        const templateDoc = await findAlertsTemplate(data.Message_slug);

        const message: string = replaceVarsInSequence(templateDoc.data.Message, data.VariablesMessage);
     
        const encodedMessage = encodeURIComponent(message);       
        const encodedUsername = encodeURIComponent(process.env.Route_Mobile_SMS_USERID);
        const encodedPassword = encodeURIComponent(process.env.Route_Mobile_SMS_PASSWORD);
        const encodedReceiverNo = encodeURIComponent(data.receiverNo);
        const encodedTemplateID = encodeURIComponent(templateDoc.data.Template_ID);

        const instance = axios.create({
            baseURL: "http://sms6.rmlconnect.net:8080",
        });

        const config: AxiosRequestConfig = {
            method: 'GET',
            url: '/bulksms/bulksms',
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                username: encodedUsername,
                password: encodedPassword,
                type: "0",
                dlr: "1",
                destination: encodedReceiverNo,
                source: "ASRDPY",
                message:encodedMessage,
                entityid:"1401743190000042074",
                tempid: encodedTemplateID,   
            },
        };
        console.log("config",config)
        const response = await instance.request(config);
        console.log("response",response.data)
        return response.data;
    } catch (error) {
        console.error(error);
        return error;
    }
};
