const normalizeBaseUrl = (base) => {
  if (!base) {
    return "";
  }
  return base.endsWith("/") ? base.slice(0, -1) : base;
};

const API_ROOT = normalizeBaseUrl(import.meta.env.VITE_BFF_BASE_URL ?? "http://localhost:8090");
const JOBS_API_BASE = `${API_ROOT}/api/jobs`;
const USERS_API_BASE = `${API_ROOT}/api/users`;
const ADDRESSES_API_BASE = `${API_ROOT}/api/addresses`;
const EVIDENCE_API_BASE = `${API_ROOT}/api/evidence`;

async function parseJson(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch (error) {
    throw new Error(text || response.statusText);
  }
}

export async function getAvailableJobs() {
  const response = await fetch(`${JOBS_API_BASE}/available`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to fetch available jobs (${response.status})`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : [];
}

export async function getCourierJobs(courierId) {
  const response = await fetch(`${JOBS_API_BASE}/courier/${courierId}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to fetch jobs for courier ${courierId}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : [];
}

export async function getCourierStats(courierId) {
  const response = await fetch(`${JOBS_API_BASE}/courier/${courierId}/stats`, {
    method: "GET",
    credentials: "include",
  });
  const payload = await parseJson(response);
  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Failed to fetch courier stats (${response.status})`
    );
  }
  return payload.data;
}

export async function assignCourierToJob(jobId, courierId) {
  const response = await fetch(`${JOBS_API_BASE}/${jobId}/assign-courier/${courierId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  const payload = await parseJson(response);
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || `Failed to assign courier (status ${response.status})`);
  }
  return payload.data;
}

export async function unassignCourierFromJob(jobId) {
  const response = await fetch(`${JOBS_API_BASE}/${jobId}/unassign-courier`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  const payload = await parseJson(response);
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || `Failed to unassign courier (status ${response.status})`);
  }
  return payload.data;
}

export async function generatePodOtps(jobId) {
  const response = await fetch(`${EVIDENCE_API_BASE}/pods/generate-otp?jobId=${encodeURIComponent(jobId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  const payload = await parseJson(response);
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || `Failed to generate OTPs (status ${response.status})`);
  }
  return payload.data;
}

export async function deletePodsForJob(jobId) {
  const response = await fetch(`${EVIDENCE_API_BASE}/pods/job/${encodeURIComponent(jobId)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  const payload = await parseJson(response);
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || `Failed to delete POD records (status ${response.status})`);
  }
  return payload.data;
}

export async function getOrderDetails(orderId) {
  const response = await fetch(`${JOBS_API_BASE}/orders/details/${orderId}`, {
    method: "GET",
    credentials: "include",
  });
  const payload = await parseJson(response);
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || `Failed to fetch order ${orderId}`);
  }
  return payload.data;
}

export async function markOrderDelivered(orderId) {
  const response = await fetch(`${API_ROOT}/api/orders/${orderId}/delivered`, {
    method: "PUT",
    credentials: "include",
  });
  const payload = await parseJson(response);
  if (!response.ok) {
    throw new Error(
      payload?.message || `Failed to mark order delivered (${response.status})`
    );
  }
  if (!payload) {
    return null;
  }
  if (payload.success === false) {
    throw new Error(payload?.message || "Failed to mark order delivered");
  }
  return payload.data ?? payload;
}

export async function getAddress(addressId) {
  const response = await fetch(`${ADDRESSES_API_BASE}/${addressId}`, {
    method: "GET",
    credentials: "include",
  });
  const payload = await parseJson(response);
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || `Failed to fetch address ${addressId}`);
  }
  return payload.data;
}

export async function getUserName(userId) {
  const response = await fetch(`${USERS_API_BASE}/${userId}`, {
    method: "GET",
    credentials: "include",
  });
  const payload = await parseJson(response);
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || `Failed to fetch user ${userId}`);
  }
  return payload.data?.name ?? null;
}

export async function updateLotStatus(lotId, status) {
  const url = `${API_ROOT}/api/lots/${encodeURIComponent(
    lotId
  )}/status/ForCourier?status=${encodeURIComponent(status)}`;
  const response = await fetch(url, {
    method: "PATCH",
    credentials: "include",
  });
  const payload = await parseJson(response);
  if (!response.ok) {
    throw new Error(
      payload?.message || `Failed to update lot status (${response.status})`
    );
  }
  if (!payload) {
    return null;
  }
  if (payload.success === false) {
    throw new Error(
      payload?.message || `Failed to update lot status (${response.status})`
    );
  }
  return payload.data ?? payload;
}

export async function getLot(lotId) {
  const response = await fetch(`${API_ROOT}/api/lots/${lotId}`, {
    method: "GET",
    credentials: "include",
  });
  const payload = await parseJson(response);
  if (!response.ok) {
    throw new Error(
      payload?.message || `Failed to fetch lot ${lotId}`
    );
  }
  if (payload?.success === false) {
    throw new Error(payload?.message || `Failed to fetch lot ${lotId}`);
  }
  return payload?.data ?? payload;
}
