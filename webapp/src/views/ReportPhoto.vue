<template>
  <v-container>
    <v-dialog
      v-model="showLoginDialog"
      persistent
    >
      <v-card>
        <v-card-title class="text-center">Account Required</v-card-title>
        <v-card-text>
          <p>
            To report an ALPR, you must be logged in. Please log in to continue.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="loginWithPopup">Log In/Sign Up</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <div>
      <v-card>
        <v-card-title>
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
          ></v-file-input>
          
          <v-alert
            v-if="errorMessage"
            type="error"
            dismissible
          >
            <span>{{ errorMessage }}</span>
            <p>If you continue to experience issues, try <router-link to="/report">manually reporting</router-link>.</p>
          </v-alert>

          <v-alert
            v-else-if="areAllImagesGeotagged"
            type="success"
            dismissible
          >
            Found Geotags!
          </v-alert>

          <v-checkbox
            v-model="agree"
            label="I agree this information is accurate"
          ></v-checkbox>
        </div>
        </v-card-text>
        <v-card-actions>
          <span class="pl-4 text-grey-darken-1">Submitting as {{ user?.name }}</span>
          <v-spacer/>
          <v-btn color="primary" @click="upload" :disabled="!canSubmit">Submit</v-btn>
        </v-card-actions>
      </v-card>

      <v-divider class="my-8">OR</v-divider>

      <v-card>
        <v-card-title>Report Manually</v-card-title>
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

const agree = ref(false);
const files = ref<File[]>([]);
const errorMessage = ref('');
const areAllImagesGeotagged = ref(false);
const showLoginDialog = ref(false); // TODO: changeme
const presignedUrls = ref<string[]>([]);

// watch(isAuthenticated, async (isAuthenticated) => {
//   if (isAuthenticated) {
//     showLoginDialog.value = false;
//   } else {
//     showLoginDialog.value = true;
//   }
// });

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

const canSubmit = computed(() => {
  return agree.value && files.value.length > 0 && areAllImagesGeotagged.value;
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

  // fetch presigned urls ahead of time to save time
  getPresignedUrls(files.value.length, files.value[0].type, 'CHANGE_ME_PLEASE!!').then((urls) => {
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
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
    });

    console.log(response);

    if (response.ok) {
      console.log('File uploaded successfully');
    } else {
      console.error('Failed to upload file');
    }
  });
}

</script>
