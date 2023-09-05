const nodemailer = require('nodemailer');  // Import the nodemailer library
const { MAIL_SETTINGS } = require('../Constants/constants');  // Import mail settings from constants
const transporter = nodemailer.createTransport(MAIL_SETTINGS);  // Create a transporter using mail settings

// Export a function for sending emails
module.exports.sendMail = async (params) => {
  try {
    // Use the transporter to send an email
    let info = await transporter.sendMail({
      from: MAIL_SETTINGS.auth.user,  // Sender's email address
      to: params.to,  // Receiver's email address
      subject: 'Hello ✔',  // Email subject
      html: `
        <!-- HTML content of the email -->
        <div
          class="container"
          style="max-width: 90%; margin: auto; padding-top: 20px"
        >
          <h2>Welcome to the club.</h2>
          <h4>You are officially In ✔</h4>
          <p style="margin-bottom: 30px;">Please enter the sign up OTP to get started</p>
          <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${params.OTP}</h1>
          <p style="margin-top:50px;">If you did not request for verification, please do not respond to the mail. You can unsubscribe from the mailing list, and we will never bother you again.</p>
        </div>
      `,
    });
    return info;  // Return the information about the sent email
  } catch (error) {
    console.log(error);  // Log any error that occurs during sending
    return false;  // Return false if there's an error
  }
};
