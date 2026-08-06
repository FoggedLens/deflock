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
        <v-text-field
          v-model="query"
          label="Your city or ZIP code"
          placeholder="Springfield, IL"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          class="flex-grow-1"
          :disabled="loading"
        />
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
          <v-list-item-subtitle>Look for a "City Council", "Mayor", or "Contact" page to get names and email addresses</v-list-item-subtitle>
        </v-list-item>

        <v-list-item
          :href="councilSearchUrl"
          target="_blank"
          rel="noopener"
          prepend-icon="mdi-account-search"
          append-icon="mdi-open-in-new"
          rounded="lg"
        >
          <v-list-item-title class="font-weight-bold">Search for {{ place.municipality }} council members</v-list-item-title>
          <v-list-item-subtitle v-if="cityWebsiteHost">Search {{ cityWebsiteHost }} for your council members' names and contact info</v-list-item-subtitle>
          <v-list-item-subtitle v-else>Web search for your council members' names and contact info</v-list-item-subtitle>
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
        Wikidata, and Open States; your city name is the only thing sent, and nothing is stored.
      </p>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { geocodeQuery, getOfficials, type Legislator } from '@/services/apiService';

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
  lat: string;
  lon: string;
  websiteUrl: string | null;
  legislators: Legislator[];
}

const query = ref('');
const loading = ref(false);
const error = ref('');
const place = ref<FoundPlace | null>(null);

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

const councilSearchUrl = computed(() => {
  if (!place.value) return '';
  const terms = cityWebsiteHost.value
    ? `city council members contact site:${cityWebsiteHost.value}`
    : `${place.value.municipality} ${place.value.state} city council members contact`;
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

async function fetchOfficialWebsite(result: GeocodeResult): Promise<string | null> {
  if (!result.osm_type || !result.osm_id) return null;
  try {
    const osmResponse = await fetch(
      `https://api.openstreetmap.org/api/0.6/${result.osm_type}/${result.osm_id}.json`
    );
    if (!osmResponse.ok) return null;
    const tags: Record<string, string> =
      (await osmResponse.json()).elements?.[0]?.tags ?? {};

    const tagged = tags['website'] || tags['contact:website'];
    if (tagged) return tagged;

    if (tags['wikidata']) {
      const wikidataResponse = await fetch(
        `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${encodeURIComponent(tags['wikidata'])}&property=P856&format=json&origin=*`
      );
      if (!wikidataResponse.ok) return null;
      const claims = (await wikidataResponse.json()).claims?.P856 ?? [];
      const claim = claims.find((c: any) => c.rank !== 'deprecated');
      return claim?.mainsnak?.datavalue?.value ?? null;
    }
  } catch {
    // Website is a nice-to-have; the search links below still work without it
  }
  return null;
}

async function search() {
  const q = query.value.trim();
  if (!q) return;

  loading.value = true;
  error.value = '';
  place.value = null;

  try {
    let result: GeocodeResult = await geocodeQuery(q);

    if (['state', 'country'].includes(result.addresstype)) {
      error.value = 'That looks like a whole state — try a specific city or town, like "Springfield, IL".';
      return;
    }

    // A ZIP resolves to a postcode point with no municipality boundary, so
    // geocode the city it belongs to for the website lookup
    if (result.addresstype === 'postcode' && result.address?.city && result.address?.state) {
      try {
        result = await geocodeQuery(`${result.address.city}, ${result.address.state}`);
      } catch {
        // Keep the postcode result; the search links still work from it
      }
    }

    const municipality = municipalityOf(result);
    const state = result.address?.state ?? '';

    const [websiteUrl, legislators] = await Promise.all([
      fetchOfficialWebsite(result),
      fetchLegislators(result),
    ]);

    place.value = {
      municipality,
      state,
      label: state ? `${municipality}, ${state}` : municipality,
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
</script>

<style scoped>
.contact-links .v-list-item {
  margin-bottom: 4px;
}
</style>
