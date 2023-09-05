const otpGenerator = require('otp-generator');  // Import the otp-generator library
const { OTP_LENGTH, OTP_CONFIG } = require('../constants/constants');  // Import OTP-related constants

// Export a function for generating OTP
module.exports.generateOTP = () => {
  // Generate an OTP using the otp-generator library with provided length and configuration
  const OTP = otpGenerator.generate(OTP_LENGTH, OTP_CONFIG);
  return OTP;  // Return the generated OTP
};
