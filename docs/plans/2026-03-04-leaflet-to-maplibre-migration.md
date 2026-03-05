# Leaflet → MapLibre Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Leaflet with MapLibre GL JS, including a new GeoJSON data pipeline (Lambda → S3) and a new Vue map component with native clustering and geographic direction cones.

**Architecture:** Pipeline-first approach. Build and test the Lambda GeoJSON generator locally, then build the frontend (store → utils → component → wiring). Each task is independently testable. Old Leaflet code is deleted last.

**Tech Stack:** Python 3 (Lambda), MapLibre GL JS 4.x, Vue 3 + TypeScript + Pinia, Terraform (HCL)

---

## Phase 1: Data Pipeline (Backend — Test Locally)

### Task 1: Create alpr_geojson Lambda Script

**Files:**
- Reference (READ ONLY): `serverless/alpr_cache/src/alpr_cache.py`
- Create: `serverless/alpr_geojson/src/alpr_geojson.py`
- Create: `serverless/alpr_geojson/src/requirements.txt`
- Create: `serverless/alpr_geojson/src/Dockerfile`

**Step 1: Read the existing alpr_cache Lambda**

Read `serverless/alpr_cache/src/alpr_cache.py` to understand the Overpass query, tag whitelist, and S3 upload pattern.

**Step 2: Create requirements.txt**

```
requests
boto3
```

Write to: `serverless/alpr_geojson/src/requirements.txt`

**Step 3: Create the Lambda script**

Write to: `serverless/alpr_geojson/src/alpr_geojson.py`

```python
import json
import gzip
import os

import requests
import boto3

OVERPASS_URL = "http://overpass-api.de/api/interpreter"
OVERPASS_QUERY = '[out:json];node["man_made"="surveillance"]["surveillance:type"="ALPR"];out body;'
USER_AGENT = "DeFlock/1.0"

WHITELISTED_TAGS = [
    "operator",
    "manufacturer",
    "direction",
    "brand",
    "camera:direction",
    "surveillance:brand",
    "surveillance:operator",
    "surveillance:manufacturer",
    "wikimedia_commons",
]

OUTPUT_KEY = "all_alpr.geojson"


def get_all_nodes():
    response = requests.post(
        OVERPASS_URL,
        data={"data": OVERPASS_QUERY},
        headers={"User-Agent": USER_AGENT},
        timeout=120,
    )
    response.raise_for_status()
    return response.json()["elements"]


def build_geojson():
    nodes = get_all_nodes()
    features = []
    for node in nodes:
        properties = {"id": node["id"]}
        properties.update(
            {k: v for k, v in node.get("tags", {}).items() if k in WHITELISTED_TAGS}
        )
        features.append(
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [node["lon"], node["lat"]],  # GeoJSON = [lon, lat]
                },
                "properties": properties,
            }
        )
    return {"type": "FeatureCollection", "features": features}


def lambda_handler(event, context):
    geojson = build_geojson()
    body = gzip.compress(json.dumps(geojson).encode("utf-8"))

    s3 = boto3.client("s3")
    s3.put_object(
        Bucket=os.getenv("OUTPUT_BUCKET", "cdn.deflock.me"),
        Key=OUTPUT_KEY,
        Body=body,
        ContentType="application/geo+json",
        ContentEncoding="gzip",
    )

    return {
        "statusCode": 200,
        "body": json.dumps({"features": len(geojson["features"])}),
    }


if __name__ == "__main__":
    geojson = build_geojson()
    with open("all_alpr.geojson", "w") as f:
        json.dump(geojson, f)
    print(f"Wrote {len(geojson['features'])} features to all_alpr.geojson")
```

**Step 4: Create the Dockerfile**

Read `serverless/alpr_cache/src/Dockerfile` for the pattern, then create `serverless/alpr_geojson/src/Dockerfile` mirroring it but pointing to `alpr_geojson.lambda_handler`.

**Step 5: Commit**

```bash
git add serverless/alpr_geojson/src/alpr_geojson.py serverless/alpr_geojson/src/requirements.txt serverless/alpr_geojson/src/Dockerfile
git commit -m "feat: add alpr_geojson Lambda script for GeoJSON pipeline"
```

---

### Task 2: Test Lambda Locally (Validate GeoJSON Output)

**Files:**
- Run: `serverless/alpr_geojson/src/alpr_geojson.py`

**Step 1: Set up Python venv and install deps**

```bash
cd serverless/alpr_geojson/src
python3 -m venv ../.venv && source ../.venv/bin/activate
pip install requests
```

**Step 2: Run the script locally**

```bash
python alpr_geojson.py
```

Expected: `Wrote NNNNN features to all_alpr.geojson` (should be ~88,000)

**Step 3: Validate the output**

```bash
python3 -c "
import json
d = json.load(open('all_alpr.geojson'))
assert d['type'] == 'FeatureCollection'
print(f'Features: {len(d[\"features\"])}')
f = d['features'][0]
assert f['type'] == 'Feature'
assert f['geometry']['type'] == 'Point'
coords = f['geometry']['coordinates']
assert -180 <= coords[0] <= 180, f'lon out of range: {coords[0]}'
assert -90 <= coords[1] <= 90, f'lat out of range: {coords[1]}'
assert 'id' in f['properties']
print(f'Sample: coords={coords}, props={f[\"properties\"]}')
print('ALL VALIDATIONS PASSED')
"
```

Expected: `ALL VALIDATIONS PASSED`

**Step 4: Copy output to webapp for local dev**

```bash
cp all_alpr.geojson ../../../webapp/public/all_alpr.geojson
```

**Step 5: Verify gitignore covers the fixture**

```bash
cd ../../../
git status webapp/public/all_alpr.geojson
```

Expected: File should NOT appear in git status (gitignored)

---

### Task 3: Update .gitignore for New Lambda

**Files:**
- Modify: `.gitignore`

**Step 1: Read the current .gitignore**

Read `.gitignore` and find the serverless whitelist section.

**Step 2: Verify `alpr_geojson.py` is already whitelisted**

Look for `!serverless/*/src/alpr_geojson.py`. If missing, add it next to the `alpr_cache.py` whitelist entry.

**Step 3: Commit if changed**

```bash
git add .gitignore
git commit -m "chore: whitelist alpr_geojson.py in gitignore"
```

---

### Task 4: Create Terraform Module for alpr_geojson

**Files:**
- Reference (READ ONLY): `terraform/modules/alpr_cache/main.tf`, `terraform/modules/alpr_cache/variables.tf`, `terraform/modules/alpr_cache/outputs.tf`
- Create: `terraform/modules/alpr_geojson/main.tf`
- Create: `terraform/modules/alpr_geojson/variables.tf`
- Create: `terraform/modules/alpr_geojson/outputs.tf`
- Modify: `terraform/main.tf`

**Step 1: Read the existing alpr_cache Terraform module**

Read all three files in `terraform/modules/alpr_cache/`.

**Step 2: Create alpr_geojson module**

Copy the alpr_cache module structure, replacing:
- All `alpr_cache` references → `alpr_geojson`
- S3 key pattern: single `all_alpr.geojson` instead of `regions/` prefix
- Same schedule: `rate(60 minutes)`
- Same timeout/memory: 180s / 512MB / arm64

Write `main.tf`, `variables.tf`, `outputs.tf` to `terraform/modules/alpr_geojson/`.

**Step 3: Wire into root terraform**

Read `terraform/main.tf`, then add the `alpr_geojson` module block following the same pattern as `alpr_cache`.

**Step 4: Validate Terraform syntax**

```bash
cd terraform && terraform fmt -check -recursive
```

Expected: No formatting errors (or fix them)

**Step 5: Commit**

```bash
git add terraform/modules/alpr_geojson/ terraform/main.tf
git commit -m "feat: add Terraform module for alpr_geojson Lambda"
```

---

## Phase 2: Frontend — Utilities & Store

### Task 5: Install MapLibre, Remove Leaflet Dependencies

**Files:**
- Modify: `webapp/package.json`

**Step 1: Remove Leaflet packages**

```bash
cd webapp
npm uninstall leaflet @types/leaflet leaflet.markercluster @types/leaflet.markercluster
```

**Step 2: Install MapLibre**

```bash
npm install maplibre-gl
```

**Step 3: Verify package.json**

Read `webapp/package.json` and confirm:
- No `leaflet` entries remain
- `maplibre-gl` is in dependencies

**Step 4: Run npm install to regenerate lockfile**

```bash
npm install
```

**Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: swap leaflet deps for maplibre-gl"
```

---

### Task 6: Create Direction Cone Utilities

**Files:**
- Reference (READ ONLY): `webapp/src/components/LeafletMap.vue` (direction parsing functions)
- Create: `webapp/src/utils/directionCones.ts`

**Step 1: Read LeafletMap.vue direction parsing code**

Read `webapp/src/components/LeafletMap.vue` and identify:
- `CARDINAL_DIRECTIONS` constant
- `parseDirectionValue()`
- `parseDirectionSingle()`
- `calculateMidpointAngle()`
- `cardinalToDegrees()`

**Step 2: Create directionCones.ts**

Write to: `webapp/src/utils/directionCones.ts`

Extract and port the direction parsing functions from LeafletMap.vue (preserving exact logic), then add the `createDirectionCone()` function from the migration spec:

```typescript
// Direction parsing (ported from LeafletMap.vue)
export const CARDINAL_DIRECTIONS: Record<string, number> = {
  N: 0, NNE: 22.5, NE: 45, ENE: 67.5,
  E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
  S: 180, SSW: 202.5, SW: 225, WSW: 247.5,
  W: 270, WNW: 292.5, NW: 315, NNW: 337.5,
};

export function cardinalToDegrees(cardinal: string): number | null {
  // ... port from LeafletMap.vue
}

export function parseDirectionSingle(value: string): number | null {
  // ... port from LeafletMap.vue
}

export function calculateMidpointAngle(start: number, end: number): number {
  // ... port from LeafletMap.vue
}

export function parseDirectionValue(value: string): number | null {
  // ... port from LeafletMap.vue
}

// Geographic cone generation (from migration spec)
export function createDirectionCone(
  lon: number,
  lat: number,
  direction: number,
  lengthMeters: number = 200,
  spreadDegrees: number = 90
): GeoJSON.Feature<GeoJSON.Polygon> {
  const earthRadius = 6371000;
  const latRad = (lat * Math.PI) / 180;
  const lengthDeg = (lengthMeters / earthRadius) * (180 / Math.PI);

  const points: [number, number][] = [[lon, lat]];

  const leftAngle = ((direction - spreadDegrees / 2) * Math.PI) / 180;
  points.push([
    lon + (lengthDeg * Math.sin(leftAngle)) / Math.cos(latRad),
    lat + lengthDeg * Math.cos(leftAngle),
  ]);

  for (let i = 1; i < 8; i++) {
    const angle =
      ((direction - spreadDegrees / 2 + (spreadDegrees * i) / 8) * Math.PI) / 180;
    points.push([
      lon + (lengthDeg * Math.sin(angle)) / Math.cos(latRad),
      lat + lengthDeg * Math.cos(angle),
    ]);
  }

  const rightAngle = ((direction + spreadDegrees / 2) * Math.PI) / 180;
  points.push([
    lon + (lengthDeg * Math.sin(rightAngle)) / Math.cos(latRad),
    lat + lengthDeg * Math.cos(rightAngle),
  ]);
  points.push([lon, lat]);

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [points] },
  };
}

// Build cones FeatureCollection from GeoJSON data
export function buildDirectionCones(
  geojsonData: GeoJSON.FeatureCollection
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
```

**Step 3: Verify TypeScript compiles**

```bash
cd webapp && npx tsc --noEmit src/utils/directionCones.ts
```

Expected: No errors

**Step 4: Commit**

```bash
git add src/utils/directionCones.ts
git commit -m "feat: add direction cone utilities (ported from LeafletMap.vue)"
```

---

### Task 7: Create GeoJSON Pinia Store

**Files:**
- Reference (READ ONLY): `webapp/src/stores/tiles.ts`
- Create: `webapp/src/stores/geojson.ts`

**Step 1: Create the store**

Write to: `webapp/src/stores/geojson.ts`

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

const GEOJSON_URL = import.meta.env.DEV
  ? '/all_alpr.geojson'
  : 'https://cdn.deflock.me/all_alpr.geojson';

export const useGeojsonStore = defineStore('geojson', () => {
  const data = ref<GeoJSON.FeatureCollection | null>(null);
  const loading = ref(false);
  const progress = ref(0);
  const error = ref<string | null>(null);

  async function load() {
    if (data.value || loading.value) return;
    loading.value = true;
    progress.value = 0;

    try {
      const response = await fetch(GEOJSON_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const contentLength = +(response.headers.get('Content-Length') ?? 0);
      const reader = response.body?.getReader();

      if (reader && contentLength) {
        let received = 0;
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          progress.value = Math.round((received / contentLength) * 100);
        }

        const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
        const merged = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          merged.set(chunk, offset);
          offset += chunk.length;
        }

        data.value = JSON.parse(new TextDecoder().decode(merged));
      } else {
        data.value = await response.json();
      }

      progress.value = 100;
    } catch (e) {
      error.value = 'Failed to load camera data';
      console.error('GeoJSON load error:', e);
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, progress, error, load };
});
```

**Step 2: Verify TypeScript compiles**

```bash
cd webapp && npx vue-tsc --noEmit
```

Expected: May have errors from LeafletMap.vue (expected — it's being deleted). The new store should compile cleanly.

**Step 3: Commit**

```bash
git add src/stores/geojson.ts
git commit -m "feat: add GeoJSON Pinia store with streaming progress"
```

---

### Task 8: Test GeoJSON Store with Local Dev Server

**Files:**
- Verify: `webapp/public/all_alpr.geojson` exists (from Task 2 Step 4)

**Step 1: Verify the local fixture exists**

```bash
ls -lh webapp/public/all_alpr.geojson
```

Expected: ~16 MB file present

**Step 2: Start dev server**

```bash
cd webapp && npm run dev
```

**Step 3: Test fetch in browser**

Open `http://localhost:5173` — open browser DevTools Network tab.
Verify: `all_alpr.geojson` is fetched successfully (200 OK, ~16 MB).

At this point the map will be broken (LeafletMap.vue still referenced). That's expected — we're only verifying the store fetches data.

**Step 4: Quick console test**

In browser console:
```javascript
// The store should have loaded data
const { useGeojsonStore } = await import('/src/stores/geojson.ts');
// Check in Vue DevTools: geojson store should have data with ~88k features
```

---

## Phase 3: Frontend — MapLibre Component

### Task 9: Create MapLibreMap.vue Component

**Files:**
- Reference (READ ONLY): `webapp/src/components/LeafletMap.vue`
- Reference (READ ONLY): `migration/LEAFLET_TO_MAPLIBRE_MIGRATION.md` (Parts 5, 7, 8, 9)
- Create: `webapp/src/components/MapLibreMap.vue`

**Step 1: Read LeafletMap.vue for feature parity reference**

Read `webapp/src/components/LeafletMap.vue` thoroughly to understand:
- Props/emits interface
- Slot structure (topleft, bottomright)
- Clustering toggle logic
- GeoJSON overlay management
- Current location marker
- Popup mounting pattern

**Step 2: Create MapLibreMap.vue**

Write to: `webapp/src/components/MapLibreMap.vue`

This is the largest file. Key sections:

**Template:**
```html
<template>
  <div class="map-wrapper" :style="{ height: mapHeight, marginTop: mapOffset }">
    <v-progress-linear
      v-if="loading"
      :model-value="progress"
      color="rgb(63,84,243)"
      height="4"
      style="position: absolute; top: 0; z-index: 1001;"
    />
    <div ref="mapContainer" class="map-container" />
    <div class="map-overlay topleft">
      <slot name="topleft" />
    </div>
    <div class="map-overlay bottomright">
      <slot name="bottomright" />
    </div>
  </div>
</template>
```

**Script setup:**
- Props: `center`, `zoom`, `geojsonData`, `loading`, `progress`, `searchGeojson`, `currentLocation`
- Emits: `update:center`, `update:zoom`
- Map initialization with OSM raster style (from migration spec Part 5)
- ALPR data source with clustering (from migration spec Part 5)
- Three layers: clusters, cluster-count, unclustered-point (from migration spec Part 8)
- Direction cones source + layers (from migration spec Part 8)
- Search boundary source management (from migration spec Part 5)
- Current location marker
- Popup handling with DFMapPopup.vue mounting (from migration spec Part 7)
- Cluster click → zoom to expand
- Clustering toggle (re-add source with cluster on/off)
- Watch `geojsonData` to add/update source when data arrives
- Watch `searchGeojson` to add/remove boundary layers
- Watch `currentLocation` to add/move marker
- Emit center/zoom on `moveend`
- `fitGeoJSON(geojson)` exposed method for search zoom-to-fit
- iframe detection for layout
- Cleanup on unmount

Refer to the migration doc for exact layer definitions, paint properties, and behavior specs.

**Step 3: Verify it compiles**

```bash
cd webapp && npx vue-tsc --noEmit src/components/MapLibreMap.vue
```

**Step 4: Commit**

```bash
git add src/components/MapLibreMap.vue
git commit -m "feat: add MapLibreMap.vue component with clustering and direction cones"
```

---

### Task 10: Wire Up Map.vue (Swap LeafletMap → MapLibreMap)

**Files:**
- Modify: `webapp/src/views/Map.vue`

**Step 1: Read current Map.vue**

Read `webapp/src/views/Map.vue` to understand all Leaflet touchpoints.

**Step 2: Replace imports**

Remove:
```typescript
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
globalThis.L = L;
import LeafletMap from '@/components/LeafletMap.vue';
import { useTilesStore } from '@/stores/tiles';
```

Add:
```typescript
import 'maplibre-gl/dist/maplibre-gl.css';
import MapLibreMap from '@/components/MapLibreMap.vue';
import { useGeojsonStore } from '@/stores/geojson';
```

**Step 3: Replace store usage**

Remove:
```typescript
const tilesStore = useTilesStore();
const { fetchVisibleTiles } = tilesStore;
const alprs = computed(() => tilesStore.allNodes);
```

Add:
```typescript
const geojsonStore = useGeojsonStore();
const geojsonData = computed(() => geojsonStore.data);
const geojsonLoading = computed(() => geojsonStore.loading);
const geojsonProgress = computed(() => geojsonStore.progress);
```

**Step 4: Add load() call on mount**

In the existing `onMounted`:
```typescript
geojsonStore.load();
```

**Step 5: Remove updateBounds handler**

Delete the `updateBounds` function and `BoundingBox` usage.

**Step 6: Fix search zoom-to-fit**

Replace `L.geoJSON(result.geojson).getBounds()` with the MapLibreMap's `fitGeoJSON` method:
```typescript
const mapRef = ref<InstanceType<typeof MapLibreMap> | null>(null);
// In search handler:
mapRef.value?.fitGeoJSON(result.geojson);
```

**Step 7: Update template**

Replace `<leaflet-map ...>` with `<maplibre-map ...>` using the new props from migration spec Part 6.

**Step 8: Remove BoundingBox import**

Remove `BoundingBox` from `apiService` import.

**Step 9: Verify it compiles**

```bash
cd webapp && npx vue-tsc --noEmit
```

**Step 10: Commit**

```bash
git add src/views/Map.vue
git commit -m "feat: wire MapLibreMap into Map.vue, remove Leaflet usage"
```

---

### Task 11: Test the Full Frontend Locally

**Step 1: Start dev server**

```bash
cd webapp && npm run dev
```

**Step 2: Verify map loads**

Open `http://localhost:5173`. Expected:
- [ ] Loading progress bar appears at top
- [ ] Map renders with OSM tiles
- [ ] ~88k camera markers appear (clustered)
- [ ] Progress bar disappears when loaded

**Step 3: Test clustering**

- [ ] Zoom out (zoom 3-5): large cluster circles with counts
- [ ] Zoom in (zoom 12-15): smaller clusters, toggle appears
- [ ] Zoom 16+: individual markers visible

**Step 4: Test direction cones**

- [ ] Zoom to 12+: blue direction cones appear on cameras with direction data
- [ ] Cones scale geographically with zoom

**Step 5: Test popups**

- [ ] Click unclustered marker: popup appears with manufacturer, operator, OSM link
- [ ] Popup displays vendor image if available

**Step 6: Test search**

- [ ] Type a city name: map pans to result
- [ ] City boundary overlay appears
- [ ] Boundary toggle works

**Step 7: Test URL hash**

- [ ] Pan/zoom: URL hash updates (`#map=12/40.7128/-74.0060`)
- [ ] Reload with hash: map restores position
- [ ] No hash: defaults to US center, zoom 5

**Step 8: Test GPS locate**

- [ ] Click GPS button: blue dot appears at current location

**Step 9: Fix any issues found**

Address bugs discovered during testing before proceeding.

---

## Phase 4: Cleanup

### Task 12: Delete Dead Code

**Files:**
- Delete: `webapp/src/components/LeafletMap.vue`
- Delete: `webapp/src/stores/tiles.ts`
- Modify: `webapp/src/services/apiService.ts`

**Step 1: Delete LeafletMap.vue**

```bash
rm webapp/src/components/LeafletMap.vue
```

**Step 2: Delete tiles.ts**

```bash
rm webapp/src/stores/tiles.ts
```

**Step 3: Clean up apiService.ts**

Read `webapp/src/services/apiService.ts`. Delete:
- `BoundingBox` class
- `getALPRs()` function

Keep:
- `geocodeQuery()`
- `getSponsors()`
- `getALPRCounts()`
- `getCities()`

**Step 4: Verify no remaining Leaflet imports**

```bash
grep -r "leaflet\|LeafletMap\|useTilesStore\|BoundingBox" webapp/src/ --include="*.ts" --include="*.vue"
```

Expected: No matches

**Step 5: Verify build succeeds**

```bash
cd webapp && npm run build
```

Expected: Clean build with no errors

**Step 6: Commit**

```bash
git add -A webapp/src/components/LeafletMap.vue webapp/src/stores/tiles.ts webapp/src/services/apiService.ts
git commit -m "chore: remove Leaflet dead code (LeafletMap.vue, tiles.ts, BoundingBox)"
```

---

### Task 13: Final Verification

**Step 1: Full test pass**

```bash
cd webapp && npm run build
```

Expected: Clean build

**Step 2: Run dev server and re-run Task 11 checklist**

Verify all 9 test sections pass.

**Step 3: Check no Leaflet artifacts remain**

```bash
grep -r "leaflet" webapp/ --include="*.ts" --include="*.vue" --include="*.json" -l
```

Expected: Only `package-lock.json` might reference leaflet indirectly — verify `package.json` is clean.

**Step 4: Verify gitignore**

```bash
git status
```

Expected: `webapp/public/all_alpr.geojson` does NOT appear (gitignored)

**Step 5: Final commit if any loose ends**

```bash
git status
# If clean, done. If changes, commit appropriately.
```

---

## Task Dependency Graph

```
Task 1 (Lambda script)
  → Task 2 (test Lambda locally)
  → Task 3 (gitignore update)

Task 4 (Terraform) — independent of Tasks 1-3

Task 5 (npm deps) — independent, can run in parallel with Tasks 1-4

Task 6 (direction utils) — depends on Task 5
Task 7 (GeoJSON store) — depends on Task 5

Task 8 (test store) — depends on Tasks 2, 7

Task 9 (MapLibreMap.vue) — depends on Tasks 6, 7

Task 10 (wire Map.vue) — depends on Task 9

Task 11 (full test) — depends on Task 10

Task 12 (delete dead code) — depends on Task 11

Task 13 (final verification) — depends on Task 12
```

## Parallelization Opportunities

- **Tasks 1-3** (backend) and **Tasks 4-5** (infra + deps) can run in parallel
- **Tasks 6 and 7** can run in parallel (both depend only on Task 5)
- Everything else is sequential
