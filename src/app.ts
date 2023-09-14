//*************** Import required dependencies *******************************************************

import express, { Application, Request, Response } from "express"; // Import the Express framework
import mongoose from "mongoose"; // Import Mongoose for MongoDB interaction
import bodyParser from "body-parser"; // Middleware for parsing request bodies
import dotenv from "dotenv"; // Load environment variables from .env file
//import xlsx from'xlsx';

dotenv.config(); // Load environment variables from .env file
import AuthRoutes from "./Routes/Auth/AuthRoutes";
import AdminRoutes from "./Routes/Admin/AdminRoutes";
import UserKYCRoutes from "./Routes/User/UserKYCRoutes";
import UploadRoutes from "./Routes/Upload/UploadRoutes";



//****************** Create an instance of the Express application ******************************

const app: Application = express();

const cors = require("cors");
app.use(cors({origin: "*",}));

//********************Parse various different custom JSON types as JSON******************************
app.use(bodyParser.json()); // Parse incoming JSON payloads
app.use(bodyParser.urlencoded({ extended: false })); // Parse URL-encoded payloads
app.use(express.json()); // Another way to parse JSON payloads in Express

//********************************Set up routes*****************************************************

app.use("/Auth", AuthRoutes);
app.use("/Admin", AdminRoutes);
app.use("/User", UserKYCRoutes);
app.use("/UploadRoutes", UploadRoutes);

// Define the port number for the server**************************************************

const port: number = 3010; 

//************************* */ Connect to MongoDB****************************************************

mongoose
  .connect(process.env.MONGO_URL, {})
  .then(() => {
    console.log("Connected to MongoDB"); // Successful connection log
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error); // Connection error log
  });

// Start the server
app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`); // Server start log
});
