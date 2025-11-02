const BASE_URL = "http://localhost:8081"; // Your API base URL

/**
 * A helper function to get the auth token.
 */
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Fetches ALL food items from ALL lots (for Admin).
 */
export const getAllFoodItems = async () => {
  const accessToken = getAuthToken();
  if (!accessToken) throw new Error("Authentication token not found.");

  // This is the new endpoint you created
  const response = await fetch(`${BASE_URL}/api/v1/lots/items/all`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch food items: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

/**
 * Updates an existing food item.
 * @param {string} lotId - The Lot ID
 * @param {string} itemId - The Item ID
 * @param {object} updateData - The form data
 */
export const updateFoodItem = async (lotId, itemId, updateData) => {
  const accessToken = getAuthToken();
  if (!accessToken) throw new Error("Authentication token not found.");

  const response = await fetch(`${BASE_URL}/api/v1/lots/${lotId}/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update item: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

/**
 * Deletes a food item permanently.
 * @param {string} lotId - The Lot ID
 * @param {string} itemId - The Item ID
 */
export const deleteFoodItem = async (lotId, itemId) => {
  const accessToken = getAuthToken();
  if (!accessToken) throw new Error("Authentication token not found.");

  const response = await fetch(`${BASE_URL}/api/v1/lots/${lotId}/items/${itemId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (response.status === 204) {
    return; // Success
  }

  if (!response.ok) {
    throw new Error(`Failed to delete item: ${response.status} ${response.statusText}`);
  }
  return;
};