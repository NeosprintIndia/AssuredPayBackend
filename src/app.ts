import express, { Application } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

// Import your routes
import authRoutes from "./routes/auth/authRoute";
import adminRoutes from "./routes/admin/adminRoute";
import TemplateRoutes from "./routes/admin/templateRoutes";
import userKYCRoutes from "./routes/user/userKYCRoute";
import affiliate from "./routes/affiliate/affiliate";
import uploadRoutes from "./routes/upload/uploadRoute";
import makerRoutes from "./routes/maker/makerRouters";
import checkerRoutes from "./routes/checker/checker";


const app: Application = express();
const cors = require("cors");

app.use(cors({ origin: "*" }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));

// Set up routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/template", TemplateRoutes);
app.use("/userkyc", userKYCRoutes);
app.use("/affiliate", affiliate);
app.use("/uploadRoutes", uploadRoutes);
app.use("/makerRoutes", makerRoutes);
app.use("/checkerRoutes", checkerRoutes);



// Define the port number for the server
const port: number = 3010;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Start the server
app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});
