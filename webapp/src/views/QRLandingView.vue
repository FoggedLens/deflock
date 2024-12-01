<template>
  <div class="qr-landing-container">
    <v-container class="text-center">
      <v-card class="info-card">
        <!-- Welcome Section -->
        <v-card-text>
          <h1>Welcome to DeFlock</h1>
          <p>
            You’ve discovered an Automated License Plate Reader (ALPR) camera! These surveillance devices capture detailed images of all passing vehicles, recording not only license plate numbers but often additional details such as the make, model, color, and physical characteristics of the car. Each scan is timestamped and geotagged, documenting the vehicle's exact location, date, and time. ALPRs are designed to gather vast amounts of data, tracking the movements of millions of vehicles daily—regardless of whether the driver has committed or is suspected of committing any crime.
          </p>
        </v-card-text>

        <!-- ALPR Information Section -->
        <v-card-title class="headline">
          <v-icon x-large class="icon">mdi-camera</v-icon>
          ALPR Location
        </v-card-title>
        <v-card-text>
          <v-btn @click="goToMap" color="primary">
            See More on the Map
            <v-icon end>mdi-map</v-icon>
          </v-btn>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userLocation = ref<[number, number] | null>(null);

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

async function getUserLocation() {
  try {
    const [lat, lon] = await fetchUserLocation();
    userLocation.value = [lat, lon];
  } catch (error) {
    console.debug('Error fetching user location:', error);
  }
}

function goToMap() {
  if (userLocation.value) {
    const [lat, lon] = userLocation.value;
    router.push({ path: '/', hash: `#map=10/${lat.toFixed(6)}/${lon.toFixed(6)}` });
  }
}

onMounted(getUserLocation);
</script>

<style scoped>
.qr-landing-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>