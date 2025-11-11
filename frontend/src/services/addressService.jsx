// Base URL for all BFF API calls
const BFF_BASE_URL = `${import.meta.env.VITE_BFF_BASE_URL}/api`;

export async function createAddress(addressData) {
  try {
    console.log("Creating address:", addressData);

    const response = await fetch(`${BFF_BASE_URL}/addresses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressData),
    });

    console.log("Address API status:", response.status);

    const text = await response.text();
    console.log("Raw address response:", text);

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { success: false, raw: text };
    }

    if (!response.ok) {
      console.error("Address creation failed:", parsed);
      throw new Error(`Address creation failed: ${response.status}`);
    }

    console.log("Address created successfully:", parsed);
    return parsed.data || parsed;
  } catch (error) {
    console.error("Address creation error:", error);
    throw error;
  }
}

export async function getAddressById(addressId) {
  try {
    console.log("Fetching address by ID:", addressId);

    const response = await fetch(`${BFF_BASE_URL}/addresses/${addressId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
        credentials: "include",
    });

    console.log("Get Address status:", response.status);

    const text = await response.text();
    console.log("Raw get address response:", text);

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { success: false, raw: text };
    }

    if (!response.ok) {
      console.error("Address fetch failed:", parsed);
      throw new Error(`Failed to fetch address: ${response.status}`);
    }

    console.log("Address fetched successfully:", parsed);
    return parsed.data || parsed;
  } catch (error) {
    console.error("Error fetching address:", error);
    throw error;
  }
}



// // src/services/addressService.jsx
//
// /**
//  * Creates a new address by calling the backend API.
//  * Backend endpoint: POST http://localhost:8080/api/v1/addresses
//  * Returns: { success: true, data: { id, street, city, state, postalCode, country } }
//  */
//
// export async function createAddress(addressData) {
//   try {
//     console.log("➡️ Creating address:", addressData);
//
//     const response = await fetch("http://localhost:8090/api/addresses", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(addressData),
// //       body: JSON.stringify(credentials),
//       //credentials: "include",
//     });
//
//     // log raw HTTP status
//     console.log("📡 Address API status:", response.status);
//
//     // read response body as text first (to handle both JSON or raw string)
//     const text = await response.text();
//     console.log("📩 Raw address response:", text);
//
//     let parsed;
//     try {
//       parsed = JSON.parse(text);
//     } catch {
//       parsed = { success: false, raw: text };
//     }
//
//     // Handle non-OK responses
//     if (!response.ok) {
//       console.error("⚠️ Address creation failed:", parsed);
//       throw new Error(`Address creation failed: ${response.status}`);
//     }
//
//     // Success
//     console.log("✅ Address created successfully:", parsed);
//     return parsed.data || parsed; // support both wrapped and plain JSON
//   } catch (error) {
//     console.error("❌ Address creation error:", error);
//     throw error;
//   }
// }
