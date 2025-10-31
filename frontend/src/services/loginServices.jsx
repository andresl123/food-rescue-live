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

export async function addAddressToUser(userId, addressId, setAsDefault = false) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`http://localhost:8080/api/v1/users/${userId}/addresses`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ addressId, setAsDefault }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to update user addresses:", error);
    throw new Error("Failed to update user addresses");
  }

  return response.json();
}
