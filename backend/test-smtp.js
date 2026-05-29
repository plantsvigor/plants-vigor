const nodemailer = require("nodemailer");
require("dotenv").config();

async function test() {
  console.log("Starting SMTP Test...");
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  console.log("Env User:", emailUser);
  console.log("Env Pass Length:", emailPass ? emailPass.length : 0);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ Connection pool verified!");

    const sender = process.env.EMAIL_FROM || `"Plants Vigroe" <plantsvigroe@gmail.com>`;
    const info = await transporter.sendMail({
      from: sender,
      to: "plantsvigor@gmail.com",
      subject: "SMTP Diagnostic Test with Port 465",
      html: "<h3>SMTP Test Successful</h3><p>If you see this, email sending works.</p>"
    });

    console.log("Test Success! Results:", info);
  } catch (err) {
    console.error("Test Exception:", err);
  }
}

test();
