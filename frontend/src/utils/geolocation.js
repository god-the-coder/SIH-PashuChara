/**
 * Reverse-geocodes device coordinates into a short "City, State" label using
 * OpenStreetMap's free Nominatim API (no key required, low-volume use).
 */
export async function reverseGeocode(latitude, longitude) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Reverse geocoding failed");
  const data = await response.json();
  const address = data.address || {};
  const city = address.city || address.town || address.village || address.county || "";
  const state = address.state || "";
  if (city && state) return `${city}, ${state}`;
  return city || state || data.display_name || null;
}

/**
 * Gets the device's current coordinates via the browser Geolocation API.
 * Rejects if unsupported, permission is denied, or the request fails/times out.
 */
export function getCurrentCoords(options = { timeout: 10000, maximumAge: 600000 }) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      (error) => reject(error),
      options,
    );
  });
}

/** Convenience: device coords -> "City, State" label, in one call. */
export async function detectCurrentLocationLabel() {
  const { latitude, longitude } = await getCurrentCoords();
  return reverseGeocode(latitude, longitude);
}
