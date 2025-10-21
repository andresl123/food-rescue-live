// src/services/addressService.jsx

/**
 * Creates a new address by calling the backend API.
 * Backend endpoint: POST http://localhost:8080/api/v1/addresses
 * Returns: { success: true, data: { id, street, city, state, postalCode, country } }
 */

export async function createAddress(addressData) {
  try {
    console.log("➡️ Creating address:", addressData);

    const response = await fetch("http://localhost:8080/api/v1/addresses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(addressData),
    });

    // log raw HTTP status
    console.log("📡 Address API status:", response.status);

    // read response body as text first (to handle both JSON or raw string)
    const text = await response.text();
    console.log("📩 Raw address response:", text);

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { success: false, raw: text };
    }

    // Handle non-OK responses
    if (!response.ok) {
      console.error("⚠️ Address creation failed:", parsed);
      throw new Error(`Address creation failed: ${response.status}`);
    }

    // Success
    console.log("✅ Address created successfully:", parsed);
    return parsed.data || parsed; // support both wrapped and plain JSON
  } catch (error) {
    console.error("❌ Address creation error:", error);
    throw error;
  }
}
