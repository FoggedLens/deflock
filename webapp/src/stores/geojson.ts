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
