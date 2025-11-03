const BASE_URL = "http://localhost:8080"; // Your API base URL

/**
 * A helper function to get the auth token.
 */
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Fetches all users (Admin only).
 */
export const getAllUsers = async () => {
  const accessToken = getAuthToken();
  if (!accessToken) throw new Error("Authentication token not found.");

  const response = await fetch(`${BASE_URL}/api/v1/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`);
  }

  const apiResponse = await response.json();
  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to fetch users");
  }
  return apiResponse.data; // Return the data array
};

/**
 * Updates a user's roles and status (Admin only).
 * @param {string} userId - The ID of the user to update.
 * @param {object} updateData - An object with { roles, status }.
 */
export const updateUser = async (userId, updateData) => {
  const accessToken = getAuthToken();
  if (!accessToken) throw new Error("Authentication token not found.");

  const response = await fetch(`${BASE_URL}/api/v1/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.status}`);
  }

  const apiResponse = await response.json();
  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to update user");
  }
  return apiResponse.data; // Return the updated user object
};

/**
 * Deletes a user permanently (Admin only).
 * @param {string} userId - The ID of the user to delete.
 */
export const deleteUser = async (userId) => {
  const accessToken = getAuthToken();
  if (!accessToken) throw new Error("Authentication token not found.");

  const response = await fetch(`${BASE_URL}/api/v1/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  // A 204 No Content response is a successful delete
  if (response.status === 204) {
    return;
  }

  // Handle 200 OK responses with a body
  if (response.ok) {
    const apiResponse = await response.json();
    if (!apiResponse.success) {
        throw new Error(apiResponse.message || "Failed to delete user");
    }
    return;
  }

  throw new Error(`Failed to delete user: ${response.status}`);
};