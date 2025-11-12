// src/api/receiverLots.js

const BFF_BASE_URL = import.meta.env.VITE_BFF_BASE_URL;

export async function bffFetch(path) {
  const url = `${BFF_BASE_URL}${path}`;

  const response = await fetch(url, {
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
