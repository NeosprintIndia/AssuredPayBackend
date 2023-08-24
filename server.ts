const express = require("express");
const app = express();

app.get("/", (req, res) => {
  console.log("test api");
  res.status(200).json("Exciting News: AssuredPay Project is Set to Transform the Future of Business Finance!");
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
