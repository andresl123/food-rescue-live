const BASE_URL = "http://localhost:8081/api/v1";

export async function getLots() {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return { success: false, message: "No authentication token found." };
    }

    const response = await fetch(`${BASE_URL}/lots`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
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
    return { success: true, data };
  } catch (error) {
    console.error("Get Lots Error:", error);
    return { success: false, message: error.message };
  }
}

export async function createLot(lotData) {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return { success: false, message: "No authentication token found." };
    }

    const response = await fetch(`${BASE_URL}/lots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(lotData),
    });

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      return { success: false, message: data.message || "Unauthorized or Forbidden" };
    }

    if (!response.ok) {
      let errorMessage = data.message || "Failed to create lot.";
      throw new Error(errorMessage);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Create Lot Error:", error);
    return { success: false, message: error.message };
  }
}

export async function addFoodItem(lotId, itemData) {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return { success: false, message: "No authentication token found." };
    }

    const response = await fetch(`${BASE_URL}/lots/${lotId}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(itemData),
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
