import product from '../../models/productModel';
import mongoose, { isValidObjectId } from "mongoose"; 
 
export const findAndInsert = async (productDetails): Promise<any> => {
  try {
    const doucment = await product.find({productName: productDetails.productName},"_id");
    if(!doucment.length) {
      if(!productDetails.categoryId) throw({message:"Please pass category id to add product."});
      let query = {
        productName: productDetails.productName,
        categoryIds: [productDetails.categoryId]
      }
      const result = await product.create(query);
      console.log("Product inserted successfully");
      return [true, result];
    } else throw({message: "Product can not be inserted as product with this name already exists."});
  } catch (error) {
    console.log("Error occured while inserting the product.", error);
    return  [false, error.message];
  }
};
export const find = async (searchBy: any, categoryId: any, page, rowsLimitInPage): Promise<[boolean, any]> => {
  try {
    let query;
    if(searchBy && categoryId) {
      query = {
        $and: [
          {productName: {$regex: searchBy, $options: "i"}},
          {categoryIds: categoryId}] 
      }
    } else if(searchBy) query = {productName: {$regex: searchBy, $options: "i"}}
    else if (categoryId)  query = {categoryIds: categoryId}
    else query = {}
    
    if(!Number(page)) page = 1;
    const rowsLimitPerPage = rowsLimitInPage || 10;
    const skipLimit  = page*rowsLimitPerPage - rowsLimitPerPage;

    const categories = await product.find(query).limit(rowsLimitPerPage).skip(skipLimit)
    console.log("Categories fetched successfully.")
    return [true, categories];
  } catch (error) {
    console.error("Error in fetching products names by the string provided.", error);
    return [false, error.message];
  }
};
export const findAndUpdate = async (productId, productDetails): Promise<any> => {
  try {
    if(!productId) throw({message: "Cannot update product as product id is not valid."})
    if(!Object.keys(productDetails).length) throw({message: "Please provide the details to udpate."})
    let query;
    if(productDetails.categoryId){
      if(!isValidObjectId(productDetails.categoryId)) throw({message: "Provided category id is not valid."})
      query = {$push:{categoryIds: productDetails.categoryId}}
    } else  query = productDetails
    const result = await product.findOneAndUpdate({_id: new mongoose.Types.ObjectId(productId)}, query, {new:true});
    console.log("product updated successfully");
    if(!result) throw ({message: "Product does not exists with this id."})
    return [true, result];
  } catch (error) {
    console.log("Error occured while updating the product", error);
    return  [false, error.message];
  }
};