import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { findAlertsTemplate } from "../services/findTemplate";
import {replaceVarsInSequence} from "../services/replaceVariableInTemplate"

export const sendSMS = async (data:any) => {
    try {
    
        const templateDoc = await findAlertsTemplate(data.Message_slug);
        const message: string = replaceVarsInSequence(templateDoc.data.Message, data.VariablesMessage);
        const customParamsSerializer = params => {
            return Object.keys(params)
              .map(key => {
                return `${key}=${encodeURIComponent(params[key])}`;
              })
              .join('&');
          };
        const instance = axios.create({
            baseURL: "https://sms6.rmlconnect.net",
        });

        console.log(process.env.Route_Mobile_SMS_PASSWORD)
        console.log(process.env.Route_Mobile_SMS_USERID)

        const config: AxiosRequestConfig = {
            method: 'GET',
            url: '/bulksms/bulksms',
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                username:process.env.Route_Mobile_SMS_USERID,
                password:process.env.Route_Mobile_SMS_PASSWORD,
                type:"0",
                dlr:"1",
                destination: data.receiverNo,
                source: "ASRDPY",
                message:message,
                entityid:"1401743190000042074",
                tempid:templateDoc.data.Template_ID,   
            },
            paramsSerializer: customParamsSerializer,
        };
        console.log("config",config)
        const response = await instance.request(config);
        console.log("response",response)
        return response.data;
    } catch (error) {
        console.error(error);
        return error;
    }
};
