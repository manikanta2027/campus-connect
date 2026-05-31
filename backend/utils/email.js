// Import nodemailer to send emails
const nodemailer = require('nodemailer');

// Create email sender - using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASSWORD, // Your Gmail app password
  },
});

// Function to send OTP email to user
const sendOTPEmail = async (userEmail, otp) => {
  try {
    // Create email with OTP
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Campus Connect - Your OTP Code',
      text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent to ' + userEmail);
  } catch (error) {
    console.log('❌ Error sending email: ' + error.message);
    throw error;
  }
};

// Function to send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Welcome to Campus Connect!',
      text: `Hi ${userName},\n\nWelcome to Campus Connect! Your account has been verified. You can now log in and start connecting with other students.`,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to ' + userEmail);
  } catch (error) {
    console.log('❌ Error sending email: ' + error.message);
    throw error;
  }
};

// Function to send password reset email
const sendResetEmail = async (userEmail, resetLink, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Campus Connect - Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 10px;">Hi ${userName},</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              You requested a password reset for your Campus Connect account. Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px;">
              Or copy this link: <br/>
              <code style="background-color: #f0f0f0; padding: 8px; border-radius: 4px; word-break: break-all;">${resetLink}</code>
            </p>
            
            <p style="color: #d32f2f; font-weight: bold; margin-top: 20px;">
              ⏰ This link will expire in 1 hour.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px;">
              If you didn't request this password reset, please ignore this email. Your password will not be changed unless you click the link above.
            </p>
            
            <p style="color: #999; font-size: 12px;">
              Questions? Contact our support team.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to ' + userEmail);
  } catch (error) {
    console.log('❌ Error sending reset email: ' + error.message);
    throw error;
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendResetEmail,
};
