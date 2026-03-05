# Leaflet → MapLibre Migration Summary

This document explains every file created, modified, and deleted during the migration from Leaflet to MapLibre GL JS.

---

## Files Created

### 1. `serverless/alpr_geojson/src/alpr_geojson.py`

**Purpose:** New AWS Lambda function that generates a single GeoJSON file of all ALPR cameras worldwide.

**How it works:**
- Queries the Overpass API with the same query used by the existing `alpr_cache` Lambda: `node["man_made"="surveillance"]["surveillance:type"="ALPR"]`
- Converts each OSM node into a GeoJSON `Feature` with `[lon, lat]` coordinate order (GeoJSON spec)
- Filters node tags through a whitelist (operator, manufacturer, direction, brand, camera:direction, surveillance:brand, surveillance:operator, surveillance:manufacturer, wikimedia_commons)
- Flattens tags directly into `properties` (not nested under a `tags` key like the old tiled format)
- GZip-compresses the JSON and uploads to S3 at `cdn.deflock.me/all_alpr.geojson` with `Content-Encoding: gzip` so browsers decompress automatically
- Includes a `__main__` block for local testing — writes uncompressed GeoJSON to a local file without needing AWS credentials

**Why:** The old `alpr_cache` Lambda tiles data into ~20-degree grid cells, requiring multiple HTTP requests per viewport pan. This new Lambda produces a single file (~1.6 MB gzipped) that MapLibre loads once and handles entirely client-side with native clustering.

---

### 2. `serverless/alpr_geojson/src/requirements.txt`

**Purpose:** Python dependencies for the Lambda.

**Contents:** `requests` (Overpass API calls) and `boto3` (S3 upload).

---

### 3. `serverless/alpr_geojson/src/Dockerfile`

**Purpose:** Container image definition for the Lambda function.

**How it works:** Uses the official AWS Lambda Python 3.14 ARM64 base image, copies the script and requirements, installs dependencies with pip, and sets the handler entry point to `alpr_geojson.lambda_handler`.

**Why:** Mirrors the exact pattern from `serverless/alpr_cache/src/Dockerfile` for consistency with the existing deployment pipeline.

---

### 4. `terraform/modules/alpr_geojson/main.tf`

**Purpose:** Infrastructure-as-code for the new Lambda function.

**How it works:** Defines:
- IAM role with S3 write policy (scoped to the CDN bucket)
- Lambda function resource (ECR image-based, 180s timeout, 512MB memory, ARM64)
- CloudWatch Events rule triggering the Lambda every 60 minutes
- CloudWatch log group with 14-day retention
- SNS alarm for Lambda errors (daily threshold)
- ECR repository for the container image

**Why:** Mirrors `terraform/modules/alpr_cache/main.tf` exactly so both Lambdas follow the same operational pattern (monitoring, scheduling, IAM).

---

### 5. `terraform/modules/alpr_geojson/variables.tf`

**Purpose:** Input variables for the Terraform module.

**Contents:** `module_name`, `deflock_cdn_bucket`, `rate` (CloudWatch schedule expression), `sns_topic_arn` (for error alarms).

---

### 6. `terraform/modules/alpr_geojson/outputs.tf`

**Purpose:** Exports the ECR repository URL so the CI/CD pipeline knows where to push the container image.

---

### 7. `webapp/src/stores/geojson.ts`

**Purpose:** Pinia store that fetches and caches the GeoJSON camera data.

**How it works:**
- Exposes reactive state: `data` (the FeatureCollection), `loading`, `progress` (0-100), `error`
- `load()` is idempotent — won't re-fetch if already loaded or currently loading
- Uses the Fetch API's `ReadableStream` to track download progress byte-by-byte against the `Content-Length` header, driving the progress bar in real-time
- Falls back to simple `response.json()` if streaming isn't available
- In dev mode (`import.meta.env.DEV`), fetches from `/all_alpr.geojson` (served by Vite from `webapp/public/`); in production, fetches from `https://cdn.deflock.me/all_alpr.geojson`

**Why:** Replaces `webapp/src/stores/tiles.ts` which maintained a tile cache and fetched data per-viewport using `BoundingBox` math. The new store is dramatically simpler — one fetch on mount, done. The ~16 MB file (1.6 MB gzipped) loads in 1-2 seconds and MapLibre handles all spatial queries client-side.

---

### 8. `webapp/src/utils/directionCones.ts`

**Purpose:** Direction parsing and geographic cone polygon generation.

**How it works:**

*Ported from LeafletMap.vue (exact logic preserved):*
- `CARDINAL_DIRECTIONS` — 16-point compass lookup (N, NNE, NE, ... NNW)
- `cardinalToDegrees()` — converts cardinal string to degrees
- `parseDirectionSingle()` — handles numeric values and cardinal strings
- `calculateMidpointAngle()` — computes midpoint bearing for range values like "NE-SE", handling the 0/360 wrap-around
- `parseDirectionValue()` — top-level parser supporting single values and dash-separated ranges

*New functions:*
- `createDirectionCone(lon, lat, direction, lengthMeters, spreadDegrees)` — generates a GeoJSON Polygon representing a camera's field of view as a fan/wedge shape. Uses spherical geometry to compute 10 vertices: the camera origin, left edge, 7 arc points along the front, right edge, and back to origin. Default: 200m reach, 90-degree spread.
- `buildDirectionCones(geojsonData)` — iterates all features in a FeatureCollection, extracts `camera:direction` or `direction` properties (including semicolon-separated multi-direction values like `"0;180"`), and returns a new FeatureCollection of cone polygons.

**Why:** The old LeafletMap.vue used CSS-rotated SVG overlays (60x60px fixed-size DOM elements) for direction indicators. These were slow with many markers. The new approach generates geographic polygons that MapLibre renders as native fill/line layers on the GPU — much more performant with 88k cameras, and the cones scale geographically with zoom.

---

### 9. `webapp/src/components/MapLibreMap.vue`

**Purpose:** The main map component — replaces LeafletMap.vue with full feature parity.

**How it works:**

*Initialization:*
- Creates a `maplibregl.Map` instance with OSM raster tiles (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`)
- No navigation control (hidden per spec)
- Min zoom 3, max zoom 18
- Container height adapts to Vuetify's layout via `var(--v-layout-top)`

*Data layers (added when GeoJSON arrives via watcher):*
- **`alprs` source** — GeoJSON source with native clustering (`clusterMaxZoom: 15`, `clusterRadius: 60`)
- **`clusters` layer** — graduated blue circles sized by `point_count` (DeFlock brand color `rgb(63,84,243)`)
- **`cluster-count` layer** — white text labels showing abbreviated point counts
- **`unclustered-point` layer** — blue circle markers for individual cameras
- **`direction-cones` source** — separate GeoJSON source built by `buildDirectionCones()`
- **`direction-cones` fill layer** — semi-transparent blue polygons (minzoom 12)
- **`direction-cones-outline` line layer** — darker blue outlines (minzoom 12)

*Interactions:*
- **Cluster click** — queries `getClusterExpansionZoom()` and smoothly zooms in
- **Camera click** — mounts a `DFMapPopup` Vue component inside a MapLibre Popup using `createApp()`. Passes the camera's properties as the `alpr` prop with `{ id, lat, lon, tags, type }` shape matching what DFMapPopup expects.
- **Cursor changes** — pointer cursor on hover over clusters and camera points

*Clustering toggle:*
- Toggle switch in top-right corner (disabled at zoom < 12)
- At zoom < 12: clustering always forced on for performance
- At zoom 12-15: user can toggle clustering on/off
- At zoom 16+: clustering automatically disabled
- Implementation: removes and re-adds the `alprs` source with updated `cluster` flag (MapLibre doesn't support changing cluster config on the fly)

*Search boundary:*
- `searchGeojson` prop triggers add/remove of `search-boundary` fill + line layers
- City boundaries toggle switch controls visibility
- Layers use `#3388ff` blue styling

*Current location:*
- Custom HTML marker (blue `#007bff` dot with white border and drop shadow)
- Updates position when `currentLocation` prop changes

*Exposed methods:*
- `fitGeoJSON(geojson)` — computes bounding box from any GeoJSON geometry type and calls `map.fitBounds()` with 50px padding. Used by Map.vue for search zoom-to-fit.

*Layout:*
- Slots: `topleft` (search bar), `bottomright` (action buttons)
- Loading progress bar (`v-progress-linear`) at top during data fetch
- Iframe detection (`window.self !== window.top`) for embedded mode

**Why:** Leaflet + leaflet.markercluster used DOM-based markers (HTML elements per marker), which is extremely slow with 88k cameras. MapLibre GL JS renders everything on the GPU via WebGL — clustering, markers, and direction cones are all handled by the GPU with no DOM overhead. The built-in GeoJSON source clustering eliminates the need for the markercluster plugin.

---

## Files Modified

### 10. `webapp/src/views/Map.vue`

**What changed:**
- **Imports:** Replaced `leaflet/dist/leaflet.css`, `L from 'leaflet'`, `LeafletMap`, `useTilesStore` → `maplibre-gl/dist/maplibre-gl.css`, `MapLibreMap`, `useGeojsonStore`
- **Store usage:** Replaced `tilesStore.allNodes` (computed array) with `geojsonStore.data/loading/progress` (reactive refs)
- **Removed `globalThis.L = L`** — Leaflet required this global; MapLibre doesn't
- **Removed `updateBounds()` function** — was constructing `BoundingBox` and calling `fetchVisibleTiles()` on every pan. No longer needed since all data loads upfront.
- **Removed `BoundingBox` import** from apiService
- **Removed `bounds` ref** — no longer tracking viewport bounds
- **Added `geojsonStore.load()`** in `onMounted` — triggers the single GeoJSON fetch
- **Added `mapRef`** typed as `InstanceType<typeof MapLibreMap>` for calling `fitGeoJSON()`
- **Search zoom-to-fit:** Replaced `L.geoJSON(geojson).getBounds()` with `mapRef.value?.fitGeoJSON(geojson)`
- **Template:** Swapped `<leaflet-map>` for `<MapLibreMap>` with new props (`:geojson-data`, `:loading`, `:progress`, `:search-geojson`, `:current-location`)
- **CSS:** Removed `overflow: auto` from `.map-container` — was causing layout issues with MapLibre's rendering

**Why:** This is the orchestration layer that wires data (store) to rendering (map component). The old version managed per-viewport tile fetching with BoundingBox math on every pan event. The new version fetches once on mount and passes data down as props.

---

### 11. `webapp/package.json`

**What changed:**
- **Removed:** `leaflet` (^1.9.4), `@types/leaflet` (^1.9.15), `leaflet.markercluster` (^1.5.3), `@types/leaflet.markercluster` (^1.5.5)
- **Added:** `maplibre-gl` (^5.19.0)

**Why:** Direct dependency swap. MapLibre GL JS includes built-in clustering, so no separate cluster plugin is needed (leaflet.markercluster was a separate dependency).

---

### 12. `webapp/src/services/apiService.ts`

**What changed:**
- **Removed:** `BoundingBoxLiteral` interface, `BoundingBox` class (with `containsPoint`, `updateFromOther`, `isSubsetOf` methods), `Cluster` interface, `getALPRs()` function
- **Kept:** `geocodeQuery()`, `getSponsors()`, `getALPRCounts()`, `getCities()`

**Why:** `BoundingBox` and `getALPRs()` were only used by the old tile-based fetching system (`tiles.ts` + `Map.vue`). With the new single-GeoJSON approach, viewport math is no longer needed on the client — MapLibre handles spatial queries internally.

---

### 13. `terraform/main.tf`

**What changed:** Added module block for `alpr_geojson` (lines 26-32) wiring the new module with `deflock_cdn_bucket`, `rate(60 minutes)`, and the shared SNS alarm topic.

**Why:** Registers the new Lambda with the existing infrastructure. Same pattern as the `alpr_cache` module block above it.

---

## Files Deleted

### 14. `webapp/src/components/LeafletMap.vue` (was ~657 lines)

**What it did:** Initialized Leaflet map, managed tile layers, marker clusters (DOM-based), SVG direction indicators, GeoJSON overlays, popups, and clustering toggle.

**Why deleted:** Entirely replaced by `MapLibreMap.vue`. No code was reusable except the direction parsing functions, which were extracted to `utils/directionCones.ts`.

---

### 15. `webapp/src/stores/tiles.ts` (was ~102 lines)

**What it did:** Pinia store that maintained a cache of tile data keyed by `"lat/lon"` grid coordinates. On every map pan, it computed which tiles were visible, fetched missing ones from `cdn.deflock.me/regions/{lat}/{lon}.json`, and merged results into a flat array of ALPR nodes.

**Why deleted:** Entirely replaced by `geojson.ts`. The new store fetches a single file once — no viewport math, no tile cache, no merge logic.

---

## Architecture Before vs After

```
BEFORE (Leaflet + tiled data):
  User pans map
    → Map.vue computes BoundingBox
    → tiles.ts fetches cdn.deflock.me/regions/{lat}/{lon}.json (multiple requests)
    → LeafletMap.vue creates DOM markers + SVG cones
    → leaflet.markercluster groups markers in DOM
  Result: Slow with many markers, multiple network requests per interaction

AFTER (MapLibre + single GeoJSON):
  Page loads
    → geojson.ts fetches cdn.deflock.me/all_alpr.geojson (one request, 1.6 MB gzipped)
    → MapLibreMap.vue passes data to MapLibre GL source
    → MapLibre clusters on GPU, renders cones as fill layers
  Result: Fast with 88k cameras, single network request, GPU-rendered
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Single GeoJSON file instead of tiles | 88k points is only 1.6 MB gzipped — one HTTP request is faster than many small tile requests |
| MapLibre native clustering | Built into the GeoJSON source — no plugin needed, GPU-rendered |
| Geographic polygon cones | GPU-rendered fill layers instead of DOM SVG elements — scales to 88k cameras |
| GZip at upload (not on-the-fly) | Lambda compresses once, Cloudflare passes through — no server CPU per request |
| `import.meta.env.DEV` URL switch | Local dev serves from `webapp/public/`, production from CDN — no env vars needed |
| Direction parsing extracted to utility | Decoupled from any map library — testable independently, reusable |
| `var(--v-layout-top)` for height | Adapts to Vuetify's actual app bar height instead of hardcoding 64px |
