// src/services/feedback.js
const BFF_BASE = "http://localhost:8090";

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
  const res = await fetch(`${BFF_BASE}/api/feedback/order?orderId=${encodeURIComponent(orderId)}`, {
    method: "GET",
    credentials: "include",
  });
  if (res.status === 404) return null;
  const data = await res.json().catch(() => null);
  return data;
}

/* NEW — get existing courier feedback for this user+order+courier */
export async function getCourierFeedback(orderId, courierId) {
  if (!orderId || !courierId) return null;
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
