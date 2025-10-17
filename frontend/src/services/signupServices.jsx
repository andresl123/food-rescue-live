// src/services/userService.js

const BASE_URL = "http://localhost:8080/api/v1/users";

export async function createUser(formData) {
  try {
    // Construct the payload to exactly match backend format
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      categoryId: formData.categoryId,
      phoneNumber: formData.phoneNumber,
      defaultAddressId: formData.defaultAddressId,
      roles: ["USER"], // static field
    };

    console.log("➡️ Sending to backend:", payload);

    // Actual backend POST request
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Backend responded:", data);

    return { success: true, data };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: error.message };
  }
}
