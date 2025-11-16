const BFF_BASE_URL = `${import.meta.env.VITE_BFF_BASE_URL}/api`;

export async function getPickupOtpDonor(lotId) {
  const url = `${BFF_BASE_URL}/donor/otp/pickup/${lotId}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include", // required for cookies
  });

  if (!res.ok) {
    throw new Error("Failed to fetch OTP");
  }

  return await res.json(); // { otp, lotId, expiresAt }
}