const { sendEmail } = require("../utils/emailService");

/**
 * Sends a 6-digit OTP verification email for account signup.
 * @param {string} email - Recipient email address
 * @param {string} otpCode - Generated OTP code
 */
const sendSignupOTP = async (email, otpCode) => {
  const subject = "Verify your email";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #008744; text-align: center;">Welcome to Greenbloom!</h2>
      <p>Thank you for signing up. Please verify your email address by entering the following One-Time Password (OTP):</p>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0; border-radius: 5px;">
        ${otpCode}
      </div>
      <p style="font-size: 13px; color: #666;">This OTP is valid for <strong>5 minutes</strong>. If you did not request this code, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 11px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Plants Vigor / Greenbloom. All rights reserved.</p>
    </div>
  `;
  
  await sendEmail({ to: email, subject, html });
};

/**
 * Sends a 6-digit OTP verification email for password recovery.
 * @param {string} email - Recipient email address
 * @param {string} otpCode - Generated OTP code
 */
const sendRecoveryOTP = async (email, otpCode) => {
  const subject = "Password Reset Verification OTP";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #008744; text-align: center;">Reset Your Password</h2>
      <p>We received a request to reset the password for your account. Please use the following One-Time Password (OTP) to complete the reset process:</p>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0; border-radius: 5px;">
        ${otpCode}
      </div>
      <p style="font-size: 13px; color: #666;">This OTP is valid for <strong>5 minutes</strong>. If you did not request a password reset, please secure your account immediately.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 11px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Plants Vigor. All rights reserved.</p>
    </div>
  `;
  
  await sendEmail({ to: email, subject, html });
};

module.exports = {
  sendSignupOTP,
  sendRecoveryOTP,
};
