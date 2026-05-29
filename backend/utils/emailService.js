const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
  console.warn(
    "⚠️ WARNING: EMAIL_USER or EMAIL_PASS environment variable is missing! " +
    "Nodemailer Gmail SMTP routing will fail."
  );
}

// Initialize Nodemailer SMTP Transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

/**
 * Diagnostic method to verify the SMTP connection health.
 * Prints detailed error diagnostics for auth failures or network timeouts.
 */
const verifyConnection = async () => {
  console.log("🔄 Verifying Gmail SMTP Transporter connection pool...");
  try {
    await transporter.verify();
    console.log("✅ Gmail SMTP Service: Initialized, authenticated, and ready to send emails!");
    return true;
  } catch (error) {
    console.error("❌ Gmail SMTP Service Connection Failure:");
    if (error.code === "EAUTH") {
      console.error(
        "   👉 Authentication Error! Please verify that process.env.EMAIL_USER is correct " +
        "and process.env.EMAIL_PASS is a valid 16-character Google App Password (not your primary password)."
      );
    } else {
      console.error(`   👉 Details: ${error.message || error}`);
    }
    return false;
  }
};

/**
 * Base helper function to send an email using Nodemailer SMTP.
 * @param {Object} options
 * @param {string} [options.from] - Sender address
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} [options.html] - HTML content
 * @param {string} [options.text] - Plain text content
 * @returns {Promise<Object>}
 */
const sendEmail = async ({ from, to, subject, html, text }) => {
  // Standard requested sender address
  const sender = from || process.env.EMAIL_FROM || `"Plants Vigroe" <plantsvigroe@gmail.com>`;

  try {
    console.log(`[SMTP] Dispatching email from: ${sender} | to: ${to} | Subject: "${subject}"...`);
    
    const info = await transporter.sendMail({
      from: sender,
      to,
      subject,
      html: html || text,
      text: text || "",
    });

    console.log(`[SMTP Success] Email sent successfully to ${to}. MessageID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[SMTP Exception] Error sending email to ${to}:`, error);
    throw error;
  }
};

module.exports = {
  transporter,
  verifyConnection,
  sendEmail,
};
