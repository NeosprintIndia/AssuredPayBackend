import industry from '../../models/industryModel';
import mongoose from "mongoose"; 

export const findAndInsert = async (industryDetails): Promise<any> => {
  try {
    const doucment = await industry.find({industryName: industryDetails.industryName},"_id");
    if(!doucment.length) {
      const result = await industry.create(industryDetails);
      console.log("Industry inserted successfully");
      return [true, result];
    } else throw({message: "Industry can not be inserted as industry with this name already exists."});
  } catch (error) {
    console.log("Error occured while inserting the industry.", error);
    return  [false, error.message];
  }
};

export const find = async (page, rowsLimitInPage): Promise<any> => {
  try {
    if(!Number(page)) page = 1;
    const rowsLimitPerPage = rowsLimitInPage || 10;
    const skipLimit  = page*rowsLimitPerPage - rowsLimitPerPage;
    const result = await industry.find().limit(rowsLimitPerPage).skip(skipLimit);
    console.log("Industrys fetched successfully");
    return [true, result];
  } catch (error) {
    console.log("Error occured while fetching the industry", error);
    return  [false, error.message];
  }
};

export const findBySearchKey = async (searchBy: any): Promise<[boolean, any]> => {
  try {
    let query = {industryName: {$regex: searchBy, $options: "i"}}
    const industries = await industry.find(query)
    if(!industries.length) throw ({message: "No industry exist matching this string"})
    else {
      console.log("Industries names fetched successfully")
      return [true, industries];
    }
  } catch (error) {
    console.error("Error in fetching industries names by the string provided.", error);
    return [false, error.message];
  }
};

export const findAndUpdate = async (industryId, industryDetails): Promise<any> => {
  try {
    if(!industryId) throw ({message: "Cannot update industry as industry id is not valid."})
    const result = await industry.findOneAndUpdate({_id: new mongoose.Types.ObjectId(industryId)}, industryDetails, {new:true});
    console.log("Industry updated successfully");
    if(!result) throw ({message: "Industry does not exists with this id."})
    return [true, result];
  } catch (error) {
    console.log("Error occured while updating the industry", error);
    return  [false, error.message];
  }
};
