// src/services/feedback.js
const BFF_BASE = import.meta.env.VITE_BFF_BASE_URL;

// POST/UPSERT — already had this
export async function submitOrderFeedback({ orderId, lotId, rating, feedbackText }) {
  const res = await fetch(`${BFF_BASE}/api/feedback/order`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId, lotId, rating, feedbackText }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || res.statusText;
    throw new Error(msg);
  }
  return data;
}

export async function submitCourierFeedback({ courierId, orderId, rating, feedbackText }) {
  const res = await fetch(
    `${BFF_BASE}/api/feedback/courier`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courierId, orderId, rating, feedbackText }),
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || res.statusText;
    throw new Error(msg);
  }
  return data;
}

/* NEW — get existing order feedback for this user+order */
export async function getOrderFeedback(orderId) {
  if (!orderId) return null;

  try {
    const res = await fetch(
      `${BFF_BASE}/api/feedback/order?orderId=${encodeURIComponent(orderId)}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    // no feedback yet → not an error
    if (res.status === 404) {
      return null;
    }

    // other non-OK → treat as error
    if (!res.ok) {
      throw new Error(`Failed to load order feedback (${res.status})`);
    }

    const data = await res.json().catch(() => null);
    return data;
  } catch (err) {
    // swallow so UI doesn't explode
    console.warn("getOrderFeedback failed:", err);
    return null;
  }
}

/* NEW — get existing courier feedback for this user+order+courier */
export async function getCourierFeedback(orderId, courierId) {
  if (!orderId || !courierId || courierId == "To be assigned") return null;
  const url = `${BFF_BASE}/api/feedback/courier?orderId=${encodeURIComponent(
    orderId
  )}&courierId=${encodeURIComponent(courierId)}`;
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  if (res.status === 404) return null;
  const data = await res.json().catch(() => null);
  return data;
}
