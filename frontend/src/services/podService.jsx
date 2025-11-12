const BFF_BASE_URL = import.meta.env.VITE_BFF_BASE_URL ?? "http://localhost:8090/api";
const EVIDENCE_API_BASE = `${BFF_BASE_URL}/evidence`;
const JOBS_API_BASE = `${BFF_BASE_URL}/jobs`;

async function parseBooleanResponse(response) {
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || response.statusText);
  }
  if (text === "" || text === null) {
    return false;
  }
  try {
    const parsed = JSON.parse(text);
    return parsed === true;
  } catch (error) {
    throw new Error(text || "Invalid verification response");
  }
}

export async function verifyPodCode(jobId, verificationType, code) {
  const role = verificationType === "pickup" ? "donor" : "receiver";
  const url = `${EVIDENCE_API_BASE}/pods/verify/${encodeURIComponent(jobId)}/${role}?code=${encodeURIComponent(code)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  return parseBooleanResponse(response);
}

export async function updateJobStatus(jobId, verificationType) {
  let endpoint;
  if (verificationType === "pickup") {
    endpoint = `${JOBS_API_BASE}/${encodeURIComponent(jobId)}/pickup`;
  } else if (verificationType === "delivery") {
    endpoint = `${JOBS_API_BASE}/${encodeURIComponent(jobId)}/delivered`;
  } else {
    return;
  }

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `Failed to update job status (${verificationType})`);
  }

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(text || "Invalid job update response");
  }
}
