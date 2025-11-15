const BFF_BASE_URL = import.meta.env.VITE_BFF_BASE_URL;

export async function loginUser(credentials) {
  try {
    const response = await fetch(`${BFF_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // your email/password or whatever
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    if (!response.ok) {
      return { success: false, message: "Invalid credentials" };
    }

    // BFF is just proxying auth, so we keep same shape
    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Server error" };
  }
}


export async function addAddressToUser(userId, addressId, setAsDefault = false) {
  try {
    console.log("➡️ addAddressToUser called for user:", userId);

    const response = await fetch(`${BFF_BASE_URL}/api/users/${userId}/addresses`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ addressId, setAsDefault }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to update user addresses:", errorText);
      throw new Error(`Failed to update user addresses: ${response.status}`);
    }

    const data = await response.json();
    console.log("Address successfully linked to user:", data);
    return data.data || data;
  } catch (error) {
    console.error("addAddressToUser error:", error);
    throw error;
  }
}

// Returns userID, email and role
export async function getUserProfile() {
  try {
    const response = await fetch(`${BFF_BASE_URL}/api/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const data = await response.json();
    return { success: true, data: data.data || data };
  } catch (error) {
    console.error("User profile fetch error:", error);
    return { success: false, message: "Unable to fetch user profile" };
  }
}

// returns whole user information on the basis of user ID
export async function getUserById(userId) {
  try {
    console.log("Fetching user by ID:", userId);

    const response = await fetch(`${BFF_BASE_URL}/api/users/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    console.log("Get User status:", response.status);

    const text = await response.text();
    console.log("Raw user response:", text);

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { success: false, raw: text };
    }

    if (!response.ok) {
      console.error("User fetch failed:", parsed);
      throw new Error(`Failed to fetch user: ${response.status}`);
    }

    console.log("User fetched successfully:", parsed);
    return parsed.data || parsed;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

// logout method
export async function logoutUser() {
  try {
    const response = await fetch(`${BFF_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Logout failed:", text);
      throw new Error(`Logout failed: ${response.status}`);
    }

    console.log("Logout successful");
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, message: error.message };
  }
}