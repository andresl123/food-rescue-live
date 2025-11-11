const BFF_BASE_URL = import.meta.env.VITE_BFF_BASE_URL;

/**
 * Fetches all users (Admin only).
 */
export const getAllUsers = async () => {
  const response = await fetch(`${BFF_BASE_URL}/api/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include",
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

  const response = await fetch(`${BFF_BASE_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
    credentials: "include",
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

  const response = await fetch(`${BFF_BASE_URL}/api/users/${userId}`, {
    method: 'DELETE',
    headers: {
    },
    credentials: "include",
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