import { Request, Response } from "express";
import {
    findAndInsertBusinessInBusinessNetwork,
    getBusinessFromBusinessNetwork,
    findAndUpdate,
    getBusinessByBusinessDetails,
    getBusinessByOwnerDetails, 
    getAllBusinessNames
} from "./businessNetworkHandler";

function sendResponse(res, success, result){
    if (success) {
        res.send({result, Active:true});
    } else {
        res.status(500).send({
        message: result, Active:false
        });
    }
}

export const getBusinessDetails = async (req: Request, res: Response): Promise<void> => {
    const {gst, businessName, email, mobile} = req.query;
    if(gst ||  businessName) {
        const [success,result] = await getBusinessByBusinessDetails(gst, businessName);
        sendResponse(res,success,result);
    } else if(email || mobile) {
        const [success,result] = await getBusinessByOwnerDetails(email, mobile);
        sendResponse(res,success,result);
    } else {
        sendResponse(res, false, "Please pass proper query parameters");
    }
};

export const addBusinessInBusinessNetwork = async (req: Request, res: Response): Promise<void> => {
    const {userEmail, businessGstNumberToAdd} = req.query;
    if(!userEmail || !businessGstNumberToAdd){
        console.log("Please pass valid user email and gst number in query parameters.");
        sendResponse(res, false, "Please pass valid user email and gst number in query parameters.");
    } else {
        const [success,result] = await findAndInsertBusinessInBusinessNetwork(userEmail, businessGstNumberToAdd);
        sendResponse(res,success,result);
    }
};

export const getBusinessesFromBusinessNetwork = async (req: Request, res: Response): Promise<void> => {
    const email = req.query.email;
    const {page, rowsLimitInPage} = req.query;
    const [success,result] = await getBusinessFromBusinessNetwork(email, page, rowsLimitInPage);
    sendResponse(res,success,result);
};
  
export const updateBusinessInBusinessNetwork = async (req: Request, res: Response): Promise<void> => {
    const {userEmail, gst} = req.query;
    const businessDetails = req.body;
    if(!userEmail || !gst) {
        console.log("Please pass valid user email and gst number in query parameters.");
        sendResponse(res, false, "Please pass valid user email and gst number in query parameters.");
    } else {
        const [success,result] = await findAndUpdate(userEmail, gst, businessDetails);
        sendResponse(res,success,result);
    }
};

export const getAllBusinessNamesByString = async (req: Request, res: Response): Promise<void> => {
    const {searchBy} = req.query;
    if(!searchBy) {
        console.log("Please pass valid searchBy query parameter.");
        sendResponse(res, false, "Please pass valid searchBy in query parameters.");
    } else {
        const [success,result] = await getAllBusinessNames(searchBy);
        sendResponse(res,success,result);
    }
};
  