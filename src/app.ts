// Import required dependencies
import express, { Application, Request, Response } from 'express'; // Import the Express framework
import mongoose from 'mongoose'; // Import Mongoose for MongoDB interaction
import bodyParser from 'body-parser'; // Middleware for parsing request bodies
import dotenv from 'dotenv'; // Load environment variables from .env file

dotenv.config(); // Load environment variables from .env file
import AuthRoutes from "./Routes/Auth/AuthRoutes"
import AdminKYCRoutes from "./Routes/Admin/AdminKYCRoutes"
import UserKYCRoutes from "./Routes/User/UserKYCRoutes"
import UploadRoutes from "./Routes/Upload/UploadRoutes"


// Create an instance of the Express application
const app: Application = express();
var cors = require('cors');

// Parse various different custom JSON types as JSON
app.use(cors());
app.use(bodyParser.json()); // Parse incoming JSON payloads
app.use(bodyParser.urlencoded({ extended: false })); // Parse URL-encoded payloads
app.use(express.json()); // Another way to parse JSON payloads in Express

// Set up routes
app.use('/Auth', AuthRoutes);
app.use('/Admin', AdminKYCRoutes);
app.use('/User', UserKYCRoutes);
app.use('/UploadRoutes', UploadRoutes);
// app.use('/user', AuthRoute);
// app.use('/auth', AuthRoute);
// app.use('/admin', AuthRoute);

const port: number = 3000; // Define the port number for the server

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {})
  .then(() => {
    console.log('Connected to MongoDB');  // Successful connection log
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);  // Connection error log
  });

// Start the server
app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`); // Server start log
});
