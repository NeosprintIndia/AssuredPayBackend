const express=require("express");
const app= express();

app.get("/",(req,res)=>{
  console.log("test api")
    res.send(200).json("Exciting News: AssuredPay Project is Set to Transform the Future of Business Finance!");

})

app.listen(3000);
