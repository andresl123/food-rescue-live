const BFF_BASE_URL = "http://localhost:8090";

// 1) upload file → preview
export async function previewLotExcel(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BFF_BASE_URL}/api/v1/import/lots-excel/preview`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Failed to get preview");
  }

  return res.json();
}


export async function commitLotExcel(previewJson) {
  const res = await fetch(`${BFF_BASE_URL}/api/v1/import/lots-excel/commit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(previewJson),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Failed to import");
  }

  return res.json(); // { lotsCreated, itemsCreated, warnings }
}
