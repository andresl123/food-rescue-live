// Use a relative URL for the proxy. This should match the key in your vite.config.js proxy setup.
const BFF_BASE_URL = `${import.meta.env.VITE_BFF_BASE_URL}/api`;

export async function generateResetCode(email, purpose = "FORGOT_PASSWORD") {
  try {
    //const response = await fetch(`${BASE_URL}/code/generate`, {
    const response = await fetch(`${BFF_BASE_URL}/code/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email, purpose: purpose }),
      //credentials: "include"
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

export async function resetPassword(email, code, newPassword) {
  try {
    //const url = `${BASE_URL}/password/reset/${email}/${code}`;
    const url = `${BFF_BASE_URL}/password/reset/${email}/${code}`;

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

    export async function validateEmailCode(email, code) {
      try {
        const response = await fetch(`${BFF_BASE_URL}/code/validate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: email, code }),
          credentials: "include"
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Invalid or expired verification code.");
        }

        return { success: true, message: data.message };
      } catch (error) {
        console.error("Validate Email Code Error:", error);
        return { success: false, message: error.message };
      }
    }

export async function updateUserEmail(userId, newEmail) {
  try {
    const response = await fetch(`${BFF_BASE_URL}/users/${userId}/update-email`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail }),
      credentials: "include"
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update email.");
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error("Update Email Error:", error);
    return { success: false, message: error.message };
  }
}

export async function updateUserPhone(userId, newPhone) {
  try {
    const response = await fetch(`${BFF_BASE_URL}/users/${userId}/update-phone`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: newPhone }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update phone number.");
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error("Update Phone Error:", error);
    return { success: false, message: error.message };
  }
}
