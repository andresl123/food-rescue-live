const BFF_BASE_URL = import.meta.env.VITE_BFF_BASE_URL ?? "http://localhost:8090/api";
const EVIDENCE_API_BASE = `${BFF_BASE_URL}/api/evidence`;
const JOBS_API_BASE = `${BFF_BASE_URL}/api/jobs`;

async function parseBooleanResponse(response) {
  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || response.statusText);
  }

  if (!text) {
    return false;
  }

  try {
    const parsed = JSON.parse(text);

    // 1) If backend ever returns plain boolean
    if (typeof parsed === "boolean") {
      return parsed;
    }

    // 2) If backend returns { verified: true }
    if (parsed && typeof parsed === "object" && typeof parsed.verified === "boolean") {
      return parsed.verified;
    }

    // 3) If backend returns { success: true, data: { verified: true, ... } }
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.data &&
      typeof parsed.data.verified === "boolean"
    ) {
      return parsed.data.verified;
    }

    throw new Error("Unexpected verification response");
  } catch (err) {
    throw new Error(text || "Invalid verification response");
  }
}


export async function verifyPodCode(jobId, verificationType, code) {
  const role = verificationType === "pickup" ? "pickup" : "delivery";
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
