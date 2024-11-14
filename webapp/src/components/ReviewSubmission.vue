<template>
  <v-card>
    <v-card-title class="text-center">Review Submission</v-card-title>
    <v-card-subtitle class="text-center">by {{ submission.author }}</v-card-subtitle>
    <v-card-text>

      <v-row class="align-center">
        <v-col cols="12" sm="6">
          <v-card flat v-if="isConverting">
            <v-card-title>Converting from HEIC</v-card-title>
            <v-card-text>
              <v-progress-linear indeterminate color="primary"></v-progress-linear>
            </v-card-text>
          </v-card>
          <v-img v-else cover ref="imageEl" :src="imageSrc"/>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="d-flex flex-column justify-space-between">
            <v-btn class="my-4" variant="outlined" target="_blank" :href="googleMapsUrl"><v-icon start>mdi-earth</v-icon>Google Maps</v-btn>
            <v-btn class="my-4" variant="outlined" target="_blank" :href="osmEditUrl"><v-icon start>mdi-pencil</v-icon>Edit on OSM</v-btn>
            <v-btn class="my-4" variant="outlined" @click="copyCoordsToClipboard"><v-icon start>mdi-content-copy</v-icon>Copy Coordinates</v-btn>
            <v-btn class="my-4 text-grey-darken-3" variant="text" @click="showInstructions = !showInstructions"><v-icon start>mdi-eye-outline</v-icon>
              {{ showInstructions ? 'Hide Instructions' : 'Show Instructions' }}
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-expand-transition>
        <div v-show="showInstructions" class="px-4 mt-4">
          <ol>
        <li>Verify image has an ALPR</li>
        <li>Check Google Maps Street View</li>
        <li>If starting an editing session, click <i>Edit on OSM</i></li>
        <li>For existing session, copy coordinates and paste into <i>Search Features</i> on OSM</li>
          </ol>
        </div>
      </v-expand-transition>
    </v-card-text>
    
    <v-card-actions>
      <v-btn @click="cancel">Cancel</v-btn>
      <v-spacer />
      <v-btn @click="deleteSubmission" color="error">Reject</v-btn>
      <v-btn @click="deleteSubmission" color="primary">Mark as Added</v-btn>
    </v-card-actions>

  </v-card>
</template>

<script setup lang="ts">
import type { PropType, Ref } from 'vue';
import { computed, defineProps, ref, defineEmits, onMounted } from 'vue';
import type { Submission } from '@/types';
import ExifReader from 'exifreader';
import heic2any from "heic2any";

const emit = defineEmits(['cancel', 'delete']);

const lat: Ref<number|null> = ref(null);
const lng: Ref<number|null> = ref(null);
const isHeic = computed(() => props.submission.objectKey.endsWith('.heic'));
const pngSrc: Ref<string|undefined> = ref(undefined);
const isConverting = computed(() => isHeic.value && !pngSrc.value);

const imageSrc = computed(() => isHeic.value ? pngSrc.value : props.submission.publicUrl);

const showInstructions = ref(false);

function cancel() {
  emit('cancel');
}

function deleteSubmission() {
  emit('delete', props.submission);
}

onMounted(() => {
  loadExif()
});

const loadExif = async () => {
  const response = await fetch(props.submission.publicUrl);
  const arrayBuffer = await response.arrayBuffer();
  const tags = ExifReader.load(arrayBuffer);

  if (isHeic.value) {
    console.log('Converting HEIC to PNG');
    heic2any({
      blob: new Blob([arrayBuffer], { type: 'image/heic' }),
    }).then((result: Blob | Blob[]) => {
      if (Array.isArray(result)) {
        pngSrc.value = URL.createObjectURL(result[0]);
      } else {
        pngSrc.value = URL.createObjectURL(result);
      }
    });
  } else {
    console.log('Image is not HEIC');
  }

  if (tags.GPSLatitude && tags.GPSLongitude) {
    lat.value = parseFloat(tags.GPSLatitude.description);
    lng.value = parseFloat(tags.GPSLongitude.description);

    // Check the GPSLongitudeRef to determine if it's east or west
    if (tags.GPSLongitudeRef && tags.GPSLongitudeRef.description.startsWith('W')) {
      lng.value = -lng.value;
    }

    // Check the GPSLatitudeRef to determine if it's north or south
    if (tags.GPSLatitudeRef && tags.GPSLatitudeRef.description.startsWith('S')) {
      lat.value = -lat.value;
    }
  } else {
    console.error('No GPS data found in the image.');
  }

  // const hasCoordinates = !!(tags.GPSLatitude && tags.GPSLongitude);
  // if (!hasCoordinates) {
  //   allGeotagged = false;
  //   errorMessage.value = 'One or more images do not have GPS coordinates';
  //   break;
  // }
};

const googleMapsUrl = computed(() =>
  lat.value && lng.value ?
  `https://www.google.com/maps/place/${lat.value},${lng.value}/@${lat.value},${lng.value},17z/data=!3m1!1e3` :
  ''
);

const osmEditUrl = computed(() =>
  lat.value && lng.value ?
  `https://www.openstreetmap.org/edit?editor=id&lat=${lat.value}&lon=${lng.value}&zoom=17` :
  ''
);

const copyCoordsToClipboard = () => {
  navigator.clipboard.writeText(`${lat.value}, ${lng.value}`);
};

const props = defineProps({
  submission: {
    required: true,
    type: Object as PropType<Submission>,
  }
});


</script>
