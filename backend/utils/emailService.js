const { Resend } = require("resend");

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn(
    "⚠️ WARNING: RESEND_API_KEY environment variable is missing! " +
    "Emails will not be sent successfully."
  );
}

// Initialize Resend Client
const resend = new Resend(resendApiKey);

/**
 * Base helper function to send an email using Resend API.
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} [options.html] - HTML content
 * @param {string} [options.text] - Plain text content
 * @returns {Promise<Object>}
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!resendApiKey) {
    console.error("❌ Resend API: Attempted to send email but RESEND_API_KEY is missing.");
    throw new Error("Email service is not configured (missing Resend API key).");
  }

  // Standard requested sender address
  const from = process.env.EMAIL_FROM || "Plant Store <plantsvigor@gmail.com>";

  try {
    console.log(`[Resend] Dispatching email to: ${to} | Subject: "${subject}"...`);
    
    const response = await resend.emails.send({
      from,
      to,
      subject,
      html: html || text,
      text: text || "",
    });

    if (response.error) {
      console.error(`[Resend Error] API returned a delivery error:`, response.error);
      throw new Error(`Resend email sending failed: ${response.error.message || JSON.stringify(response.error)}`);
    }

    console.log(`[Resend Success] Email sent successfully to ${to}. ID: ${response.data?.id || "N/A"}`);
    return response.data;
  } catch (error) {
    console.error(`[Resend Exception] Error sending email to ${to}:`, error);
    throw error;
  }
};

module.exports = {
  resend,
  sendEmail,
};
