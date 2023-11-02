import category from '../../models/categoryModel';
import mongoose, { isValidObjectId } from "mongoose"; 
 
export const findAndInsert = async (categoryDetails): Promise<any> => {
  try {
    const doucment = await category.find({categoryName: categoryDetails.categoryName},"_id");
    if(!doucment.length) {
      if(!categoryDetails.industryId) throw({message:"Please pass industry id to add category."});
      let query = {
        categoryName: categoryDetails.categoryName,
        industryIds: [categoryDetails.industryId]
      }
      const result = await category.create(query);
      console.log("Category inserted successfully");
      return [true, result];
    } else throw({message: "Category can not be inserted as category with this name already exists."});
  } catch (error) {
    console.log("Error occured while inserting the Category.", error);
    return  [false, error.message];
  }
};

export const find = async (searchBy: any, industryId: any, page, rowsLimitInPage): Promise<[boolean, any]> => {
  try {
    let query;
    if(searchBy && industryId) {
      query = {
        $and: [
          {categoryName: {$regex: searchBy, $options: "i"}},
          {industryIds: industryId}] 
      }
    } else if(searchBy) query = {categoryName: {$regex: searchBy, $options: "i"}}
    else if (industryId)  query = {industryIds: industryId}
    else query = {}
    
    if(!Number(page)) page = 1;
    const rowsLimitPerPage = rowsLimitInPage || 10;
    const skipLimit  = page*rowsLimitPerPage - rowsLimitPerPage;
   
    const categories = await category.find(query).limit(rowsLimitPerPage).skip(skipLimit);
    console.log("Categories fetched successfully.")
    return [true, categories];
  } catch (error) {
    console.error("Error in fetching categories names by the string provided.", error);
    return [false, error.message];
  }
};

export const findAndUpdate = async (categoryId, categoryDetails): Promise<any> => {
  try {
    if(!categoryId) throw({message: "Cannot update category as category id is not valid."})
    if(!Object.keys(categoryDetails).length) throw({message: "Please provide the details to udpate."})
    let query;
    if(categoryDetails.industryId){
      if(!isValidObjectId(categoryDetails.industryId)) throw({message: "Provided industry id is not valid."})
      query = {$push:{industryIds: categoryDetails.industryId}}
    } else  query = categoryDetails
    const result = await category.findOneAndUpdate({_id: new mongoose.Types.ObjectId(categoryId)}, query, {new:true});
    console.log("Category updated successfully");
    if(!result) throw ({message: "Category does not exists with this id."})
    return [true, result];
  } catch (error) {
    console.log("Error occured while updating the category", error);
    return  [false, error.message];
  }
};