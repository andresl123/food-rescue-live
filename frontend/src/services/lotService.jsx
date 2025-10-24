import { mockSession } from "../mock/mockSession";

const BASE_URL = "http://localhost:8081/api/v1"; // Using relative path for the proxy

/**
 * Fetches all lots for the currently authenticated donor.
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export async function getLots() {
  try {

    const token =
        sessionStorage.getItem("accessToken") ||
        mockSession?.token ||
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGU3Zjk3MGU0MGE5OGFiZWRhZDJmYTEiLCJyb2xlcyI6WyJVU0VSIiwiRE9OT1IiXSwiaXNzIjoieW91ci1pc3N1ZXIiLCJhdWQiOiJ5b3VyLWF1ZGllbmNlIiwiZXhwIjoxNzkyMzk5MjAwfQ.Lynh0kCCV-aotUhGAP-rfrEw7pGyaLRqGIlkGogtJ6SYHrHlQpDivQZ0nugM37GVQkwGGKx_ocyie7kIQs9gEBEWQjaVjNQVg-bxVHCVMtG5bubPjvGW2SY36uPtlevyoBJBa20MKhAOyzBSLF9r_NQ-2C9HM5pgrio8PB27mMnHF0bsB9VTD2EAJfwK1yzbwlckq3HwKeOlK-O6qDTgGzHk7xRkLZbS9P6_bwmhwCI-GRhgqFFVA-qMd8Jmu3sgqg40tQdZ6pXJg2tGCYpMHZwEZgeE-nRrg7OPetWsp1egnciR3Nw4r3M46vNWqUy-gNyP2o5brRLTvKCjGHInSA";
    // ---------------------------------------------

    if (!token) {
        return { success: false, message: 'No authentication token found.' };
    }

    const response = await fetch(`${BASE_URL}/lots`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      return { success: false, message: 'Unauthorized: Invalid or expired token.' };
    }
    if (!response.ok) {
       let errorMessage = 'Failed to fetch lots.';
       try { const errorData = await response.json(); errorMessage = errorData.message || errorMessage; } catch (e) {}
       throw new Error(errorMessage);
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    console.error("Get Lots Error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Creates a new donation lot.
 * @param {{description: string, totalItems: number}} lotData The data for the new lot.
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export async function createLot(lotData) { // Removed token parameter
  try {
    const token =
        sessionStorage.getItem("accessToken") ||
        mockSession?.token ||
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGU3Zjk3MGU0MGE5OGFiZWRhZDJmYTEiLCJyb2xlcyI6WyJVU0VSIiwiRE9OT1IiXSwiaXNzIjoieW91ci1pc3N1ZXIiLCJhdWQiOiJ5b3VyLWF1ZGllbmNlIiwiZXhwIjoxNzkyMzk5MjAwfQ.Lynh0kCCV-aotUhGAP-rfrEw7pGyaLRqGIlkGogtJ6SYHrHlQpDivQZ0nugM37GVQkwGGKx_ocyie7kIQs9gEBEWQjaVjNQVg-bxVHCVMtG5bubPjvGW2SY36uPtlevyoBJBa20MKhAOyzBSLF9r_NQ-2C9HM5pgrio8PB27mMnHF0bsB9VTD2EAJfwK1yzbwlckq3HwKeOlK-O6qDTgGzHk7xRkLZbS9P6_bwmhwCI-GRhgqFFVA-qMd8Jmu3sgqg40tQdZ6pXJg2tGCYpMHZwEZgeE-nRrg7OPetWsp1egnciR3Nw4r3M46vNWqUy-gNyP2o5brRLTvKCjGHInSA";
    // ---------------------------------------------
     if (!token) {
        return { success: false, message: 'No authentication token found.' };
    }

    const response = await fetch(`${BASE_URL}/lots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Use hardcoded token
      },
      body: JSON.stringify(lotData)
    });
    const data = await response.json();
    if (response.status === 401 || response.status === 403) {
        return { success: false, message: data.message || (response.status === 401 ? 'Unauthorized' : 'Forbidden') };
    }
    if (!response.ok) {
       let errorMessage = 'Failed to create lot.';
       try { const errorData = await response.json(); errorMessage = errorData.message || errorMessage; } catch (e) {}
       throw new Error(errorMessage);
    }
    return { success: true, data };
  } catch (error) {
     console.error("Create Lot Error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Adds a new food item to a specific lot.
 * @param {string} lotId The ID of the lot to add the item to.
 * @param {object} itemData The data for the new food item.
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export async function addFoodItem(lotId, itemData) { // Removed token parameter
  try {
    // --- TEMPORARY HARDCODED TOKEN FOR TESTING ---
    const token =
        sessionStorage.getItem("accessToken") ||
        mockSession?.token ||
        "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGU3Zjk3MGU0MGE5OGFiZWRhZDJmYTEiLCJyb2xlcyI6WyJVU0VSIiwiRE9OT1IiXSwiaXNzIjoieW91ci1pc3N1ZXIiLCJhdWQiOiJ5b3VyLWF1ZGllbmNlIiwiZXhwIjoxNzkyMzk5MjAwfQ.Lynh0kCCV-aotUhGAP-rfrEw7pGyaLRqGIlkGogtJ6SYHrHlQpDivQZ0nugM37GVQkwGGKx_ocyie7kIQs9gEBEWQjaVjNQVg-bxVHCVMtG5bubPjvGW2SY36uPtlevyoBJBa20MKhAOyzBSLF9r_NQ-2C9HM5pgrio8PB27mMnHF0bsB9VTD2EAJfwK1yzbwlckq3HwKeOlK-O6qDTgGzHk7xRkLZbS9P6_bwmhwCI-GRhgqFFVA-qMd8Jmu3sgqg40tQdZ6pXJg2tGCYpMHZwEZgeE-nRrg7OPetWsp1egnciR3Nw4r3M46vNWqUy-gNyP2o5brRLTvKCjGHInSA";
    // ---------------------------------------------
     if (!token) {
        return { success: false, message: 'No authentication token found.' };
    }

    const response = await fetch(`${BASE_URL}/lots/${lotId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Use hardcoded token
      },
      body: JSON.stringify(itemData)
    });
    const data = await response.json();
     if (response.status === 401 || response.status === 403) {
        return { success: false, message: data.message || (response.status === 401 ? 'Unauthorized' : 'Forbidden') };
    }
    if (!response.ok) {
       let errorMessage = 'Failed to add item.';
       try { const errorData = await response.json(); errorMessage = errorData.message || errorMessage; } catch (e) {}
       throw new Error(errorMessage);
    }
    return { success: true, data };
  } catch (error) {
     console.error("Add Food Item Error:", error);
    return { success: false, message: error.message };
  }
}