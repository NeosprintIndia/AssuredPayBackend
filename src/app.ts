// Import required dependencies

const express =require('express');   // Import the Express framework
const app = express();  // Create an instance of the Express application
const mongooose = require("mongoose");   // Import Mongoose for MongoDB interaction
const bodyParser = require('body-parser');  // Middleware for parsing request bodies
const AuthRoute = require('./Routes/Auth_Routes');  // Import authentication route module
const KycRoute = require('./Routes/KYC_Routes');  // Import KYC route module
require('dotenv').config();  // Load environment variables from .env file

// Parse various different custom JSON types as JSON
app.use(bodyParser.json());  // Parse incoming JSON payloads
app.use(bodyParser.urlencoded({ extended: false }));  // Parse URL-encoded payloads
app.use(express.json());  // Another way to parse JSON payloads in Express

// Set up routes
app.use('/user', AuthRoute);  // Mount authentication routes under /user path
app.use('/kyc', KycRoute);  // Mount KYC routes under /kyc path

const port = 3000;  // Define the port number for the server

// Connect to MongoDB
mongooose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,  // Use new URL parser
    useUnifiedTopology: true,  // Use new server discovery and monitoring engine
  })
  .then(() => {
    console.log('Connected to MongoDB');  // Successful connection log
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);  // Connection error log
  });

// Start the server
app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);  // Server start log
});