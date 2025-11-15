const BFF_BASE_URL = `${import.meta.env.VITE_BFF_BASE_URL}/api`;

export const getRecentOrders = async () => {
  const response = await fetch(`${BFF_BASE_URL}/jobs/admin/recent-orders`, { // /v1/ removed
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: "include",
  });
  if (!response.ok) throw new Error(`Failed to fetch recent orders: ${response.status}`);
  return response.json();
};

export const getOrdersTodayCount = async () => {
  const response = await fetch(`${BFF_BASE_URL}/jobs/admin/orders-today-count`, { // /v1/ removed
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: "include",
  });
  if (!response.ok) throw new Error(`Failed to fetch orders count: ${response.status}`);
  return response.json();
};

export const getAdminOrderView = async () => {
  const response = await fetch(`${BFF_BASE_URL}/jobs/admin/order-view`, { // /v1/ removed
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: "include",
  });
  if (!response.ok) throw new Error(`Failed to fetch admin order view: ${response.status}`);
  return response.json();
};