/**
 * Direction parsing and cone geometry utilities.
 *
 * Ported from LeafletMap.vue so the logic can be shared by any map renderer
 * (MapLibre, Leaflet, etc.) without duplicating code.
 */

// ---------------------------------------------------------------------------
// Cardinal direction lookup (16-point compass)
// ---------------------------------------------------------------------------

export const CARDINAL_DIRECTIONS: Record<string, number> = {
  N: 0,
  NNE: 22.5,
  NE: 45,
  ENE: 67.5,
  E: 90,
  ESE: 112.5,
  SE: 135,
  SSE: 157.5,
  S: 180,
  SSW: 202.5,
  SW: 225,
  WSW: 247.5,
  W: 270,
  WNW: 292.5,
  NW: 315,
  NNW: 337.5,
};

// ---------------------------------------------------------------------------
// Direction parsing helpers
// ---------------------------------------------------------------------------

/**
 * Convert a cardinal direction string (e.g. "NE", "SSW") to degrees.
 * Falls back to `parseFloat` if the string is not a recognised cardinal,
 * and returns `null` when the value cannot be interpreted at all.
 */
export function cardinalToDegrees(cardinal: string): number | null {
  const upperCardinal = cardinal.toUpperCase();
  if (upperCardinal in CARDINAL_DIRECTIONS) {
    return CARDINAL_DIRECTIONS[upperCardinal];
  }
  const parsed = parseFloat(cardinal);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Parse a single direction token — either a numeric string ("180") or a
 * cardinal direction ("SW").  Returns `null` when the value is not valid.
 */
export function parseDirectionSingle(value: string): number | null {
  // Try parsing as number first
  if (/^\d+(\.\d+)?$/.test(value)) {
    return parseFloat(value);
  }

  // Try cardinal direction
  return cardinalToDegrees(value);
}

/**
 * Calculate the midpoint angle between two bearings, taking the shortest arc
 * into account (handles the 0/360 wrap-around).
 */
export function calculateMidpointAngle(start: number, end: number): number {
  // Normalize angles to 0-360 range
  start = ((start % 360) + 360) % 360;
  end = ((end % 360) + 360) % 360;

  // Calculate the difference and handle wrap-around
  let diff = end - start;
  if (diff < 0) {
    diff += 360;
  }

  // If the difference is greater than 180, go the other way around
  if (diff > 180) {
    diff = diff - 360;
  }

  // Calculate midpoint
  let midpoint = start + diff / 2;

  // Normalize result to 0-360 range
  return ((midpoint % 360) + 360) % 360;
}

/**
 * Top-level direction parser.  Accepts:
 *   - A single numeric value ("90")
 *   - A single cardinal direction ("NE")
 *   - A range with a dash separator ("90-180", "NE-SE")
 *
 * Returns `null` when the value cannot be parsed.
 */
export function parseDirectionValue(value: string): number | null {
  if (!value) return null;

  // Check if it's a range (contains '-' but not at the start)
  if (value.includes('-') && value.indexOf('-') > 0) {
    const parts = value.split('-');
    if (parts.length === 2) {
      const start = parseDirectionSingle(parts[0].trim());
      const end = parseDirectionSingle(parts[1].trim());
      if (start !== null && end !== null) {
        return calculateMidpointAngle(start, end);
      }
    }
  }

  // Single value
  return parseDirectionSingle(value);
}

// ---------------------------------------------------------------------------
// Cone geometry
// ---------------------------------------------------------------------------

/**
 * Generate a GeoJSON Polygon Feature representing a camera's field-of-view
 * cone.  The cone is centred on `direction` (degrees, 0 = north, clockwise)
 * and fans out by `spreadDegrees` (total opening angle).
 *
 * The polygon is constructed by computing points on an arc at `lengthMeters`
 * distance from the origin, producing a smooth wedge shape suitable for
 * rendering as a fill / line layer on a web map.
 */
export function createDirectionCone(
  lon: number,
  lat: number,
  direction: number,
  lengthMeters: number = 120,
  spreadDegrees: number = 70,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const earthRadius = 6371000;
  const latRad = (lat * Math.PI) / 180;
  const lengthDeg = (lengthMeters / earthRadius) * (180 / Math.PI);

  const points: [number, number][] = [[lon, lat]];

  // Left edge of the cone
  const leftAngle = ((direction - spreadDegrees / 2) * Math.PI) / 180;
  points.push([
    lon + (lengthDeg * Math.sin(leftAngle)) / Math.cos(latRad),
    lat + lengthDeg * Math.cos(leftAngle),
  ]);

  // Intermediate arc points
  for (let i = 1; i < 8; i++) {
    const angle =
      ((direction - spreadDegrees / 2 + (spreadDegrees * i) / 8) * Math.PI) / 180;
    points.push([
      lon + (lengthDeg * Math.sin(angle)) / Math.cos(latRad),
      lat + lengthDeg * Math.cos(angle),
    ]);
  }

  // Right edge of the cone
  const rightAngle = ((direction + spreadDegrees / 2) * Math.PI) / 180;
  points.push([
    lon + (lengthDeg * Math.sin(rightAngle)) / Math.cos(latRad),
    lat + lengthDeg * Math.cos(rightAngle),
  ]);

  // Close the polygon back at the origin
  points.push([lon, lat]);

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [points] },
  };
}

/**
 * Build a FeatureCollection of direction cones from an input
 * FeatureCollection.  Each input feature that carries a `direction` or
 * `camera:direction` property (possibly semicolon-separated for multiple
 * headings) produces one or more cone polygon features.
 */
export function buildDirectionCones(
  geojsonData: GeoJSON.FeatureCollection,
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];

  for (const feature of geojsonData.features) {
    const props = feature.properties;
    const dirStr = props?.['camera:direction'] || props?.direction;
    if (!dirStr) continue;

    const coords = (feature.geometry as GeoJSON.Point).coordinates;
    const parts = String(dirStr).split(';');
    for (const part of parts) {
      const deg = parseDirectionValue(part.trim());
      if (deg !== null) {
        features.push(createDirectionCone(coords[0], coords[1], deg));
      }
    }
  }

  return { type: 'FeatureCollection', features };
}
