# DeFlock: Leaflet → MapLibre Migration Reference

This document provides all the context needed to **replace** Leaflet with MapLibre GL JS in the DeFlock webapp, including a new GeoJSON data pipeline. **All Leaflet code will be removed** — git history serves as the rollback path.

---

## Key Decisions

- **Dead code removal**: Delete `LeafletMap.vue`, `tiles.ts`, and all leaflet dependencies. No parallel systems.
- **GeoJSON filename**: `all_alpr.geojson` (S3 key and local dev fixture)
- **GZip at upload**: Lambda gzips the JSON before uploading to S3 with `Content-Encoding: gzip`. Smaller storage, Cloudflare passes through as-is.
- **Loading UX**: Linear progress bar on map while GeoJSON is loading
- **CDN URL hardcoded**: `https://cdn.deflock.me/all_alpr.geojson` — no env vars. For local dev, just drop the fixture into `webapp/public/` and it auto-serves.
- **Local dev**: Copy `migration/all_deflock_cameras.geojson` → `webapp/public/all_alpr.geojson`, then `npm run dev` serves it at `localhost:5173/all_alpr.geojson`
- **This folder**: `migration/` is gitignored — never pushed to public repo

---

## Project Overview

- **Framework**: Vue 3 + TypeScript + Vite + Vuetify 3 + Pinia
- **Current map lib**: Leaflet 1.9.4 + leaflet.markercluster 1.5.3 (to be removed)
- **Package manager**: npm
- **Entry point**: `webapp/` directory

---

## Architecture

```
OLD (to be removed):
  webapp/src/stores/tiles.ts    → fetches tiles by viewport
  webapp/src/components/LeafletMap.vue → renders with Leaflet

NEW (replacing old):
  serverless/alpr_geojson/      → Lambda → S3: cdn.deflock.me/all_alpr.geojson
  webapp/src/stores/geojson.ts  → fetches single GeoJSON file
  webapp/src/components/MapLibreMap.vue → renders with MapLibre

KEPT (no changes):
  serverless/alpr_cache/        → Lambda → S3: cdn.deflock.me/regions/*.json (still used independently)
```

---

## Part 1: New Server-Side Pipeline

### New Lambda: `alpr_geojson`

**Create at**: `serverless/alpr_geojson/` (mirror the structure of `serverless/alpr_cache/`)

**What it does**: Queries the same Overpass API, builds a single GeoJSON `FeatureCollection`, uploads to S3.

**S3 output key**: `all_alpr.geojson` (in bucket `cdn.deflock.me`)
**Live URL**: `https://cdn.deflock.me/all_alpr.geojson`

#### Existing Lambda to reference (DO NOT MODIFY): `serverless/alpr_cache/src/alpr_cache.py`

The new script should reuse the same Overpass query and tag whitelist, but output GeoJSON instead of tiled JSON.

#### Overpass API query (same as existing)

```
[out:json];
node["man_made"="surveillance"]["surveillance:type"="ALPR"];
out body;
```

**URL**: `http://overpass-api.de/api/interpreter`
**User-Agent**: `DeFlock/1.0`

#### Whitelisted tags (same as existing)

```python
WHITELISTED_TAGS = [
    "operator",
    "manufacturer",
    "direction",
    "brand",
    "camera:direction",
    "surveillance:brand",
    "surveillance:operator",
    "surveillance:manufacturer",
    "wikimedia_commons"
]
```

#### Output format: GeoJSON FeatureCollection

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-74.006, 40.7128]
      },
      "properties": {
        "id": 12345678,
        "operator": "New York Police Department",
        "manufacturer": "Flock Safety",
        "direction": "180",
        "camera:direction": "225",
        "brand": "Flock",
        "surveillance:brand": "Flock Safety",
        "surveillance:operator": "NYPD",
        "surveillance:manufacturer": "Flock Safety",
        "wikimedia_commons": "File:Example.jpg"
      }
    }
  ]
}
```

Key differences from the existing tiled format:
- Coordinates are `[lon, lat]` (GeoJSON spec), NOT `[lat, lon]`
- Tags are flattened into `properties` (not nested under a `tags` key)
- `id` is in `properties`, not at the top level
- No `type` field needed (the GeoJSON `Feature` type handles this)

#### New Lambda script logic

```python
import gzip

def lambda_handler(event, context):
    nodes = get_all_nodes()  # same Overpass query as alpr_cache

    features = []
    for node in nodes:
        properties = {"id": node["id"]}
        properties.update({
            k: v for k, v in node["tags"].items()
            if k in WHITELISTED_TAGS
        })
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [node["lon"], node["lat"]]  # GeoJSON = [lon, lat]
            },
            "properties": properties
        })

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    body = gzip.compress(json.dumps(geojson).encode("utf-8"))

    s3 = boto3.client("s3")
    s3.put_object(
        Bucket=os.getenv("OUTPUT_BUCKET", "cdn.deflock.me"),
        Key="all_alpr.geojson",
        Body=body,
        ContentType="application/geo+json",
        ContentEncoding="gzip",
    )
```

#### Local testing (no AWS needed)

The actual Lambda script includes an `if __name__ == "__main__"` block that writes to a local file instead of S3:

```python
# at the bottom of alpr_geojson.py
if __name__ == "__main__":
    geojson = build_geojson()  # same logic as lambda_handler
    with open("all_alpr.geojson", "w") as f:
        json.dump(geojson, f)
    print(f"Wrote {len(geojson['features'])} features")
```

Then copy the output to `webapp/public/all_alpr.geojson` for local dev.

#### Expected file size

- ~88,000 features → ~15.6 MB uncompressed
- **GZipped at upload** → ~1.6 MB stored in S3, ~1.6 MB over the wire
- `Content-Encoding: gzip` header tells browsers to decompress automatically
- Cloudflare passes through the pre-compressed response as-is
- Single HTTP request, loads in 1–2 seconds

### New Terraform module

**Create at**: `terraform/modules/alpr_geojson/` (copy structure from `terraform/modules/alpr_cache/`)

Key config to match existing pattern:
- Same IAM role pattern (Lambda + S3 write)
- Same ECR repository pattern
- Same CloudWatch scheduled trigger (hourly: `rate(60 minutes)`)
- Same SNS error alarm
- Same bucket: `cdn.deflock.me` (passed as `var.deflock_cdn_bucket`)
- Same timeout/memory: 180s / 512MB / arm64

**Wire into root**: Add module block to `terraform/main.tf`:
```hcl
module "alpr_geojson" {
  source             = "./modules/alpr_geojson"
  deflock_cdn_bucket = var.deflock_cdn_bucket
  sns_alarm_topic    = aws_sns_topic.lambda_alarms.arn
  # ... same pattern as alpr_cache module
}
```

Reference: `terraform/modules/alpr_cache/main.tf`

---

## Part 2: Client-Side Changes

### Files to CREATE

| File | Purpose |
|---|---|
| `webapp/src/components/MapLibreMap.vue` | MapLibre GL JS map component — replaces LeafletMap.vue |
| `webapp/src/stores/geojson.ts` | Pinia store — fetches `all_alpr.geojson` once, exposes reactive data + loading progress |

### Files to MODIFY

| File | What Changes |
|---|---|
| `webapp/src/views/Map.vue` | Swap `<leaflet-map>` for `<maplibre-map>`, remove Leaflet imports, use geojson store, add loading bar |
| `webapp/package.json` | Remove leaflet deps, add `maplibre-gl` |
| `terraform/main.tf` | Add `alpr_geojson` module reference |

### Files to DELETE (dead code removal)

| File | Why |
|---|---|
| `webapp/src/components/LeafletMap.vue` | Replaced by MapLibreMap.vue |
| `webapp/src/stores/tiles.ts` | Replaced by geojson.ts |

### Files to Keep As-Is (NO CHANGES)

| File | Why |
|---|---|
| `webapp/src/components/DFMapPopup.vue` | No Leaflet deps — reuse directly in MapLibre popups |
| `webapp/src/services/apiService.ts` | Geocoding still needed. `BoundingBox` class may become unused — check and clean up if so |
| `webapp/src/stores/global.ts` | Browser geolocation — no map dependency |
| `webapp/src/stores/vendorStore.ts` | CMS vendor images — no map dependency |
| `webapp/src/types.ts` | TypeScript interfaces — check if `AlprNode` type needs updating for GeoJSON property shape |
| `serverless/alpr_cache/` | Old pipeline — keep running (serves existing tile consumers) |
| `terraform/modules/alpr_cache/` | Old infra — keep running |
| `api/` | Fastify server — no changes |

---

## Part 3: Dependencies

### Remove from `webapp/package.json`

```json
"leaflet": "^1.9.4",                          // devDependencies
"@types/leaflet": "^1.9.15",                  // devDependencies
"leaflet.markercluster": "^1.5.3",            // dependencies
"@types/leaflet.markercluster": "^1.5.5"      // dependencies
```

### Add to `webapp/package.json`

```json
"maplibre-gl": "^4.x"                         // dependencies
```

No clustering library needed — MapLibre has built-in GeoJSON source clustering.

---

## Part 4: New GeoJSON Store (with loading progress)

**Create at**: `webapp/src/stores/geojson.ts`

This replaces `tiles.ts`. Much simpler — one fetch, no viewport math. Includes loading progress for the progress bar.

### Conceptual API

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

const GEOJSON_URL = 'https://cdn.deflock.me/all_alpr.geojson';

export const useGeojsonStore = defineStore('geojson', () => {
  const data = ref<GeoJSON.FeatureCollection | null>(null);
  const loading = ref(false);
  const progress = ref(0);       // 0–100 for progress bar
  const error = ref<string | null>(null);

  async function load() {
    if (data.value || loading.value) return;
    loading.value = true;
    progress.value = 0;
    try {
      const response = await fetch(GEOJSON_URL);
      const reader = response.body?.getReader();
      const contentLength = +(response.headers.get('Content-Length') ?? 0);

      if (reader && contentLength) {
        // Stream with progress tracking
        let received = 0;
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          progress.value = Math.round((received / contentLength) * 100);
        }
        const text = new TextDecoder().decode(
          new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0))
        );
        // ... concatenate and parse
        data.value = JSON.parse(text);
      } else {
        // Fallback: no streaming progress
        data.value = await response.json();
      }
      progress.value = 100;
    } catch (e) {
      error.value = 'Failed to load camera data';
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, progress, error, load };
});
```

The MapLibre component calls `load()` on mount, then passes `data` directly to `map.addSource()`.

---

## Part 5: New MapLibreMap Component Spec

**Create at**: `webapp/src/components/MapLibreMap.vue`

### Loading Bar

Display a Vuetify `v-progress-linear` at the top of the map container while `loading` is true:

```html
<v-progress-linear
  v-if="loading"
  :model-value="progress"
  color="rgb(63,84,243)"
  height="4"
  style="position: absolute; top: 0; z-index: 1001;"
/>
```

Props `loading` and `progress` come from the geojson store (passed through or injected).

### Props

```typescript
{
  center: { lat: number, lng: number },    // synced map center
  zoom: number,                             // synced zoom level
  geojsonData: GeoJSON.FeatureCollection | null,  // the full ALPR dataset
  loading: boolean,                         // show loading bar
  progress: number,                         // loading progress 0-100
  searchGeojson: GeoJSON.GeoJsonObject | null,     // city boundary overlay from search
  currentLocation: [number, number] | null          // user GPS dot
}
```

### Emits

```typescript
emit('update:center', { lat, lng })
emit('update:zoom', zoomLevel)
```

Note: `update:bounds` is no longer needed — no viewport-based tile fetching.

### Slots (same as LeafletMap)

```html
<slot name="topleft">     <!-- Search bar -->
<slot name="bottomright">  <!-- Action buttons -->
```

### Map Style (OSM raster tiles)

```javascript
{
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
}
```

### ALPR Data Source (MapLibre native clustering)

```javascript
map.addSource('alprs', {
  type: 'geojson',
  data: geojsonData,     // the FeatureCollection from the store
  cluster: true,
  clusterMaxZoom: 15,    // disable clustering at zoom 16+
  clusterRadius: 60
});
```

### Layers

```javascript
// 1. Cluster circles
map.addLayer({
  id: 'clusters',
  type: 'circle',
  source: 'alprs',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': 'rgb(63,84,243)',
    'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 50, 25, 200, 30],
    'circle-opacity': 0.6
  }
});

// 2. Cluster count labels
map.addLayer({
  id: 'cluster-count',
  type: 'symbol',
  source: 'alprs',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-size': 12
  },
  paint: { 'text-color': '#ffffff' }
});

// 3. Individual markers (unclustered) — circle markers for cameras without direction
map.addLayer({
  id: 'unclustered-point',
  type: 'circle',
  source: 'alprs',
  filter: ['all',
    ['!', ['has', 'point_count']],
    ['!', ['has', 'direction']],
    ['!', ['has', 'camera:direction']]
  ],
  paint: {
    'circle-color': 'rgb(63,84,243)',
    'circle-radius': 8,
    'circle-opacity': 0.6,
    'circle-stroke-width': 3,
    'circle-stroke-color': 'rgb(63,84,243)'
  }
});
```

For directional markers (cameras with `direction` or `camera:direction`), use one of:
- **HTML Markers** via `maplibregl.Marker({ element })` — reuse the existing SVG generation logic from LeafletMap.vue
- **Symbol layer** with pre-rendered rotated icons via `map.addImage()` — better performance

### Search GeoJSON Source Management

When search returns a city boundary:
```javascript
// On search result
if (map.getSource('search-boundary')) {
  map.getSource('search-boundary').setData(searchGeojson);
} else {
  map.addSource('search-boundary', { type: 'geojson', data: searchGeojson });
  map.addLayer({
    id: 'search-boundary-fill', type: 'fill', source: 'search-boundary',
    paint: { 'fill-color': '#3388ff', 'fill-opacity': 0.2 }
  });
  map.addLayer({
    id: 'search-boundary-line', type: 'line', source: 'search-boundary',
    paint: { 'line-color': '#3388ff', 'line-width': 2 }
  });
}

// On clear search
if (map.getSource('search-boundary')) {
  map.removeLayer('search-boundary-fill');
  map.removeLayer('search-boundary-line');
  map.removeSource('search-boundary');
}
```

### Clustering toggle

The user toggle (zoom 12–15) can be implemented by swapping the source between clustered and unclustered configs:

```javascript
function toggleClustering(enabled: boolean) {
  const source = map.getSource('alprs');
  // Remove and re-add source with updated cluster setting
  // MapLibre doesn't support changing cluster on the fly,
  // so remove layers → remove source → re-add source → re-add layers
}
```

At zoom < 12, force clustering on regardless of toggle state (same as current behavior).

---

## Part 6: Map.vue Changes

**File**: `webapp/src/views/Map.vue`

### Before (current)

```typescript
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
globalThis.L = L;
import LeafletMap from '@/components/LeafletMap.vue';
import { useTilesStore } from '@/stores/tiles';

const tilesStore = useTilesStore();
const { fetchVisibleTiles } = tilesStore;
const alprs = computed(() => tilesStore.allNodes);

function updateBounds(newBounds: any) {
  const bb = new BoundingBox({ ... });
  fetchVisibleTiles(bb);
}
```

### After (new)

```typescript
import 'maplibre-gl/dist/maplibre-gl.css';
import MapLibreMap from '@/components/MapLibreMap.vue';
import { useGeojsonStore } from '@/stores/geojson';

const geojsonStore = useGeojsonStore();
const geojsonData = computed(() => geojsonStore.data);
const geojsonLoading = computed(() => geojsonStore.loading);
const geojsonProgress = computed(() => geojsonStore.progress);

onMounted(() => {
  geojsonStore.load();  // one fetch, done
});

// No more updateBounds / fetchVisibleTiles
// No more BoundingBox construction on pan
```

### GeoJSON bounds calculation (search zoom-to-fit)

**Before** (Leaflet-dependent):
```typescript
const geoJsonLayer = L.geoJSON(result.geojson);
const bounds = geoJsonLayer.getBounds();
```

**After** (expose `fitBounds` from the child component):
```typescript
// Option A: emit event to child component
mapRef.value.fitGeoJSON(result.geojson);

// Option B: compute bbox manually
function getBBox(geojson) {
  let [minLng, minLat, maxLng, maxLat] = [Infinity, Infinity, -Infinity, -Infinity];
  // walk coordinates...
  return [[minLng, minLat], [maxLng, maxLat]];
}
```

### Template

```html
<!-- Before -->
<leaflet-map v-model:center="center" v-model:zoom="zoom"
  :alprs :geojson :current-location="currentLocation"
  @update:bounds="updateBounds">

<!-- After -->
<maplibre-map v-model:center="center" v-model:zoom="zoom"
  :geojson-data="geojsonData"
  :loading="geojsonLoading"
  :progress="geojsonProgress"
  :search-geojson="geojson"
  :current-location="currentLocation">
```

---

## Part 7: Popup Behavior (reuse DFMapPopup.vue)

`DFMapPopup.vue` has zero Leaflet dependencies. Mount it into MapLibre popups the same way:

```typescript
map.on('click', 'unclustered-point', (e) => {
  const props = e.features[0].properties;
  const coords = e.features[0].geometry.coordinates;

  const popupContent = document.createElement('div');
  createApp({
    render() {
      return h(DFMapPopup, {
        alpr: {
          id: props.id,
          lat: coords[1],
          lon: coords[0],
          tags: props,  // tags are flattened into properties
          type: 'node'
        }
      });
    }
  }).use(createVuetify({ theme: { defaultTheme: currentTheme } }))
    .mount(popupContent);

  new maplibregl.Popup()
    .setLngLat(coords)
    .setDOMContent(popupContent)
    .addTo(map);
});
```

**Important**: Since tags are flattened into GeoJSON `properties`, the popup component receives them directly. The `DFMapPopup.vue` component accesses `alpr.tags.manufacturer`, `alpr.tags.operator`, etc. — so when constructing the `alpr` prop, the `tags` object should contain the same keys. Since the GeoJSON properties already have these keys at the top level alongside `id`, just pass the properties object as `tags`.

---

## Part 8: Marker & Cone Rendering Spec

### Approach: Geographic polygon cones (from FlockHopper)

Instead of DeFlock's old SVG-overlay approach, use **native MapLibre fill/line layers** with geographic polygon cones. This is GPU-rendered, geographically accurate (cones scale with zoom), and much more performant. No HTML markers or DOM elements needed.

Reference implementation: `FlockHopper/src/components/map/MapLibreContainer.tsx` (Cloudflare repo)

### Direction Cone Generation

**Create at**: `webapp/src/utils/directionCones.ts`

Generate a GeoJSON polygon cone from a camera's position and direction:

```typescript
function createDirectionCone(
  lon: number,
  lat: number,
  direction: number,
  lengthMeters: number = 200,    // cone reach in meters
  spreadDegrees: number = 90     // cone FOV width
): GeoJSON.Feature<GeoJSON.Polygon> {
  const earthRadius = 6371000;
  const latRad = (lat * Math.PI) / 180;
  const lengthDeg = (lengthMeters / earthRadius) * (180 / Math.PI);

  const points: [number, number][] = [[lon, lat]]; // start at camera

  // Left edge
  const leftAngle = ((direction - spreadDegrees / 2) * Math.PI) / 180;
  points.push([
    lon + lengthDeg * Math.sin(leftAngle) / Math.cos(latRad),
    lat + lengthDeg * Math.cos(leftAngle)
  ]);

  // Arc across the front (8 steps for smooth curve)
  for (let i = 1; i < 8; i++) {
    const angle = ((direction - spreadDegrees / 2 + (spreadDegrees * i) / 8) * Math.PI) / 180;
    points.push([
      lon + lengthDeg * Math.sin(angle) / Math.cos(latRad),
      lat + lengthDeg * Math.cos(angle)
    ]);
  }

  // Right edge + close
  const rightAngle = ((direction + spreadDegrees / 2) * Math.PI) / 180;
  points.push([
    lon + lengthDeg * Math.sin(rightAngle) / Math.cos(latRad),
    lat + lengthDeg * Math.cos(rightAngle)
  ]);
  points.push([lon, lat]); // close polygon

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [points] }
  };
}
```

Also extract from LeafletMap.vue into this file:
- `parseDirectionValue(value)` → parses direction strings
- `parseDirectionSingle(value)` → handles numeric + cardinal
- `calculateMidpointAngle(start, end)` → handles range directions
- `cardinalToDegrees(cardinal)` → 16-point compass lookup
- `CARDINAL_DIRECTIONS` constant

For multiple directions (semicolon-separated `"0;180"`), generate one cone per direction.

### Direction Cone Layers (DeFlock blue, adapted from FlockHopper red)

```javascript
// Separate GeoJSON source for cones
map.addSource('direction-cones', {
  type: 'geojson',
  data: directionConesFeatureCollection  // built from cameras with direction data
});

// Cone fill
map.addLayer({
  id: 'direction-cones',
  type: 'fill',
  source: 'direction-cones',
  minzoom: 12,  // only show when zoomed past cluster level
  paint: {
    'fill-color': 'rgb(63,84,243)',   // DeFlock blue (FlockHopper uses #ef4444)
    'fill-opacity': 0.35
  }
});

// Cone outline
map.addLayer({
  id: 'direction-cones-outline',
  type: 'line',
  source: 'direction-cones',
  minzoom: 12,
  paint: {
    'line-color': 'rgb(50,67,194)',   // darker DeFlock blue (FlockHopper uses #dc2626)
    'line-width': 2,
    'line-opacity': 0.7
  }
});
```

### Camera Point Layers (DeFlock blue, adapted from FlockHopper red)

```javascript
// Cluster circles
const clusterLayer = {
  id: 'clusters',
  type: 'circle',
  source: 'alprs',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step', ['get', 'point_count'],
      'rgb(63,84,243)',     // base blue (FlockHopper: #ef4444)
      5,  'rgb(55,73,210)', // 5+ darker
      20, 'rgb(45,60,180)', // 20+ darker
      50, 'rgb(35,48,150)', // 50+ darkest
    ],
    'circle-radius': [
      'step', ['get', 'point_count'],
      14,     // base
      5, 16,  // 5+
      20, 20, // 20+
      50, 26, // 50+
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': 'rgba(63,84,243,0.5)',  // (FlockHopper: #fca5a5)
    'circle-stroke-opacity': 0.5
  }
};

// Cluster count labels
const clusterCountLayer = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'alprs',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-size': 13
  },
  paint: { 'text-color': '#ffffff' }
};

// Unclustered camera points (all cameras, with or without direction)
const unclusteredPointLayer = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'alprs',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': 'rgb(63,84,243)',          // DeFlock blue (FlockHopper: #dc2626)
    'circle-radius': 6,
    'circle-stroke-width': 2,
    'circle-stroke-color': 'rgba(63,84,243,0.5)',  // (FlockHopper: #fca5a5)
    'circle-opacity': 1
  }
};

// NO glow layer (FlockHopper has unclustered-glow — skipped per request)
```

### Building the Cones FeatureCollection

In `MapLibreMap.vue`, compute cones from cameras that have direction data:

```typescript
const directionConesData = computed((): GeoJSON.FeatureCollection => {
  if (!geojsonData) return { type: 'FeatureCollection', features: [] };

  const features: GeoJSON.Feature[] = [];
  for (const feature of geojsonData.features) {
    const props = feature.properties;
    const dirStr = props?.['camera:direction'] || props?.direction;
    if (!dirStr) continue;

    const coords = feature.geometry.coordinates;
    const directions = String(dirStr).split(';').map(v => parseDirectionValue(v.trim()));

    for (const deg of directions) {
      features.push(createDirectionCone(coords[0], coords[1], deg));
    }
  }

  return { type: 'FeatureCollection', features };
});
```

### Key Differences from Old DeFlock SVG Approach

| Old (Leaflet SVG) | New (MapLibre polygon) |
|---|---|
| HTML `<div>` with inline SVG per marker | GeoJSON polygon rendered as fill layer |
| Fixed pixel size (60x60px) | Geographic size (scales with zoom) |
| DOM elements — slow with many markers | GPU-rendered — handles 88k cameras |
| SVG rotation via CSS transform | Geographic math for cone shape |
| Only visible when unclustered | Separate source, shows at minzoom 12 |

---

## Part 9: Other UI Features

### GeoJSON Overlay (City Boundaries from Search)

- Togglable via Vuetify switch (top-right)
- Style: blue outline `#3388ff`, weight 2, opacity 1, fill opacity 0.2
- Non-interactive
- MapLibre: Add as separate `geojson` source with `fill` + `line` layers
- **Add/remove layers dynamically** (see Part 5: Search GeoJSON Source Management)

### Current Location Marker

- Blue dot (`#007bff`) with white border (`#ffffff`, weight 4)
- Radius: 10px, popup text: "Current Location"
- MapLibre: Use `maplibregl.Marker` with custom HTML element

### Clustering Toggle

| Zoom Level | Behavior |
|---|---|
| < 12 | Clustering always on, toggle disabled |
| 12–15 | Clustering on by default, user can toggle off |
| >= 16 | Clustering disabled (individual markers) |

User toggle: Vuetify switch in top-right corner (same card UI as current).

---

## Part 10: Layout & Styling (preserve exactly)

Map container:
- Full width, height: `calc(100dvh - 64px)` (or `100dvh` in iframe mode)
- Top offset: `64px` (Vuetify app bar) or `0` in iframe
- iframe detection: `window.self !== window.top`

Overlay positions (absolute, z-index 1000):
- **Top-left**: Search bar (max-width 320px desktop, full-width mobile)
- **Top-right**: Clustering toggle + city boundaries toggle
- **Bottom-right**: Share, report, GPS buttons
- **Bottom-left**: DeFlock logo (iframe only)
- **Bottom-center**: Zoom warning status bar (fixed, z-index 1100)
- **Top (z-index 1001)**: Loading progress bar (during GeoJSON fetch)

---

## Part 11: URL Hash Format (DO NOT CHANGE)

```
#map={zoom}/{lat}/{lng}/{searchQuery?}
```

Example: `#map=12/40.712800/-74.006000/New%20York`

Default (no hash): zoom 5, center `39.8283, -98.5795` (USA center)

---

## Part 12: Map Configuration

| Setting | Value |
|---|---|
| Min zoom | 3 |
| Max zoom | 18 |
| Default zoom | 12 (after search/locate), 5 (initial) |
| Base tiles | OSM raster: `https://tile.openstreetmap.org/{z}/{x}/{y}.png` |
| Navigation control | Hidden |

---

## Summary: What to Create, What to Modify, What to Delete

### CREATE (new files)

| Path | Description |
|---|---|
| `serverless/alpr_geojson/src/alpr_geojson.py` | New Lambda — Overpass → GeoJSON → S3 (includes `__main__` block for local testing) |
| `serverless/alpr_geojson/Dockerfile` | Container config (copy pattern from `alpr_cache`) |
| `serverless/alpr_geojson/requirements.txt` | Python deps: `requests`, `boto3` |
| `terraform/modules/alpr_geojson/main.tf` | Terraform module (copy pattern from `alpr_cache`) |
| `terraform/modules/alpr_geojson/variables.tf` | Terraform variables |
| `webapp/src/stores/geojson.ts` | Pinia store — single GeoJSON fetch with progress |
| `webapp/src/components/MapLibreMap.vue` | MapLibre map component with loading bar |
| `webapp/src/utils/directionCones.ts` | Geographic cone polygon generator + direction parsing (adapted from FlockHopper, ported from LeafletMap.vue direction logic) |

### MODIFY

| Path | Change |
|---|---|
| `webapp/src/views/Map.vue` | Swap LeafletMap → MapLibreMap, use geojson store, remove Leaflet imports, add loading state |
| `webapp/package.json` | Remove leaflet deps, add `maplibre-gl` |
| `terraform/main.tf` | Add `alpr_geojson` module reference |
| `webapp/src/services/apiService.ts` | Delete `getALPRs()` function and `BoundingBox` class (dead code — only used by tiles.ts and Map.vue tile fetching). Keep `geocodeQuery()`, `getSponsors()`, `getALPRCounts()`, `getCities()`. |

### DELETE (dead code)

| Path | Why |
|---|---|
| `webapp/src/components/LeafletMap.vue` | Replaced by MapLibreMap.vue |
| `webapp/src/stores/tiles.ts` | Replaced by geojson.ts |

### DO NOT TOUCH

| Path |
|---|
| `serverless/alpr_cache/` |
| `serverless/alpr_counts/` |
| `terraform/modules/alpr_cache/` |
| `terraform/modules/alpr_counts/` |
| `webapp/src/components/DFMapPopup.vue` |
| `webapp/src/stores/global.ts` |
| `webapp/src/stores/vendorStore.ts` |
| `webapp/src/services/cmsService.ts` |
| `api/` |

---

## Local Development Setup (No AWS/Cloudflare Needed)

The store hardcodes the CDN URL. In production, `cdn.deflock.me/all_alpr.geojson` is fetched normally. For local dev, you don't need to change any code — the CDN URL works as long as you have internet.

**For offline/isolated testing:**

1. Copy test fixture: `cp migration/all_deflock_cameras.geojson webapp/public/all_alpr.geojson`
2. Vite auto-serves it at `http://localhost:5173/all_alpr.geojson`
3. Temporarily change the URL in `geojson.ts` to `/all_alpr.geojson` (don't commit this)
4. `webapp/public/all_alpr.geojson` is already gitignored (large file, won't accidentally commit)

### Lambda local testing

```bash
cd serverless/alpr_geojson/src
python -m venv ../.venv && source ../.venv/bin/activate
pip install requests
python alpr_geojson.py
# Writes all_alpr.geojson locally — verify with:
python -c "import json; d=json.load(open('all_alpr.geojson')); print(len(d['features']))"
# Then copy to webapp for local dev:
cp all_alpr.geojson ../../../webapp/public/all_alpr.geojson
```

---

## Testing Checklist

1. Lambda: `alpr_geojson` produces valid GeoJSON FeatureCollection
2. GeoJSON has correct `[lon, lat]` coordinate order
3. All ~88k features present with whitelisted tags in `properties`
4. **Loading bar appears and progresses while GeoJSON loads**
5. **Loading bar disappears when data is ready**
6. Map loads at default US center (zoom 5) with no hash
7. Hash parsing works: `#map=12/40.7128/-74.0060`
8. All markers render on load (no viewport-based fetching needed)
9. Circle markers for cameras without direction data
10. SVG directional markers for cameras with direction data
11. Clustering groups markers at low zoom, ungroups at 16+
12. Clustering toggle works at zoom 12–15
13. Clicking marker shows popup with manufacturer, operator, OSM link
14. Search geocodes, pans to result, shows boundary GeoJSON
15. **Search boundary layers add/remove cleanly**
16. City boundaries toggle works
17. GPS locate button works
18. Share and report buttons work
19. URL hash updates on pan/zoom
20. iframe mode works (no app bar, logo in bottom-left)
21. **`webapp/public/all_alpr.geojson` is NOT committed** (gitignored)
22. **No leaflet imports remain anywhere in codebase**
23. **`BoundingBox` class cleaned up if unused**
