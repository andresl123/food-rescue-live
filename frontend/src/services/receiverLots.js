// src/api/receiverLots.js

const BFF_BASE_URL = import.meta.env.VITE_BFF_BASE_URL;

export async function bffFetch(path, query = {}) {
  const url = new URL(`${BFF_BASE_URL}${path}`);

  // attach query params if provided
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const errorMessage = errorBody.message || response.statusText;
    throw new Error(`API Error ${response.status}: ${errorMessage}`);
  }

  return response.json();
}
