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

export const find = async (searchBy: any, page, rowsLimitInPage): Promise<[boolean, any]> => {
  try {
    let query;
    if(searchBy) query = {industryName: {$regex: searchBy, $options: "i"}}
    else query = {};
    if(!Number(page)) page = 1;
    const rowsLimitPerPage = rowsLimitInPage || 10;
    const skipLimit  = page*rowsLimitPerPage - rowsLimitPerPage;
    const industries = await industry.find(query).limit(rowsLimitPerPage).skip(skipLimit)
    console.log("Industries fetched successfully")
    return [true, industries];
  } catch (error) {
    console.error("Error in fetching industries names.", error);
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
