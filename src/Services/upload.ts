const multer = require('multer'); // Import the multer library
exports.upload = multer({ // Exported middleware for file upload
    storage: multer.memoryStorage(), // Use in-memory storage for uploaded files
    limits: {
      fileSize: 5 * 1024 * 1024,  // Limit file size to 5MB
    },
  });