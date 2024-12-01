<template>
  <div class="qr-landing-container">
    <v-container class="text-center">
      <v-card class="info-card">
        <!-- Welcome Section -->
        <v-card-text>
          <h1>Welcome to DeFlock</h1>
          <p>
            You’ve discovered an Automated License Plate Reader (ALPR) camera! These sophisticated surveillance devices capture detailed images of all passing vehicles, recording not only license plate numbers but often additional details such as the make, model, color, and physical characteristics of the car. Each scan is timestamped and geotagged, documenting the vehicle's exact location, date, and time. ALPRs are designed to gather vast amounts of data, tracking the movements of millions of vehicles daily—regardless of whether the driver has committed or is suspected of committing any crime.
          </p>
        </v-card-text>

        <!-- ALPR Information Section -->
        <v-card-title class="headline">
          <v-icon x-large class="icon">mdi-camera</v-icon>
          ALPR Information
        </v-card-title>
        <v-card-text v-if="closestALPR">
          <p>
            You scanned a QR code for an Automatic License Plate Reader (ALPR) in this area. Here's what we know:
          </p>
          <ul class="details-list">
            <li><strong>ID:</strong> {{ closestALPR.id }}</li>
            <li><strong>Location:</strong> {{ closestALPR.lat.toFixed(6) }}, {{ closestALPR.lon.toFixed(6) }}</li>
            <!-- Perhaps show cluster information here? -->
          </ul>
          <v-btn @click="goToMap" color="primary">
            See More on the Map
            <v-icon end>mdi-map</v-icon>
          </v-btn>
        </v-card-text>
        <v-card-text v-else>
          <p>Unable to locate the nearest ALPR. Please ensure location permissions are enabled and try again.</p>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { BoundingBox, getALPRs } from '@/services/apiService';
import type { ALPR } from '@/types';

const router = useRouter();
const userLocation = ref<[number, number] | null>(null);
const closestALPR = ref<ALPR | null>(null);

async function fetchUserLocation(): Promise<[number, number]> {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          reject(error);
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
        }
      );
    } else {
      reject(new Error('Geolocation is not supported by this browser.'));
    }
  });
}

async function findClosestALPR() {
  try {
    const [lat, lon] = await fetchUserLocation();
    userLocation.value = [lat, lon];
    const bounds: Ref<BoundingBox|null> = ref(null);
    const newBoundingBox = new BoundingBox({
      minLat: lat - 0.0005,
      maxLat: lat + 0.0005,
      minLng: lon - 0.0005,
      maxLng: lon + 0.0005,
    });
    bounds.value = newBoundingBox;
    
    // Fetch ALPRs within a 0.001 x 0.001 degree bounding box
    const result = await getALPRs(bounds.value);
    
    // Find the closest ALPR to the user's location
    closestALPR.value = result.elements.reduce((prev: ALPR | null, curr: ALPR) => {
      if (!prev) return curr;
      
      // Calculate the distance between the user's location and the ALPR
      const prevDist = Math.hypot(prev.lat - lat, prev.lon - lon);
      
      // Compare the distances and return the closest ALPR
      const currDist = Math.hypot(curr.lat - lat, curr.lon - lon);
      
      // Return the ALPR with the shortest distance to the user
      return currDist < prevDist ? curr : prev;
    }, null);
  } catch (error) {
    console.debug('Error fetching ALPRs or user location:', error);
  }
}

function goToMap() {
  if (closestALPR.value) {
    const { lat, lon } = closestALPR.value;
    router.push({ path: '/', hash: `#map=16/${lat.toFixed(6)}/${lon.toFixed(6)}` });
  }
}

onMounted(findClosestALPR);
</script>

<style scoped>
.qr-landing-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100dvh;
  background-color: var(--v-theme-background);
}

.info-card {
  max-width: 600px;
  padding: 20px;
  box-shadow: var(--v-shadow-4);
}

.details-list {
  text-align: left;
  padding-left: 20px;
}

.icon {
  margin-right: 8px;
  color: var(--v-theme-primary);
}
</style>
