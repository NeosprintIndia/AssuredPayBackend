//******************** Import required dependencies *******************************************************
import express, { Application, Request, Response } from "express"; 
import mongoose from "mongoose"; 
import bodyParser from "body-parser"; 
import dotenv from "dotenv"; 

dotenv.config(); 
import authRoutes from "./Routes/Auth/authRoutes";
import adminRoutes from "./Routes/Admin/adminRoutes";
import userKYCRoutes from "./Routes/User/userKYCRoutes";
import uploadRoutes from "./Routes/Upload/uploadRoutes";



//****************** Create an instance of the Express application ******************************

const app: Application = express();
const cors = require("cors");
app.use(cors({origin: "*",}));

//********************Parse various different custom JSON types as JSON******************************

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(express.json()); 

//********************************Set up routes*****************************************************

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
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
