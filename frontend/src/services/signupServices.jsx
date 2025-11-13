// src/services/userService.js

const BASE_URL = "http://localhost:8080/api/v1/users";
const BFF_BASE_URL = "http://localhost:8090";

export async function createUser(formData) {
  try {
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      categoryId: formData.categoryId,
      phoneNumber: formData.phoneNumber,
      defaultAddressId: formData.defaultAddressId,
    };

    console.log("Sending to backend:", payload);

    //const response = await fetch(BASE_URL, {
    const response = await fetch(`${BFF_BASE_URL}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      //credentials: "include",
    });

    // If the response is not OK, extract readable message
    if (!response.ok) {
      let errorMessage = `Signup failed (HTTP ${response.status})`;
      try {
        console.log(response);
        const text = await response.text();
        const maybeJson = JSON.parse(text);
        // If backend sent JSON with a 'message' field
        errorMessage = maybeJson.message || text;
      } catch {
        // If not JSON, use plain text
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Backend responded:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: error.message };
  }
}
