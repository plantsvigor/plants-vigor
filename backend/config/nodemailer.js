const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
  console.warn(
    "⚠️ WARNING: EMAIL_USER or EMAIL_PASS environment variables are missing! " +
    "OTP emails will not be sent successfully in production."
  );
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Port 465 uses SSL/TLS
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  pool: true,          // Use SMTP pooled connection to optimize performance
  maxConnections: 5,   // Limit concurrent connections
  maxMessages: 100,    // Limit messages per connection
  rateLimit: 10,       // Max messages per second
  timeout: 10000,      // 10 seconds timeout
});

/**
 * Verifies the SMTP transporter connection to smtp.gmail.com.
 * @returns {Promise<boolean>}
 */
const verifyConnection = async () => {
  if (!emailUser || !emailPass) {
    console.error("❌ SMTP Transporter Verification: Missing credentials.");
    return false;
  }
  try {
    console.log("🔄 Verifying SMTP Transporter connection to Gmail...");
    await transporter.verify();
    console.log("✅ SMTP Transporter is ready to send emails!");
    return true;
  } catch (error) {
    console.error("❌ SMTP Transporter connection verification failed:");
    console.error(error);
    return false;
  }
};

module.exports = {
  transporter,
  verifyConnection,
};
