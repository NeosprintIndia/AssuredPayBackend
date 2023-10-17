import businessNetwork  from "../../models/businessNetwork";
import userKyc from "../../models/userKYCs"; 
import registration from "../../models/userRegisterations";
import mongoose, {isValidObjectId} from "mongoose";


const  businessProjectionFields = {
    "Legal_Name_of_Business": 1,
    "GSTIN_of_the_entity": 1, 
    "Place_of_Business": 1,
    "aadharPhotoLink": 1,
    "nameInAadhaar" : 1,
    "createdAt": 1,
    "Ratings" : 1, 
    "_id": 1
}

const businessNetworkProjectFields = {
  "status": 1,
  "industryId": 1,
  "categoryId": 1,
  "productIds": 1,
  "favourite": 1, 
  "_id": 1
}

const getUserId = async (email, mobileNumber = "") => {
  try{
      let query;
      if(email) query = {"business_email": email}
      else query = {"business_mobile": mobileNumber}
      let userProjectionFields = {"_id" : 1}
      const userId = await registration.find(query, userProjectionFields);
      if(!userId.length) throw({message: "Business owner does not exists with the provided owner details"});
      else return userId[0]["_id"];
  } catch (error){
    console.error("Error in fetching business details by business email or mobile.", error);
    throw (error);
  }
}

export const getBusinessByBusinessDetails = async ( gst: any, businessName: any): Promise<[boolean, any]> => {
    try {
      let query;
      if(gst) query = {"GSTIN_of_the_entity": gst}
      else query = {Legal_Name_of_Business: {$regex: businessName, $options: "i"}}
      const businessDetails = await userKyc.find(query, businessProjectionFields)
      if(!businessDetails.length) throw ({message: "Buiness does not exists with the passed business details."})
      else {
        console.log("Business details fetched successfully")
        return [true, businessDetails];
      }
    } catch (error) {
      console.error("Error in fetching business details by gst or business name.", error);
      return [false, error.message];
    }
  };
  
export const getBusinessByOwnerDetails = async ( email: any, number: any): Promise<[boolean, any]> => {
try {
      const userId = await getUserId(email, number);
      const businessDetails = await userKyc.find({user: userId},businessProjectionFields);
      if(!businessDetails.length) throw({message: "Business does not exists with the provided owner details"});
      else {
          console.log("Business details fetched successfully")
          return [true, businessDetails];
      }
    } catch (error) {
        console.error("Error in fetching business details by business email or mobile.", error);
        return [false, error.message];
    }
};

export const findAndInsertBusinessInBusinessNetwork = async (userId, businessDetails): Promise<any> => {
    try {
      if(!Object.keys(businessDetails).length) throw({message : "Please pass business details to add in business n/w."})
      if(!isValidObjectId(businessDetails.businessId)) throw({message : "Passed business id is not valid."})
      
      const query = {
        userId : new mongoose.Types.ObjectId(userId),
        businessId: new mongoose.Types.ObjectId(businessDetails.businessId)
      }
      const doucment = await businessNetwork.find({$and :[query]},"_id");
      if(doucment.length) throw ({message: "Can not add business to business n/w as this business already added to business n/w."});
      if(!businessDetails.industryId || !businessDetails.categoryId || !businessDetails.productIds)
      throw ({message: "Please give industry, category and product id in order to add business in business n/w."});
      query["industryId"] = new mongoose.Types.ObjectId(businessDetails.industryId)
      query["categoryId"] = new mongoose.Types.ObjectId(businessDetails.categoryId)
      query["productIds"] = [];
      businessDetails.productIds.map((id)=>{
        query["productIds"].push(new mongoose.Types.ObjectId(id))
      })
      const result = await businessNetwork.create(query);
      console.log("Business inserted successfully in business network.");
      return [true, result];
    } catch (error) {
      console.log("Error occured while inserting business in  business n/w.", error);
      return  [false, error.message];
    }
};

export const sendResponse = (success,response) => {
  if(success) return [true, response];
  else return [false, response]
}

export const getBusinessNetworkDetails = async (userId, gst, businessName)=> { 
  try {
  let matchQuery;
  if(gst) matchQuery = {$match:  {"GSTIN_of_the_entity": gst}}
  else matchQuery = {$match: {"Legal_Name_of_Business": businessName}}
  const result = await userKyc.aggregate([ 
    matchQuery,
    {
      $lookup:{
        from: "business_networks",      
        localField: "_id",   
        foreignField: "businessId", 
        as: "businessNetworkDetails"        
      }
    },
    { $unwind:"$businessNetworkDetails" },
    {$match: {"businessNetworkDetails.userId" : userId}}, 
    { $project: {
      "Legal_Name_of_Business": 1,
      "GSTIN_of_the_entity": 1, 
      "Place_of_Business": 1,
      "aadharPhotoLink": 1,
      "nameInAadhaar" : 1,
      "createdAt": 1,
      "Ratings" : 1, 
      "_id": 1,
      businessNetworkDetails :businessNetworkProjectFields}},
      {
        $lookup:{
          from: "industries",
          localField: "businessNetworkDetails.industryId",
          foreignField: "_id",
          as: "industryDetails",
        }
      }, 
      { $unwind:"$industryDetails" },
      {
        $lookup:{
          from: "categories",
          localField: "businessNetworkDetails.categoryId",
          foreignField: "_id",
          as: "categoryDetails",
        }
      }, 
      { $unwind:"$categoryDetails" },
      {
        $lookup:{
          from: "products",
          localField: "businessNetworkDetails.productIds",
          foreignField: "_id",
          as: "productDetails",
        }
      }
  ])
  if(!result.length) throw({message: "No business exists in business n/w."});
  else {
    console.log("Businesses n/w details fetched successfully.");
    return [true, result];
  }
  } catch(error){
    console.log("Error Occured while fetching the business n/w details.", error)
    return [false, error.message]
  }
  
}
export const  getBusinessFromBusinessNetwork = async (id, businessQuery): Promise<any> => {
    try {
      let userId = new mongoose.Types.ObjectId(id);
      if(!Object.keys(businessQuery).length) throw({message: ""});
      if(businessQuery.gst ||  businessQuery.businessName){
        const [isSuccess, res] = await getBusinessNetworkDetails(userId, businessQuery.gst, businessQuery.businessName)
        return sendResponse(isSuccess,res);
      } else {
        const page = businessQuery.page || 1;
        const rowsLimitPerPage =  businessQuery.rowsLimitInPage || 10;
        const skipLimit  = page*rowsLimitPerPage - rowsLimitPerPage;
        let matchQuery;
        if(businessQuery.status) matchQuery = {$match: {$and:[{userId: userId}, {status: businessQuery.status}]}}
        else matchQuery = {$match: {userId: userId}}
        const result = await businessNetwork.aggregate([ 
          matchQuery,
          {$skip: Number(skipLimit)}, 
          {$limit: Number(rowsLimitPerPage)},
          {
            $lookup:{
              from: "userkycs",      
              localField: "businessId",   
              foreignField: "_id", 
              as: "businessDetails"        
            }
          }, 
          { $unwind:"$businessDetails" },
          { $project: {
            "status": 1,
            "industryId": 1,
            "categoryId": 1,
            "productIds": 1,
            "favourite": 1, 
            "_id": 1,
            businessDetails :businessProjectionFields}},
          {
            $lookup:{
              from: "industries",
              localField: "industryId",
              foreignField: "_id",
              as: "industryDetails",
            }
          }, 
          { $unwind:"$industryDetails" },
          {
            $lookup:{
              from: "categories",
              localField: "categoryId",
              foreignField: "_id",
              as: "categoryDetails",
            }
          }, 
          { $unwind:"$categoryDetails" },
          {
            $lookup:{
              from: "products",
              localField: "productIds",
              foreignField: "_id",
              as: "productDetails",
            }
          }
        ])
        if(!result.length) throw({message: "No business exists in business n/w."});
        else {
          console.log("Businesses fetched successfully.");
          return [true, result];
        }
      }
    } catch (error) {
      console.log("Error occured while finding the business from business n/w.", error);
      return  [false, error.message];
    }
};
  
export const findAndUpdate = async (userId, businessId, businessDetails): Promise<any> => {
    try {
      console.log(userId, businessId);
      const result = await businessNetwork.findOneAndUpdate(
      { 
        $and :
        [
          {userId: new mongoose.Types.ObjectId(userId)},
          {businessId: new mongoose.Types.ObjectId(businessId)}
        ]
      }, 
      businessDetails, 
      {new: true}
      )
      if(!result) throw({message : "No business found in business n/w to update."})
      console.log("Business updated successfully in business network.");
      return [true, result];
    } catch (error) {
      console.log("Error occured while updating the business in business n/w.", error);
      return  [false, error.message];
    }
};

export const getAllBusinessNames = async ( searchBy: any): Promise<[boolean, any]> => {
  try {
    let query = {Legal_Name_of_Business: {$regex: searchBy, $options: "i"}}
    const businessNames = await userKyc.find(query, {"Legal_Name_of_Business" : 1, _id: 0})
    if(!businessNames.length) throw ({message: "No business exist matching this string"})
    else {
      console.log("Business names fetched successfully")
      return [true, businessNames];
    }
  } catch (error) {
    console.error("Error in fetching business names by the string provided.", error);
    return [false, error.message];
  }
};