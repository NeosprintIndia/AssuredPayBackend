import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import http from 'http'; // Import http module
import { Server, Socket } from 'socket.io'; // Import Server and Socket from socket.io

dotenv.config();

const app: Application = express();
const server: http.Server = http.createServer(app); // Create http server
const io: Server = new Server(server); // Create Socket.io instance

// Import Model

// Import your routes
import authRoutes from './routes/auth/authRoute';
import adminRoutes from './routes/admin/adminRoute';
import TemplateRoutes from './routes/admin/templateRoutes';
import userKYCRoutes from './routes/user/userKYCRoute';
import affiliate from './routes/affiliate/affiliate';
import uploadRoutes from './routes/upload/uploadRoute';
import makerRoutes from './routes/maker/makerRouters';
import checkerRoutes from './routes/checker/checker';

// Import Cron Jobs
import UpdateProposalStatus from './scripts/cronjobs';

const cors = require('cors');

app.use(cors({ origin: '*' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware to attach io to the request object
app.use((req: Request & { io: Server }, res: Response, next) => {
  req.io = io;
  next();
});

// Set up routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/template', TemplateRoutes);
app.use('/userkyc', userKYCRoutes);
app.use('/affiliate', affiliate);
app.use('/uploadRoutes', uploadRoutes);
app.use('/makerRoutes', makerRoutes);
app.use('/checkerRoutes', checkerRoutes);

// Define the port number for the server
const port: number = 3010;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL, {})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Socket.io connection handling
io.on('connection', (socket: Socket) => {
  console.log('Client connected');

  // // Handle socket events if needed
  // socket.on('disconnect', () => {
  //   console.log('Client disconnected');
  // });
});

// Run cron Jobs
UpdateProposalStatus();

// Start the server
server.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});
