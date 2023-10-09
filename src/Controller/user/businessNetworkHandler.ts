import businessNetwork  from "../../models/businessNetwork";
import userKyc from "../../models/userKYCs"; 
import registration from "../../models/userRegisterations";

const  businessProjectionFields = {
    "Legal_Name_of_Business": 1,
    "GSTIN_of_the_entity": 1, 
    "Place_of_Business": 1,
    "aadharPhotoLink": 1,
    "nameInAadhaar" : 1,
    "createdAt": 1,
    "Ratings" : 1
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
      else query = {"Legal_Name_of_Business": businessName}
      const businessDetails = await userKyc.find(query,businessProjectionFields)
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

export const findAndInsertBusinessInBusinessNetwork = async (userEmail, businessGstNumberToAdd): Promise<any> => {
    try {
      const userId = await getUserId(userEmail);
      const businessId = await userKyc.find({"GSTIN_of_the_entity": businessGstNumberToAdd}, "_id");
      if(!businessId) throw({message : "No business exist with this gst number."})
      const query = {
        userId : userId,
        businessId: businessId[0]["_id"], 
        gst: businessGstNumberToAdd
      }
      const doucment = await businessNetwork.find({
        $and :[
          {userId: userId},
          {businessId: businessId[0]["_id"]}
        ]
      },"_id");
      if(!doucment.length) {
      const result = await businessNetwork.create(query);
      console.log("Business inserted successfully in business network.");
      return [true, result];
      } else throw ({message: "Can not add business to business n/w as this business already added to business n/w."});
    } catch (error) {
      console.log("Error occured while inserting business in  business n/w.", error);
      return  [false, error.message];
    }
};
 
export const  getBusinessFromBusinessNetwork = async (email, page, rowsLimitInPage): Promise<any> => {
    try {
      if(!Number(page)) page = 1;
      const rowsLimitPerPage = rowsLimitInPage || 10;
      const skipLimit  = page*rowsLimitPerPage - rowsLimitPerPage;
      const userId = await getUserId(email);
      const result = await businessNetwork.aggregate([
        {
          $match : {
            userId: userId
          }
        },
        {$skip: Number(skipLimit)}, 
        {$limit: Number(rowsLimitPerPage)},
        {
          $lookup:{
            from: "userkycs",      
            localField: "gst",   
            foreignField: "GSTIN_of_the_entity", 
            as: "businessDetails"        
          }
        }, 
        { $unwind:"$businessDetails" },
        { $project: {businessDetails :businessProjectionFields, _id : 0}}
      ])
      if(!result.length) throw({message: "No business exists in business n/w."});
      else {
        console.log("Businesses fetched successfully.");
        return [true, result];
      }
    } catch (error) {
      console.log("Error occured while finding the business from business n/w.", error);
      return  [false, error.message];
    }
};
  
export const findAndUpdate = async (userEmail, gst, businessDetails): Promise<any> => {
    try {
      const userId = await getUserId(userEmail);
      const result = await businessNetwork.findOneAndUpdate(
        {
        $and :[
          {userId: userId},
          {gst: gst}
        ]}, 
        businessDetails, 
        {new: true}
      )
      if(!result) throw({message : "Error occured while updating the business in business n/w."})
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