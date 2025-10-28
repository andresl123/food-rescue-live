export async function loginUser(credentials) {
  try {
    const response = await fetch("http://localhost:8080/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      return { success: false, message: "Invalid credentials" };
    }

    const data = await response.json();

    return { success: true, data: data.data };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Server error" };
  }
}