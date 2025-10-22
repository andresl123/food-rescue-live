// Use a relative URL for the proxy. This should match the key in your vite.config.js proxy setup.
const BASE_URL = "http://localhost:8080/api";

/**
 * Sends a request to the backend to generate and email a verification code.
 * @param {string} email The user's email address.
 * @returns {Promise<{success: boolean, message: string}>} An object indicating success or failure.
 */
export async function generateResetCode(email) {
  try {
    const response = await fetch(`${BASE_URL}/code/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Forward the error message from the backend
      throw new Error(data.message || "Failed to send verification code.");
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error("Generate Code Error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Sends the verification code and new password to the backend to reset the password.
 * @param {string} email The user's email.
 * @param {string} code The 6-digit verification code.
 * @param {string} newPassword The user's new password.
 * @returns {Promise<{success: boolean, message: string}>} An object indicating success or failure.
 */
export async function resetPassword(email, code, newPassword) {
  try {
    const url = `${BASE_URL}/password/reset/${email}/${code}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Forward the error message from the backend
      throw new Error(data.message || "Failed to reset password.");
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error("Reset Password Error:", error);
    return { success: false, message: error.message };
  }
}
