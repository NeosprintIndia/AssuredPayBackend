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
    const userId = (req as any).userId as string;
    const businessDetails = req.body;
    const [success,result] = await findAndInsertBusinessInBusinessNetwork(userId, businessDetails);
    sendResponse(res,success,result);
    
};

export const getBusinessesFromBusinessNetwork = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).userId as string;
    const businessQuery = req.body;
    const [success,result] = await getBusinessFromBusinessNetwork(userId, businessQuery);
    sendResponse(res,success,result);
};
  
export const updateBusinessInBusinessNetwork = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).userId as string;
    const {businessId} = req.query;
    const businessDetails = req.body;
    const [success,result] = await findAndUpdate(userId, businessId, businessDetails);
    sendResponse(res,success,result);
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
  