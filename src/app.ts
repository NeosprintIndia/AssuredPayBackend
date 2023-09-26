//******************** Import required dependencies *******************************************************
import express, { Application } from "express"; 
import mongoose from "mongoose"; 
import bodyParser from "body-parser"; 
import dotenv from "dotenv"; 
// ***************Load environment variables from a .env file if available*******************

dotenv.config(); 

//******************* Import your routes*******************

import authRoutes from "./routes/auth/authRoute";
import adminRoutes from "./routes/admin/adminRoute";
import TemplateRoutes from "./routes/admin/templateRoutes";
import userKYCRoutes from "./routes/user/userKYCRoute";
import uploadRoutes from "./routes/upload/uploadRoute";

//****************** Create an instance of the Express application ******************************
const app: Application = express();
const cors = require("cors");

// *******************Enable CORS for all origins, you might want to restrict this to specific origins in production
app.use(cors({origin: "*",}));

//********************Parse various different custom JSON types as JSON******************************

app.use(bodyParser.json({limit: '50mb'})); 
app.use(bodyParser.urlencoded({ extended: false })); 


//********************************Set up routes*****************************************************

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/template", TemplateRoutes);
app.use("/userkyc", userKYCRoutes);
app.use("/uploadRoutes", uploadRoutes); 

// Define the port number for the server**************************************************

const port: number = 3010; 

//************************* */ Connect to MongoDB****************************************************

mongoose
  .connect(process.env.MONGO_URL, {})
  .then(() => {
    console.log("Connected to MongoDB"); 
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error); 
  });

// Start the server
app.listen(port, () => {console.log(`Express is listening at http://localhost:${port}`);
});
