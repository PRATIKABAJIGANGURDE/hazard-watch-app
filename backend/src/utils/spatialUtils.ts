export class SpatialUtils {
  // Calculate distance between two points using Haversine formula
  static calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Check if a point is within a bounding box
  static isPointInBbox(
    longitude: number, 
    latitude: number, 
    bbox: { minLat: number; maxLat: number; minLon: number; maxLon: number }
  ): boolean {
    return longitude >= bbox.minLon && 
           longitude <= bbox.maxLon && 
           latitude >= bbox.minLat && 
           latitude <= bbox.maxLat;
  }

  // Validate coordinates
  static isValidCoordinate(longitude: number, latitude: number): boolean {
    return longitude >= -180 && longitude <= 180 && 
           latitude >= -90 && latitude <= 90;
  }

  // Create a bounding box around a point with given radius
  static createBbox(
    centerLon: number, 
    centerLat: number, 
    radiusKm: number
  ): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
    const kmPerDegree = 111; // Approximate km per degree
    const latDelta = radiusKm / kmPerDegree;
    const lonDelta = radiusKm / (kmPerDegree * Math.cos(this.toRadians(centerLat)));

    return {
      minLat: centerLat - latDelta,
      maxLat: centerLat + latDelta,
      minLon: centerLon - lonDelta,
      maxLon: centerLon + lonDelta
    };
  }

  // Format coordinates for display
  static formatCoordinates(longitude: number, latitude: number, precision = 4): string {
    const lat = latitude.toFixed(precision);
    const lon = longitude.toFixed(precision);
    const latDir = latitude >= 0 ? 'N' : 'S';
    const lonDir = longitude >= 0 ? 'E' : 'W';
    
    return `${Math.abs(parseFloat(lat))}°${latDir}, ${Math.abs(parseFloat(lon))}°${lonDir}`;
  }
}