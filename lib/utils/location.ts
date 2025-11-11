/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string (e.g., "2.5 km" or "500 m")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Check if a location is within a provider's service radius
 * @param providerLat Provider latitude
 * @param providerLon Provider longitude
 * @param providerRadius Service radius in meters
 * @param customerLat Customer latitude
 * @param customerLon Customer longitude
 * @returns True if customer is within service area
 */
export function isWithinServiceArea(
  providerLat: number,
  providerLon: number,
  providerRadius: number,
  customerLat: number,
  customerLon: number
): boolean {
  const distance = calculateDistance(
    providerLat,
    providerLon,
    customerLat,
    customerLon
  );
  return distance <= providerRadius;
}

/**
 * Sort providers by distance from a location
 * @param providers Array of providers with latitude/longitude
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @returns Providers sorted by distance (closest first) with distance property added
 */
export function sortProvidersByDistance<T extends { latitude?: number; longitude?: number }>(
  providers: T[],
  userLat: number,
  userLon: number
): (T & { distance?: number })[] {
  return providers
    .map((provider) => {
      if (provider.latitude && provider.longitude) {
        const distance = calculateDistance(
          userLat,
          userLon,
          provider.latitude,
          provider.longitude
        );
        return { ...provider, distance };
      }
      return { ...provider, distance: Infinity };
    })
    .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
}

/**
 * Filter providers within a certain radius
 * @param providers Array of providers with latitude/longitude
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @param radiusMeters Radius in meters to filter within
 * @returns Providers within the specified radius
 */
export function filterProvidersWithinRadius<T extends { latitude?: number; longitude?: number; serviceRadius?: number }>(
  providers: T[],
  userLat: number,
  userLon: number,
  radiusMeters?: number
): T[] {
  return providers.filter((provider) => {
    if (!provider.latitude || !provider.longitude) {
      return false;
    }

    // If radiusMeters is provided, use that, otherwise use provider's service radius
    const maxDistance = radiusMeters || provider.serviceRadius || 10000; // Default to 10km

    return isWithinServiceArea(
      provider.latitude,
      provider.longitude,
      maxDistance,
      userLat,
      userLon
    );
  });
}

/**
 * Get the center point between multiple coordinates
 * Useful for centering a map on multiple providers
 */
export function getCenterPoint(
  coordinates: { latitude: number; longitude: number }[]
): { latitude: number; longitude: number } {
  if (coordinates.length === 0) {
    return { latitude: 0, longitude: 0 };
  }

  const sum = coordinates.reduce(
    (acc, coord) => ({
      latitude: acc.latitude + coord.latitude,
      longitude: acc.longitude + coord.longitude,
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: sum.latitude / coordinates.length,
    longitude: sum.longitude / coordinates.length,
  };
}
