const axios = require("axios");

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

// Secure in-memory token cache
let cachedToken = null;
let tokenExpiry = null;

/**
 * Log in to Shiprocket and return the auth token.
 * Caches token in memory for efficiency.
 */
const getAuthToken = async () => {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  console.log("\n=================== [SHIPROCKET AUTH DIAGNOSTICS] ===================");
  console.log(`[DIAGNOSTICS] Node Environment: ${process.env.NODE_ENV}`);
  console.log(`[DIAGNOSTICS] SHIPROCKET_EMAIL defined: ${!!process.env.SHIPROCKET_EMAIL}`);
  console.log(`[DIAGNOSTICS] SHIPROCKET_PASSWORD defined: ${!!process.env.SHIPROCKET_PASSWORD}`);

  // Safely normalize environment variables by trimming whitespaces and stripping surrounding quotes
  const email = (process.env.SHIPROCKET_EMAIL || "").trim().replace(/^["']|["']$/g, "");
  const password = (process.env.SHIPROCKET_PASSWORD || "").trim().replace(/^["']|["']$/g, "");

  console.log(`[DIAGNOSTICS] Normalized Email: "${email}" (Length: ${email.length})`);
  console.log(`[DIAGNOSTICS] Normalized Password Length: ${password.length}`);

  if (!email || !password) {
    console.error("[SHIPROCKET ERROR] Authentication credentials are completely missing or blank.");
    console.log("======================================================================\n");
    throw new Error("Missing Shiprocket email or password in environment variables.");
  }

  console.log("[SHIPROCKET] Dispatching login request to Shiprocket API...");
  try {
    const response = await axios.post(
      `${BASE_URL}/auth/login`,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        timeout: 10000 // 10 second timeout
      }
    );

    console.log("[SHIPROCKET RESPONSE] Raw API Response Status:", response.status);
    
    if (response.data && response.data.token) {
      cachedToken = response.data.token;
      // Cache token for 2 hours (Shiprocket tokens expire in 10 days, so this is ultra safe)
      tokenExpiry = now + 2 * 60 * 60 * 1000;
      console.log("[SHIPROCKET SUCCESS] Authentication token obtained and cached successfully.");
      console.log("======================================================================\n");
      return cachedToken;
    } else {
      console.error("[SHIPROCKET ERROR] API succeeded but no JWT token was returned in response payload:", response.data);
      console.log("======================================================================\n");
      throw new Error("No token returned from Shiprocket authentication.");
    }
  } catch (error) {
    console.error("[SHIPROCKET FAILURE] Authentication failed.");
    if (error.response) {
      // The request was made and the server responded with a status code outside the 2xx range
      console.error(`- Response Status Code: ${error.response.status}`);
      console.error("- Response Data:", JSON.stringify(error.response.data, null, 2));
      console.error("- Headers Sent:", JSON.stringify(error.config?.headers, null, 2));
      
      // Provide explicit debug tips for common status codes
      if (error.response.status === 403) {
        console.error("\n💡 DIAGNOSTIC TIP (403 Forbidden):");
        console.error("1. Trailing or leading whitespaces in your credentials might be present.");
        console.error("2. If this account is using Google Sign-In or OTP on the web panel, the password is not yet configured for API access. Set a standard password on your Shiprocket Profile.");
        console.error("3. API access is disabled by default for some new accounts. Check 'API' options in your Shiprocket Account Settings.");
        console.error("4. IP whitelist restriction is turned on in your Shiprocket dashboard, blocking this server's IP address.");
      } else if (error.response.status === 401) {
        console.error("\n💡 DIAGNOSTIC TIP (401 Unauthorized): Invalid email or password credentials.");
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("- No response was received from Shiprocket server.");
      console.error("- Request Config Details:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("- Error setting up Axios request:", error.message);
    }
    console.log("======================================================================\n");
    throw new Error(`Shiprocket auth failed: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Format timestamp to Shiprocket date format "YYYY-MM-DD HH:MM"
 */
const formatDate = (ms) => {
  const date = new Date(ms || Date.now());
  const YYYY = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const DD = String(date.getDate()).padStart(2, "0");
  const HH = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${YYYY}-${MM}-${DD} ${HH}:${mm}`;
};

/**
 * Create a new order in Shiprocket
 */
const createShiprocketOrder = async (order) => {
  let payload = null;
  const missingFields = [];
  try {
    const token = await getAuthToken();

    // Extract address/shipping info supporting various nested or flat structures
    let shippingInfo = {};
    if (order.shippingInfo && typeof order.shippingInfo === "object") {
      shippingInfo = order.shippingInfo;
    } else if (order.shipping_info && typeof order.shipping_info === "object") {
      shippingInfo = order.shipping_info;
    } else if (order.address && typeof order.address === "object") {
      shippingInfo = order.address;
    }

    const extractField = (keys) => {
      // 1. Try to find the key in the shippingInfo / nested address object first
      for (const key of keys) {
        if (shippingInfo && shippingInfo[key] !== undefined && shippingInfo[key] !== null) {
          const val = String(shippingInfo[key]).trim();
          if (val) return val;
        }
      }
      // 2. Try to find the key in the root order object
      for (const key of keys) {
        if (order && order[key] !== undefined && order[key] !== null && typeof order[key] !== "object") {
          const val = String(order[key]).trim();
          if (val) return val;
        }
      }
      return null;
    };

    // Correctly map fields handling aliases like pinCode/pincode, phoneNo/phone
    const rawName = extractField(["fullName", "customerName", "name", "billing_customer_name", "billing_name", "firstName", "lastName"]);
    const rawAddress = extractField(["street", "address", "addressLine1", "addressLine2", "billing_address", "billing_street"]);
    const rawCity = extractField(["city", "billing_city", "town"]);
    const rawState = extractField(["state", "billing_state"]);
    const rawPincode = extractField(["pincode", "pinCode", "pin_code", "billing_pincode", "zip", "zipcode", "zipCode"]);
    const rawPhone = extractField(["phone", "phoneNo", "phone_no", "phoneNumber", "mobile", "mobileNo", "mobile_no", "billing_phone"]);
    const rawCountry = extractField(["country", "billing_country"]) || "India";

    // Debugging print
    console.log("\n=================== [SHIPROCKET DEBUG: ORDER & SHIPPING INFO] ===================");
    console.log("--- Complete Order Object ---");
    console.log(JSON.stringify(order, null, 2));
    console.log("\n--- Extracted Shipping Info ---");
    console.log(`- Customer Name: ${rawName || "undefined/null"}`);
    console.log(`- Address: ${rawAddress || "undefined/null"}`);
    console.log(`- City: ${rawCity || "undefined/null"}`);
    console.log(`- State: ${rawState || "undefined/null"}`);
    console.log(`- Pincode: ${rawPincode || "undefined/null"}`);
    console.log(`- Phone Number: ${rawPhone || "undefined/null"}`);
    console.log(`- Country: ${rawCountry || "undefined/null"}`);
    console.log(`- Payment Method: ${order.payment || "undefined/null"}`);
    console.log(`- Items:`, JSON.stringify(order.products || order.items || [], null, 2));
    console.log("=================================================================================\n");

    // Pre-request validation
    if (!rawName) missingFields.push("billing_customer_name");
    if (!rawAddress) missingFields.push("billing_address");
    if (!rawCity) missingFields.push("billing_city");
    if (!rawState) missingFields.push("billing_state");
    if (!rawCountry) missingFields.push("billing_country");
    if (!rawPincode) missingFields.push("billing_pincode");
    if (!rawPhone) missingFields.push("billing_phone");

    if (missingFields.length > 0) {
      console.error("\n=================== [SHIPROCKET VALIDATION ERROR] ===================");
      console.error(`[ERROR] Order creation stopped due to missing required billing/shipping fields.`);
      console.error(`[ERROR] Missing fields: ${missingFields.join(", ")}`);
      console.error("=====================================================================\n");

      throw new Error(`Shiprocket order creation failed: Missing required fields: ${missingFields.join(", ")}`);
    }

    const nameParts = rawName.trim().split(/\s+/);
    const firstName = nameParts[0] || "Guest";
    const lastName = nameParts.slice(1).join(" ") || "Customer";

    const defaultLength = Number(process.env.SHIPROCKET_DEFAULT_LENGTH) || 10;
    const defaultBreadth = Number(process.env.SHIPROCKET_DEFAULT_BREADTH) || 10;
    const defaultHeight = Number(process.env.SHIPROCKET_DEFAULT_HEIGHT) || 10;
    const defaultWeight = Number(process.env.SHIPROCKET_DEFAULT_WEIGHT) || 0.5;

    payload = {
      order_id: order.orderCode || order.id || `PO${Date.now()}`,
      order_date: formatDate(order.createdAtMs || order.createdAt),
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "warehouse",
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: rawAddress,
      billing_city: rawCity,
      billing_pincode: rawPincode,
      billing_state: rawState,
      billing_country: rawCountry,
      billing_email: order.email || "customer@example.com",
      billing_phone: rawPhone,
      shipping_is_billing: true,
      shipping_customer_name: firstName,
      shipping_last_name: lastName,
      shipping_address: rawAddress,
      shipping_city: rawCity,
      shipping_pincode: rawPincode,
      shipping_state: rawState,
      shipping_country: rawCountry,
      shipping_email: order.email || "customer@example.com",
      shipping_phone: rawPhone,
      order_items: (order.products || order.items || []).map(item => ({
        name: item.name || "Product",
        sku: item.productId || item.sku || `SKU-${Date.now()}`,
        units: Number(item.quantity || item.units || 1),
        selling_price: Number(item.price || item.selling_price || 0),
        discount: 0,
        tax: 0,
        hsn: ""
      })),
      payment_method: (order.payment === "COD" || order.payment_method === "COD") ? "COD" : "Prepaid",
      shipping_charges: Number(order.delivery || order.shipping_charges || 0),
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: Number(order.subtotal || order.sub_total || order.totalAmount || 0),
      length: defaultLength,
      breadth: defaultBreadth,
      height: defaultHeight,
      weight: defaultWeight
    };

    console.log(`[SHIPROCKET] Creating order ${payload.order_id} on Shiprocket...`);
    const response = await axios.post(`${BASE_URL}/orders/create/adhoc`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // 2. Print COMPLETE raw Shiprocket response
    console.log("FULL SHIPROCKET RESPONSE:", JSON.stringify(response.data, null, 2));

    // 3. Treat HTTP status 200 or 201 as successful order creation
    if (response.status === 200 || response.status === 201) {
      
      // 4. Safely parse response using optional chaining from multiple possible response formats
      const shipment_id = response?.data?.shipment_id || response?.data?.response?.shipment_id || null;
      const shiprocket_order_id = response?.data?.order_id || response?.data?.response?.order_id || null;
      const awb_code = response?.data?.awb_code || response?.data?.response?.awb_code || null;
      const courier_name = response?.data?.courier_name || response?.data?.response?.courier_name || null;
      const tracking_url = response?.data?.tracking_url || response?.data?.response?.tracking_url || null;
      
      // 8. Fallback default status
      const current_status = response?.data?.status || response?.data?.response?.status || "NEW";

      // 6. Print proper success logs
      console.log(`[SHIPROCKET SUCCESS] Order created successfully`);
      console.log(`[SHIPROCKET SUCCESS] Shiprocket Order ID: ${shiprocket_order_id || "N/A"}`);
      console.log(`[SHIPROCKET SUCCESS] Shipment ID: ${shipment_id || "N/A"}`);
      console.log(`[SHIPROCKET SUCCESS] AWB Code: ${awb_code || "N/A"}`);
      console.log(`[SHIPROCKET SUCCESS] Courier: ${courier_name || "N/A"}`);
      console.log(`[SHIPROCKET SUCCESS] Tracking URL: ${tracking_url || "N/A"}`);

      return {
        shiprocket_order_id,
        shipment_id,
        awb_code,
        courier_name,
        tracking_url,
        current_status
      };
    } else {
      throw new Error(`Shiprocket returned unexpected HTTP status: ${response.status}`);
    }
  } catch (error) {
    // 10. Add proper try/catch logging to avoid crashing and print exact error
    console.error("\n=================== [SHIPROCKET FAILURE DIAGNOSTICS] ===================");
    console.error(`[ERROR] Shiprocket order creation failed.`);
    console.error(`[ERROR] HTTP Response Status: ${error.response?.status || "N/A"}`);
    console.error(`[ERROR] Raw Error Response:`, JSON.stringify(error.response?.data || error.message, null, 2));
    
    if (payload) {
      console.error("--- Exact Payload Sent ---");
      console.error(JSON.stringify(payload, null, 2));
    }
    console.error("========================================================================\n");

    throw new Error(`Shiprocket order creation failed: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
  }
};

/**
 * Fetch available courier companies based on pincodes & weight,
 * auto-assign the best courier and generate the AWB number.
 */
const assignCourierAndAWB = async (shipmentId, deliveryPincode, isCOD) => {
  try {
    const token = await getAuthToken();

    // 1. Fetch courier serviceability
    console.log(`[SHIPROCKET] Fetching serviceability for pincode ${deliveryPincode}...`);
    const serviceabilityUrl = `${BASE_URL}/courier/serviceability/`;
    const defaultWeight = Number(process.env.SHIPROCKET_DEFAULT_WEIGHT) || 0.5;
    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || "400001";

    const serviceabilityResponse = await axios.get(serviceabilityUrl, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        pickup_postcode: pickupPincode,
        delivery_postcode: deliveryPincode,
        weight: defaultWeight,
        cod: isCOD ? 1 : 0
      }
    });

    const courierCompanies = serviceabilityResponse.data?.data?.available_courier_companies;
    if (!courierCompanies || courierCompanies.length === 0) {
      throw new Error(`No courier partners serviceable for delivery pincode ${deliveryPincode}`);
    }

    // Auto-select the first available/cheapest courier partner
    const selectedCourier = courierCompanies[0];
    const courierId = selectedCourier.courier_company_id;
    const courierName = selectedCourier.courier_name;

    console.log(`[SHIPROCKET] Assigning courier: ${courierName} (ID: ${courierId}) to shipment ${shipmentId}...`);

    // 2. Assign AWB
    const assignResponse = await axios.post(`${BASE_URL}/courier/assign/awb`, {
      shipment_id: shipmentId,
      courier_id: courierId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const assignData = assignResponse.data;
    if (assignData && assignData.awb_assign_status === 1 && assignData.response?.data?.awb_code) {
      const awbCode = assignData.response.data.awb_code;
      const trackingUrl = `https://shiprocket.co/tracking/${awbCode}`;
      console.log(`[SHIPROCKET] AWB Assigned successfully: ${awbCode}`);

      return {
        awb_code: awbCode,
        courier_name: courierName,
        tracking_url: trackingUrl
      };
    } else {
      const errMsg = assignData.response?.data?.message || "Could not allocate AWB code.";
      throw new Error(`AWB allocation failed: ${errMsg}`);
    }
  } catch (error) {
    console.error("[SHIPROCKET] Assign Courier & AWB failed:", error.response?.data || error.message);
    throw new Error(`Shiprocket AWB assignment failed: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Request shipment pickup
 */
const requestPickup = async (shipmentId) => {
  try {
    const token = await getAuthToken();
    console.log(`[SHIPROCKET] Requesting pickup for shipment ${shipmentId}...`);

    const response = await axios.post(`${BASE_URL}/courier/generate/pickup`, {
      shipment_id: [Number(shipmentId)]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data && response.data.pickup_status === 1) {
      console.log(`[SHIPROCKET] Pickup request successful.`);
      return response.data;
    } else {
      throw new Error(response.data?.pickup_error || "Could not schedule pickup.");
    }
  } catch (error) {
    console.error("[SHIPROCKET] Pickup request failed:", error.response?.data || error.message);
    throw new Error(`Shiprocket pickup request failed: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Generate Shipping Label PDF link
 */
const generateLabel = async (shipmentId) => {
  try {
    const token = await getAuthToken();
    console.log(`[SHIPROCKET] Requesting shipping label for shipment ${shipmentId}...`);

    const response = await axios.post(`${BASE_URL}/courier/generate/label`, {
      shipment_id: [Number(shipmentId)]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data && response.data.label_created) {
      console.log(`[SHIPROCKET] Label created successfully: ${response.data.label_url}`);
      return response.data.label_url;
    } else {
      throw new Error("Could not create shipping label.");
    }
  } catch (error) {
    console.error("[SHIPROCKET] Label generation failed:", error.response?.data || error.message);
    throw new Error(`Shiprocket label generation failed: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Track shipment details
 */
const trackShipment = async (shipmentId) => {
  try {
    const token = await getAuthToken();
    console.log(`[SHIPROCKET] Getting tracking details for shipment ${shipmentId}...`);

    const response = await axios.get(`${BASE_URL}/courier/track/shipment/${shipmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error("[SHIPROCKET] Live shipment tracking failed:", error.response?.data || error.message);
    throw new Error(`Shiprocket live tracking failed: ${error.response?.data?.message || error.message}`);
  }
};

module.exports = {
  getAuthToken,
  createOrder: createShiprocketOrder,
  createShiprocketOrder,
  assignCourierAndAWB,
  requestPickup,
  generateLabel,
  trackShipment
};
