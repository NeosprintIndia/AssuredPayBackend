const mongoose_refer= require("mongoose")
const Schema_Refer=mongoose_refer.Schema;
const ReferralCodeSchema = new mongoose_refer.Schema({
    user:{
        type: Schema_Refer.Types.ObjectId,
        ref: 'RegisterUser'
    },
    refferal_code:{
        type:"String",
        default:""
    },
    count:{
        type:Number,
        default: 0
    }
})

const User_Referral_Code = mongoose_refer.model('User_Refer_Code', ReferralCodeSchema);
  
  module.exports = User_Referral_Code;