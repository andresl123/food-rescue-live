const BASE_URL = "http://localhost:8081/api/v1";
const BFF_BASE_URL = "http://localhost:8090";

export async function getLots() {
  try {
    const response = await fetch(`${BFF_BASE_URL}/api/lots`, {
      method: "GET",
      headers: {
              "Content-Type": "application/json",
            },
      credentials: "include",
    });

    if (response.status === 401) {
      return { success: false, message: "Unauthorized: Invalid or expired token." };
    }

    if (!response.ok) {
      let errorMessage = "Failed to fetch lots.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {}
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Fetched lots:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Get Lots Error:", error);
    return { success: false, message: error.message };
  }
}

export async function createLot(lotData) {
  try {
    const response = await fetch(`${BFF_BASE_URL}/api/lots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lotData),
      // THIS is the key so the browser sends the HttpOnly cookies to the BFF
      credentials: "include",
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message: data.message || "Unauthorized or Forbidden",
      };
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to create lot.");
    }

    return { success: true, data };
  } catch (error) {
    console.error("Create Lot Error:", error);
    return { success: false, message: error.message };
  }
}

export async function addFoodItem(lotId, itemData) {
  try {
    const response = await fetch(`${BFF_BASE_URL}/api/lots/${lotId}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(itemData),
      credentials: "include",
    });

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      return { success: false, message: data.message || "Unauthorized or Forbidden" };
    }

    if (!response.ok) {
      let errorMessage = data.message || "Failed to add item.";
      throw new Error(errorMessage);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Add Food Item Error:", error);
    return { success: false, message: error.message };
  }
}

// Fetch items for a specific lot
export async function getFoodItemsByLot(lotId) {
  try {
    const res = await fetch(`${BFF_BASE_URL}/api/lots/${lotId}/items`, {
      headers: {
              "Content-Type": "application/json",
            },
    // THIS is the key so the browser sends the HttpOnly cookies to the BFF
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to fetch food items");
    const data = await res.json();
    console.log("Fetched Items:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Get Food Items Error:", error);
    return { success: false, message: error.message };
  }
}

export async function updateLot(lotId, lotData) {
  try {
    console.log("Updating lot:", lotId);

    const response = await fetch(`${BFF_BASE_URL}/api/lots/${lotId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(lotData),
    });

    const text = await response.text();
    console.log("Raw response:", text);

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }

    if (!response.ok) {
      console.error("Lot update failed:", parsed);
      throw new Error(parsed.message || `Failed to update lot: ${response.status}`);
    }

    console.log("Lot updated successfully:", parsed);
    return { success: true, data: parsed.data || parsed };
  } catch (error) {
    console.error("Update Lot Error:", error);
    return { success: false, message: error.message };
  }
}

// export async function updateLot(lotId, lotData) {
//   try {
//     const token = localStorage.getItem("accessToken");
//     if (!token) return { success: false, message: "No token found" };
//
//     const response = await fetch(`http://localhost:8081/api/v1/lots/${lotId}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(lotData),
//     });
//
//     const data = await response.json();
//     if (!response.ok)
//       throw new Error(data.message || "Failed to update lot");
//
//     return { success: true, data };
//   } catch (error) {
//     console.error("Update Lot Error:", error);
//     return { success: false, message: error.message };
//   }
// }

export async function updateFoodItem(lotId, itemId, itemData) {
  try {
//     const token = localStorage.getItem("accessToken");
//     if (!token) return { success: false, message: "No token found" };

    const response = await fetch(`${BFF_BASE_URL}/api/lots/${lotId}/items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(itemData),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update item");
    return { success: true, data };
  } catch (error) {
    console.error("Update Food Item Error:", error);
    return { success: false, message: error.message };
  }
}


// Disable food item instead of deleting
export async function disableFoodItem(item) {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${BASE_URL}/lots/${item.lotId}/items/${item.itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "INACTIVE" }),
    });
    if (!res.ok) throw new Error("Failed to disable item");
    return { success: true };
  } catch (err) {
    console.error("Disable Item Error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * Fetches all lots from the raw backend API.
 */
export const getAllLots = async () => {
  const accessToken = getAuthToken(); // <-- Renamed variable

  if (!accessToken) { // <-- Renamed variable
    // If no token, we can't even try to make the request.
    throw new Error("Authentication token not found. Please log in.");
  }

  const response = await fetch(`${BASE_URL}/api/v1/lots/all`, { // <-- Renamed
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`, // <-- Renamed variable
    },
  });

  if (response.status === 401) {
    throw new Error("Unauthorized: Your token may be invalid or expired.");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch lots: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

/**
 * Updates an existing lot.
 * @param {string} lotId - The ID of the lot to update.
 * @param {object} updateData - An object with { description, status }.
 */
export const updateLot = async (lotId, updateData) => {
  const accessToken = getAuthToken();

  if (!accessToken) { //
    throw new Error("Authentication token not found. Please log in.");
  }

  const response = await fetch(`${BASE_URL}/api/v1/lots/${lotId}`, { // <-- Renamed
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updateData), // Send the new data as JSON
  });

  if (response.status === 401) {
    throw new Error("Unauthorized: Your token may be invalid or expired.");
  }

  if (response.status === 403) {
    throw new Error("Forbidden: You do not have permission to edit this lot.");
  }

  if (!response.ok) {
    throw new Error(`Failed to update lot: ${response.status} ${response.statusText}`);
  }

  return response.json(); // Return the updated lot from the server
};

/**
 * Deletes a lot permanently from the database.
 * @param {string} lotId - The ID of the lot to delete.
 */
export const deleteLot = async (lotId) => {
  const accessToken = getAuthToken();

  if (!accessToken) {
    throw new Error("Authentication token not found. Please log in.");
  }

  const response = await fetch(`${BASE_URL}/api/v1/lots/${lotId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    throw new Error("Unauthorized: Your token may be invalid or expired.");
  }

  if (response.status === 403) {
    throw new Error("Forbidden: You must be an ADMIN to permanently delete a lot.");
  }

  // A successful DELETE often returns a 204 No Content
  if (response.status === 204) {
    return; // Success
  }

  if (!response.ok) {
    throw new Error(`Failed to delete lot: ${response.status} ${response.statusText}`);
  }

  // Handle if server returns 200 OK with a body, though 204 is more common
  return;
};