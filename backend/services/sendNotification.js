const { sendEmail } = require("../utils/emailService");

/**
 * Sends a welcome email to the user upon successful signup.
 * @param {string} email - User email address
 * @param {string} name - User name
 */
const sendWelcomeEmail = async (email, name) => {
  const subject = "Welcome to Greenbloom!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #008744; text-align: center;">Hello, ${name}!</h2>
      <p>Your account has been successfully created. We are absolutely thrilled to welcome you to the <strong>Plants Vigor / Greenbloom</strong> family! 🎉</p>
      <p>Explore our premium greenhouse-fresh plants, curated gardening accessories, and utilize our smart Plant Care AI assistant to keep your plants thriving.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://plants-vigor.vercel.app" style="background-color: #008744; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Shop Greenbloom Now</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 11px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Plants Vigor / Greenbloom. All rights reserved.</p>
    </div>
  `;
  
  try {
    await sendEmail({ to: email, subject, html });
  } catch (error) {
    console.error(`[Notification Warning] Failed to send Welcome email to ${email}:`, error);
  }
};

/**
 * Sends an order confirmation notification to the customer.
 * @param {Object} order - The created order document object
 */
const sendOrderConfirmation = async (order) => {
  const subject = `Order Confirmed - #${order.orderCode || order.id}`;
  
  const productRows = (order.products || []).map(p => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${p.name} (x${p.quantity})</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${p.price * p.quantity}</td>
    </tr>
  `).join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #008744; text-align: center;">Order Confirmed!</h2>
      <p>Thank you for shopping with us! Your order <strong>#${order.orderCode || order.id}</strong> has been received and is being processed.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f4f4f4;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
          <tr>
            <td style="padding: 10px; font-weight: bold; border-top: 1px solid #ddd;">Subtotal</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 1px solid #ddd;">Rs. ${order.subtotal}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Delivery</td>
            <td style="padding: 10px; text-align: right; font-weight: bold;">Rs. ${order.delivery}</td>
          </tr>
          <tr style="background-color: #f9f9f9; font-size: 16px;">
            <td style="padding: 10px; font-weight: bold; color: #008744;">Grand Total</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: #008744;">Rs. ${order.totalAmount}</td>
          </tr>
        </tbody>
      </table>

      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #004d40;">Delivery Address:</h4>
        <p style="margin-bottom: 0; font-size: 13px; color: #333;">
          ${order.address?.street || ""}, ${order.address?.city || ""}, ${order.address?.state || ""} - ${order.address?.pincode || ""}
        </p>
      </div>

      <p style="font-size: 13px; color: #666;">We will send you a tracking link via SMS/Email as soon as your greenhouse-fresh package is dispatched.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 11px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Plants Vigor. All rights reserved.</p>
    </div>
  `;
  
  try {
    await sendEmail({ to: order.email, subject, html });
  } catch (error) {
    console.error(`[Notification Warning] Failed to send Order Confirmation to ${order.email}:`, error);
  }
};

/**
 * Sends a notification of a new order to the administrators.
 * @param {Object} order - The created order document object
 */
const sendAdminOrderAlert = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL || "plantsvigor@gmail.com";
  const subject = `⚠️ [ADMIN ALERT] New Order Received - #${order.orderCode || order.id}`;
  
  const productList = (order.products || []).map(p => `
    <li>${p.name} (Qty: ${p.quantity}) - Rs. ${p.price * p.quantity}</li>
  `).join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ffcc80; border-radius: 10px; background-color: #fffde7;">
      <h2 style="color: #e65100; text-align: center;">⚠️ New Order Alert</h2>
      <p>A new order has been successfully placed by a customer on Plants Vigor!</p>
      
      <div style="background-color: white; padding: 15px; border-radius: 5px; border: 1px solid #e0e0e0; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #37474f;">Order Summary:</h4>
        <ul style="padding-left: 20px; font-size: 14px; color: #333;">
          <li><strong>Order Code:</strong> #${order.orderCode || order.id}</li>
          <li><strong>Customer Email:</strong> ${order.email}</li>
          <li><strong>Grand Total:</strong> Rs. ${order.totalAmount}</li>
          <li><strong>Payment Mode:</strong> ${order.payment || "Online"}</li>
        </ul>
        
        <h4 style="color: #37474f;">Products:</h4>
        <ul style="padding-left: 20px; font-size: 14px; color: #333;">
          ${productList}
        </ul>
      </div>

      <p style="font-size: 12px; color: #555;">Please log in to the admin panel to manage, invoice, and update the dispatch status of this order.</p>
      <hr style="border: 0; border-top: 1px solid #ffb74d; margin: 20px 0;">
      <p style="font-size: 11px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Plants Vigor Admin Desk.</p>
    </div>
  `;

  try {
    await sendEmail({ to: adminEmail, subject, html });
  } catch (error) {
    console.error(`[Notification Warning] Failed to send Admin Order Alert:`, error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendAdminOrderAlert,
};
