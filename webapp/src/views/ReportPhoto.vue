<template>
  <v-container>

    <h2 class="text-center mb-4">Report an ALPR</h2>
    
    <div>
      <div style="position: relative">
        <v-overlay :model-value="!isAuthenticated" persistent contained class="d-flex flex-column align-center justify-center">
          <div>
            <v-card class="text-center" style="max-width: 90%; margin: auto;">
              <v-card-title>
                Login Required
              </v-card-title>
              <v-card-text>
                Use the Log In button above to report an ALPR using a photo.
              </v-card-text>
            </v-card>
          </div>
        </v-overlay>
        <v-card>
          <v-card-title>
            <v-icon>mdi-camera-marker</v-icon>
            Report with a Geotagged Photo
          </v-card-title>
          <v-card-text>
            <p>
              If you snapped a picture of an ALPR your phone, you can upload it here where it will be reviewed and added to the map.
            </p>
            <div class="mt-8">
            <v-file-input
              v-model="files"
              accept="image/*,.heif,.heic"
              label="Upload Photos"
              prepend-icon="mdi-camera"
              multiple
              show-size
              counter
              @update:model-value="checkGeotagging"
              hint="Up to 5 photos at once, 1 photo per ALPR"
              persistent-hint
            ></v-file-input>
            
            <v-alert
              v-if="errorMessage"
              type="error"
              dismissible
              class="mt-2"
            >
              <span>{{ errorMessage }}</span>
              <p>If you continue to experience issues, try <router-link style="color: white" to="/report">manually reporting</router-link>.</p>
            </v-alert>
  
            <v-alert
              v-else-if="areAllImagesGeotagged"
              type="success"
              dismissible
            >
              Found Geotags!
            </v-alert>
          </div>
          </v-card-text>
          <v-card-actions>
            <span class="pl-4 text-grey-darken-1">Submitting as {{ user?.name }}</span>
            <v-spacer/>
            <v-btn :loading="isSubmitting" color="primary" @click="upload" :disabled="!canSubmit">Submit</v-btn>
          </v-card-actions>
        </v-card>
      </div>

      <v-divider class="my-8">OR</v-divider>

      <v-card>
        <v-card-title>
          <v-icon>mdi-typewriter</v-icon>
          Report Manually
        </v-card-title>
        <v-card-text>
          <p class=mb-4>
            If you don't have a geotagged photo, you can report manually by providing the location and a description of the ALPR.
          </p>
          <v-btn color="primary" to="/report">Report Manually</v-btn>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import ExifReader from 'exifreader';
import { ref, computed, onMounted, watch } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { getPresignedUrls } from '@/services/apiService';

const { loginWithPopup, user, isAuthenticated } = useAuth0();

const files = ref<File[]>([]);
const errorMessage = ref('');
const areAllImagesGeotagged = ref(false);
const showLoginDialog = ref(false); // TODO: changeme
const presignedUrls = ref<string[]>([]);
const isSubmitting = ref(false);

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

const canSubmit = computed(() => {
  return files.value.length > 0 && areAllImagesGeotagged.value && !isSubmitting.value;
});

const checkGeotagging = async () => {
  if (!files.value.length) {
    areAllImagesGeotagged.value = false;
    errorMessage.value = '';
    return;
  }

  if (files.value.some(file => file.size > MAX_FILE_SIZE)) {
    errorMessage.value = `Each file must be smaller than ${MAX_FILE_SIZE / (1024 * 1024)} MB.`;
    areAllImagesGeotagged.value = false;
    return;
  }

  if (files.value.length > 5) {
    errorMessage.value = 'You can only upload up to 5 files at a time.';
    areAllImagesGeotagged.value = false;
    return;
  }

  if (files.value.map(f => f.type).some(type => type !== files.value[0].type)) {
    errorMessage.value = 'All files must be of the same type. Temporary technical limitation.';
    areAllImagesGeotagged.value = false;
    return;
  }

  // Fetch presigned urls ahead of time
  getPresignedUrls(files.value.length, files.value[0].type, 'willfreeman').then((urls) => {
    presignedUrls.value = urls;
  });

  let allGeotagged = true;
  for (const file of files.value) {
    try {
      const tags = await ExifReader.load(file);
      const hasCoordinates = !!(tags.GPSLatitude && tags.GPSLongitude);
      if (!hasCoordinates) {
        allGeotagged = false;
        errorMessage.value = 'One or more images do not have GPS coordinates';
        break;
      }
    } catch (error) {
      allGeotagged = false;
      errorMessage.value = 'Error reading EXIF data from one or more images';
      break;
    }
  }
  areAllImagesGeotagged.value = allGeotagged;
  if (allGeotagged) {
    errorMessage.value = '';
  }
};

async function upload() {
  if (presignedUrls.value.length !== files.value.length) {
    console.error('Presigned URLs not fetched yet');
    return;
  }

  files.value.forEach(async (file, index) => {
    const presignedUrl = presignedUrls.value[index];
    isSubmitting.value = true;
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
    });
    isSubmitting.value = false;

    if (response.ok) {
      console.log('File uploaded successfully');
      files.value = [];
      areAllImagesGeotagged.value = false;
    } else {
      console.error('Failed to upload file');
    }
  });
}

</script>
