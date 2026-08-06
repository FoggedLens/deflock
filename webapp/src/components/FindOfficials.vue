<template>
  <v-card class="pa-6" elevation="3" rounded="lg">
    <div class="d-flex align-center mb-4">
      <v-avatar size="48" color="primary" class="mr-4">
        <v-icon size="24" color="white">mdi-card-account-mail</v-icon>
      </v-avatar>
      <div>
        <h3 class="text-h5 font-weight-bold mb-1">Find Who to Contact</h3>
        <p class="text-body-2 text-medium-emphasis mb-0">Look up your local officials before you write or call</p>
      </div>
    </div>

    <p class="text-body-1 mb-4">
      Enter your city or ZIP code to find your city's official website and other places
      to reach the people who decide whether ALPRs come to your community.
    </p>

    <v-form @submit.prevent="search">
      <div class="d-flex flex-column flex-sm-row ga-2 align-sm-start">
        <v-combobox
          v-model="committed"
          v-model:search="query"
          :items="suggestions"
          :loading="suggesting || locating"
          item-title="label"
          return-object
          no-filter
          hide-no-data
          label="Your city or ZIP code"
          placeholder="Springfield, IL"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          class="flex-grow-1"
          :append-inner-icon="geolocationAvailable ? 'mdi-crosshairs-gps' : undefined"
          @click:append-inner="useMyLocation"
          @update:model-value="onInputCommit"
          @keydown.enter="search"
        >
          <template #item="{ props: itemProps, item }">
            <v-list-item v-bind="itemProps" :subtitle="item.raw.subtitle || undefined" />
          </template>
        </v-combobox>
        <v-btn
          type="submit"
          color="primary"
          size="large"
          :loading="loading"
          prepend-icon="mdi-magnify"
        >
          Find Officials
        </v-btn>
      </div>
    </v-form>

    <v-alert v-if="error" type="warning" variant="tonal" class="mt-4">
      {{ error }}
    </v-alert>

    <div v-if="place" class="mt-6">
      <h4 class="text-h6 font-weight-bold mb-3 d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-map-marker</v-icon>
        {{ place.label }}
      </h4>

      <v-list density="comfortable" class="contact-links">
        <v-list-item
          v-if="place.websiteUrl"
          :href="place.websiteUrl"
          target="_blank"
          rel="noopener"
          prepend-icon="mdi-web"
          append-icon="mdi-open-in-new"
          rounded="lg"
        >
          <v-list-item-title class="font-weight-bold">Official {{ place.municipality }} website</v-list-item-title>
          <v-list-item-subtitle v-if="place.kind === 'county'">Look for a "Board of Commissioners" or "Contact" page to get names and email addresses</v-list-item-subtitle>
          <v-list-item-subtitle v-else>Look for a "City Council", "Mayor", or "Contact" page to get names and email addresses</v-list-item-subtitle>
        </v-list-item>

        <v-list-item
          :href="councilSearchUrl"
          target="_blank"
          rel="noopener"
          prepend-icon="mdi-account-search"
          append-icon="mdi-open-in-new"
          rounded="lg"
        >
          <v-list-item-title class="font-weight-bold">Search for {{ place.municipality }} {{ officialsNoun }}</v-list-item-title>
          <v-list-item-subtitle v-if="cityWebsiteHost">Search {{ cityWebsiteHost }} for your {{ officialsNoun }}' names and contact info</v-list-item-subtitle>
          <v-list-item-subtitle v-else>Web search for your {{ officialsNoun }}' names and contact info</v-list-item-subtitle>
        </v-list-item>

        <v-list-item
          v-if="!place.legislators.length"
          :href="stateLegislatorUrl"
          target="_blank"
          rel="noopener"
          prepend-icon="mdi-domain"
          append-icon="mdi-open-in-new"
          rounded="lg"
        >
          <v-list-item-title class="font-weight-bold">Find your {{ place.state }} state legislators</v-list-item-title>
          <v-list-item-subtitle>State lawmakers can regulate ALPRs beyond your city limits</v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <div v-if="place.legislators.length" class="mt-4">
        <h4 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
          <v-icon color="primary" size="20" class="mr-2">mdi-domain</v-icon>
          Your {{ place.state }} state legislators
        </h4>

        <v-row dense>
          <v-col v-for="legislator in place.legislators" :key="legislator.openstatesUrl || legislator.name" cols="12" sm="6">
            <v-card variant="tonal" rounded="lg" class="pa-3 d-flex align-center h-100">
              <v-avatar size="56" color="surface" class="mr-3 flex-shrink-0">
                <v-img
                  v-if="legislator.image"
                  :src="legislator.image"
                  :alt="legislator.name"
                  referrerpolicy="no-referrer"
                  cover
                >
                  <template #error>
                    <v-icon size="32">mdi-account</v-icon>
                  </template>
                </v-img>
                <v-icon v-else size="32">mdi-account</v-icon>
              </v-avatar>

              <div class="flex-grow-1 overflow-hidden">
                <div class="text-body-1 font-weight-bold">{{ legislator.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ describeSeat(legislator) }}</div>
                <div class="mt-1 ml-n2">
                  <v-btn
                    v-if="legislator.email"
                    :href="`mailto:${legislator.email}`"
                    size="x-small"
                    variant="text"
                    color="primary"
                    prepend-icon="mdi-email"
                  >
                    Email
                  </v-btn>
                  <v-btn
                    v-if="legislator.phone"
                    :href="`tel:${legislator.phone}`"
                    size="x-small"
                    variant="text"
                    color="primary"
                    prepend-icon="mdi-phone"
                  >
                    Call
                  </v-btn>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <p class="text-caption text-medium-emphasis mt-2 mb-0">
          Legislator data and photos from <a href="https://openstates.org" target="_blank" rel="noopener">Open States</a>.
        </p>
      </div>

      <p class="text-caption text-medium-emphasis mt-3 mb-0">
        Not sure what to say? Use the sample email in step 1 below. Lookups use OpenStreetMap,
        Wikidata, and Open States; only your city — or, with the location button, a position
        rounded to about a kilometer — is ever sent, and nothing is stored.
      </p>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { geocodeQuery, geocodeMultiQuery, reverseGeocodeQuery, getOfficials, type Legislator } from '@/services/apiService';

interface GeocodeResult {
  addresstype: string;
  name: string;
  display_name: string;
  lat: string;
  lon: string;
  osm_type?: string;
  osm_id?: number;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    postcode?: string;
  };
}

interface FoundPlace {
  municipality: string;
  state: string;
  label: string;
  kind: 'city' | 'county';
  lat: string;
  lon: string;
  websiteUrl: string | null;
  legislators: Legislator[];
}

interface Suggestion {
  label: string;
  subtitle: string;
  result: GeocodeResult;
}

const query = ref('');
const committed = ref<Suggestion | string | null>(null);
const loading = ref(false);
const error = ref('');
const place = ref<FoundPlace | null>(null);

const suggestions = ref<Suggestion[]>([]);
const suggesting = ref(false);
const locating = ref(false);
const geolocationAvailable = 'geolocation' in navigator;

// Result types that ARE a municipality (or county) in their own right —
// safe to use directly for labels and the website lookup. Counties count:
// county commissions approve sheriff ALPR contracts.
const PLACE_TYPES = ['city', 'town', 'village', 'hamlet', 'municipality', 'borough', 'county'];

// Suggestions additionally allow neighborhoods and ZIPs, which resolve to
// their containing city on selection
const SUGGESTIBLE_TYPES = [...PLACE_TYPES, 'suburb', 'postcode'];

// "Newnan, Georgia" as the line you pick, with the county as secondary
// context underneath — the pattern location boxes generally follow
function toSuggestion(result: GeocodeResult): Suggestion {
  const state = result.address?.state ?? '';
  if (result.addresstype === 'postcode') {
    const city = [result.address?.city, state].filter(Boolean).join(', ');
    return { label: city || result.name, subtitle: `ZIP ${result.name}`, result };
  }
  return {
    label: [result.name, state].filter(Boolean).join(', '),
    subtitle: result.addresstype === 'county' ? 'County' : result.address?.county ?? '',
    result,
  };
}

const suggestionLabel = (result: GeocodeResult): string => toSuggestion(result).label;

let suggestTimer: ReturnType<typeof setTimeout> | null = null;
let suggestToken = 0;
let lastResolvedLabel = '';

// Nominatim's usage policy forbids per-keystroke autocomplete, so suggestions
// only fire after a pause, and go through the API's 24h geocode cache
watch(query, (value) => {
  if (suggestTimer) clearTimeout(suggestTimer);
  // Clear right away so a fast Enter can't select a suggestion from the
  // previous query
  suggestions.value = [];
  const q = (value ?? '').trim();
  if (q.length < 3 || q === lastResolvedLabel) {
    suggesting.value = false;
    return;
  }
  suggestTimer = setTimeout(async () => {
    const token = ++suggestToken;
    suggesting.value = true;
    try {
      const results: GeocodeResult[] = await geocodeMultiQuery(q, 'council');
      if (token !== suggestToken) return;
      const seen = new Set<string>();
      suggestions.value = results
        .filter((r) => SUGGESTIBLE_TYPES.includes(r.addresstype))
        .map(toSuggestion)
        .filter((s) => {
          const key = `${s.label}|${s.subtitle}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 5);
    } catch {
      if (token === suggestToken) suggestions.value = [];
    } finally {
      if (token === suggestToken) suggesting.value = false;
    }
  }, 600);
});

onUnmounted(() => {
  if (suggestTimer) clearTimeout(suggestTimer);
});

// Searching within the city's own domain lands directly on its council
// roster page, which has the names and emails no open API provides
const cityWebsiteHost = computed(() => {
  if (!place.value?.websiteUrl) return '';
  try {
    return new URL(place.value.websiteUrl).hostname;
  } catch {
    return '';
  }
});

// Counties are governed by commissioners, not a city council — and sheriff
// ALPR contracts run through the county commission. The municipality name
// already ends in "County" for counties, so the noun stays bare.
const officialsNoun = computed(() =>
  place.value?.kind === 'county' ? 'commissioners' : 'city council members'
);

const councilSearchUrl = computed(() => {
  if (!place.value) return '';
  const terms = cityWebsiteHost.value
    ? `${place.value.kind === 'county' ? 'county commissioners' : 'city council members'} contact site:${cityWebsiteHost.value}`
    : `${place.value.municipality} ${place.value.state} ${officialsNoun.value} contact`;
  return `https://duckduckgo.com/?q=${encodeURIComponent(terms)}`;
});

const stateLegislatorUrl = computed(() => {
  if (!place.value) return '';
  return `https://pluralpolicy.com/find-your-legislator/?lat=${place.value.lat}&lng=${place.value.lon}`;
});

const municipalityOf = (result: GeocodeResult): string =>
  result.address?.city || result.address?.town || result.address?.village || result.name;

const CHAMBER_LABELS: Record<string, string> = {
  upper: 'Senate',
  lower: 'House',
  legislature: 'Legislature',
};

const describeSeat = (legislator: Legislator): string => {
  const chamber = CHAMBER_LABELS[legislator.chamber] ?? legislator.chamber;
  const seat = [chamber, legislator.district && `District ${legislator.district}`].filter(Boolean).join(', ');
  return [legislator.party, seat].filter(Boolean).join(' · ');
};

async function fetchLegislators(result: GeocodeResult): Promise<Legislator[]> {
  try {
    return await getOfficials(result.lat, result.lon);
  } catch {
    // 404 when the server has no Open States key; the legislator link renders instead
    return [];
  }
}

// OSM and Wikidata tags are crowd-edited, so only ever link http(s) URLs;
// scheme-less values like "www.example.gov" are common in OSM and get https
function normalizeWebsite(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
  } catch {
    // fall through
  }
  return null;
}

async function fetchOfficialWebsite(result: GeocodeResult): Promise<string | null> {
  if (!result.osm_type || !result.osm_id) return null;
  try {
    const osmResponse = await fetch(
      `https://api.openstreetmap.org/api/0.6/${result.osm_type}/${result.osm_id}.json`
    );
    if (!osmResponse.ok) return null;
    const tags: Record<string, string> =
      (await osmResponse.json()).elements?.[0]?.tags ?? {};

    const tagged = normalizeWebsite(tags['website'] || tags['contact:website']);
    if (tagged) return tagged;

    if (tags['wikidata']) {
      const wikidataResponse = await fetch(
        `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${encodeURIComponent(tags['wikidata'])}&property=P856&format=json&origin=*`
      );
      if (!wikidataResponse.ok) return null;
      const claims = (await wikidataResponse.json()).claims?.P856 ?? [];
      const claim = claims.find((c: any) => c.rank !== 'deprecated');
      return normalizeWebsite(claim?.mainsnak?.datavalue?.value);
    }
  } catch {
    // Website is a nice-to-have; the search links below still work without it
  }
  return null;
}

async function resolveResult(initial: GeocodeResult) {
  loading.value = true;
  error.value = '';
  place.value = null;

  try {
    let result = initial;

    if (['state', 'country'].includes(result.addresstype)) {
      error.value = 'That looks like a whole state — try a specific city or town, like "Springfield, IL".';
      return;
    }

    // Anything that isn't itself a municipality — a ZIP centroid, a street
    // address, a neighborhood — names its containing city in the address, so
    // resolve that instead. Crucially, a road or building's own OSM website
    // tag (a business, a transit agency) must never pass as the city's.
    if (!PLACE_TYPES.includes(result.addresstype)) {
      const containingCity = result.address?.city || result.address?.town || result.address?.village;
      if (containingCity && result.address?.state) {
        try {
          result = await geocodeQuery(`${containingCity}, ${result.address.state}`);
        } catch {
          // Keep the original result; the search links still work from it
        }
      }
    }

    const municipality = municipalityOf(result);
    const state = result.address?.state ?? '';
    const label = state ? `${municipality}, ${state}` : municipality;

    lastResolvedLabel = query.value.trim();
    suggestions.value = [];

    // Only a municipality's own OSM element can vouch for its website
    const [websiteUrl, legislators] = await Promise.all([
      PLACE_TYPES.includes(result.addresstype) ? fetchOfficialWebsite(result) : Promise.resolve(null),
      fetchLegislators(result),
    ]);

    place.value = {
      municipality,
      state,
      label,
      kind: result.addresstype === 'county' ? 'county' : 'city',
      lat: result.lat,
      lon: result.lon,
      websiteUrl,
      legislators,
    };
  } catch {
    error.value = 'We couldn\'t find that location. Try "City, ST" or a 5-digit ZIP code.';
  } finally {
    loading.value = false;
  }
}

async function search() {
  const q = query.value.trim();
  if (!q || loading.value) return;

  loading.value = true;
  error.value = '';
  try {
    const result: GeocodeResult = await geocodeQuery(q);
    loading.value = false;
    await resolveResult(result);
  } catch {
    loading.value = false;
    place.value = null;
    error.value = 'We couldn\'t find that location. Try "City, ST" or a 5-digit ZIP code.';
  }
}

// The combobox also commits typed text as string model updates (on keystrokes
// and blur); those must not trigger anything — free-text searches happen only
// via Enter or the button. Only a suggestion picked from the menu resolves here.
function onInputCommit(value: unknown) {
  if (loading.value) return;
  if (value && typeof value === 'object' && 'result' in value) {
    resolveResult((value as Suggestion).result);
  }
}

function useMyLocation() {
  if (!geolocationAvailable || locating.value) return;
  locating.value = true;
  error.value = '';

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        // Round to ~1 km before the coordinates leave the browser; the city
        // is all we need, never the exact position
        const lat = Number(position.coords.latitude.toFixed(2));
        const lon = Number(position.coords.longitude.toFixed(2));
        const result: GeocodeResult = await reverseGeocodeQuery(lat, lon);
        query.value = suggestionLabel(result);
        await resolveResult(result);
      } catch {
        error.value = 'We couldn\'t figure out your city — try typing it instead.';
      } finally {
        locating.value = false;
      }
    },
    () => {
      locating.value = false;
      error.value = 'Location permission was denied — type your city instead.';
    },
    { timeout: 10000, maximumAge: 600000 }
  );
}
</script>

<style scoped>
.contact-links .v-list-item {
  margin-bottom: 4px;
}
</style>
