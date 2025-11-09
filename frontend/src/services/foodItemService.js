const BFF_BASE_URL = "http://localhost:8090";

/**
 * Fetches ALL food items from ALL lots (for Admin).
 */
export const getAllFoodItems = async () => {

  // This is the new endpoint you created
  const response = await fetch(`${BFF_BASE_URL}/api/lots/items/all`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include",
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

  const response = await fetch(`${BFF_BASE_URL}/api/lots/${lotId}/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
    credentials: "include",
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
  const response = await fetch(`${BFF_BASE_URL}/api/lots/${lotId}/items/${itemId}`, {
    method: 'DELETE',
    headers: {
    },
    credentials: "include",
  });

  if (response.status === 204) {
    return; // Success
  }

  if (!response.ok) {
    throw new Error(`Failed to delete item: ${response.status} ${response.statusText}`);
  }
  return;
};
/**
 * Fetches items that are expiring soon (Admin only).
 */
export const getExpiringSoonItems = async () => {
  const response = await fetch(`${BFF_BASE_URL}/api/lots/items/expiring-soon`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include", // Use cookies
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch expiring items: ${response.status}`);
  }

  return response.json(); // Returns the raw array
};