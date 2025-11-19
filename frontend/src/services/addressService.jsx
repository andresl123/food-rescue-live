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



export async function updateAddress(addressId, updatedData) {
  try {
    const response = await fetch(`${BFF_BASE_URL}/addresses/${addressId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
      credentials: "include", // important if backend needs auth cookie
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
}