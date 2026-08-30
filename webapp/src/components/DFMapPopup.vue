<template>
  <v-sheet min-width="240" role="dialog" aria-labelledby="df-map-popup-heading">
    <h2 id="df-map-popup-heading" tabindex="-1" class="text-subtitle-1 font-weight-bold px-4 pt-3">
      Camera details
    </h2>
    <!--  TODO: if a field is unknown, prompt user to edit it -->
    <div class="position-relative">
      <v-img v-if="imageUrl" cover width="100%" height="150px" :src="imageUrl" :alt="cameraImageAlt" class="rounded mt-5" position="top" />
      <div v-if="imageUrl" class="position-absolute bottom-0 left-0 right-0 text-center text-white text-caption" style="background: rgba(0, 0, 0, 0.5);">
        {{ manufacturer }} {{ manufacturer.endsWith(' LPR') ? '' : ' LPR' }}
      </div>
    </div>
    <v-list density="compact" class="my-2">
      <v-list-item v-if="abbreviatedOperator">
        <template v-slot:prepend>
          <v-icon icon="mdi-police-badge"></v-icon>
        </template>

        <v-list-item-subtitle style="font-size: 1em">
          Operated by
        </v-list-item-subtitle>
        
        <b>
          <span style="font-size: 1.25em">
            {{ abbreviatedOperator ?? 'Unknown' }}
          </span>
        </b>
      </v-list-item>

      <v-divider v-if="abbreviatedOperator" class="my-2" />

      <v-list-item>
        <template v-slot:prepend>
          <v-icon icon="mdi-factory"></v-icon>
        </template>

        <v-list-item-subtitle style="font-size: 1em">
          Made by
        </v-list-item-subtitle>
        
        <b>
          <span style="font-size: 1.25em">
            {{ manufacturer }}
          </span>
        </b>
      </v-list-item>
    </v-list>

    <div class="text-center">
      <v-btn target="_blank" size="x-small" :href="osmNodeLink(props.alpr.id)" variant="text" color="grey"><v-icon start>mdi-open-in-new</v-icon>View on OSM</v-btn>
      <v-btn v-if="wikimediaImages" target="_blank" size="x-small" :href="wikimediaImages.wiki" variant="text" color="grey"><v-icon start>mdi-image</v-icon>View image</v-btn>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import type { PropType } from 'vue';
import type { ALPR } from '@/types';
import { VIcon, VList, VSheet, VListItem, VBtn, VImg, VListItemSubtitle, VDivider } from 'vuetify/components';
import { useVendorStore } from '@/stores/vendorStore';
import { md5 } from 'js-md5';
import { getCameraManufacturer, getCameraOperator } from './mapAccessibility';

const props = defineProps({
  alpr: {
    type: Object as PropType<ALPR>,
    required: true
  }
});

const manufacturer = computed(() => getCameraManufacturer(props.alpr.tags) || 'Unknown');

const store = useVendorStore();
const vendorImageUrl = ref<string | undefined | null>(undefined);

onMounted(async () => {
  const url = await store.getFirstImageForManufacturer(manufacturer.value as string);
  if (url) vendorImageUrl.value = url;
});

const imageUrl = computed(() => {
  return wikimediaImages.value?.thumbnail ?? vendorImageUrl.value;
});

const cameraImageAlt = computed(() => (
  manufacturer.value === 'Unknown' ? 'Camera' : `${manufacturer.value} camera`
));

const abbreviatedOperator = computed(() => {
  const operator = getCameraOperator(props.alpr.tags);
  if (!operator) {
    return undefined;
  }

  const replacements: Record<string, string> = {
    "Police Department": "PD",
    "Sheriff's Office": "SO",
    "Sheriffs Office": "SO",
  };

  for (const [full, abbr] of Object.entries(replacements)) {
    if (operator.includes(full)) {
      return operator.replace(full, abbr);
    }
  }
  return operator;
});

const wikimediaImages = computed(() => {
  if (!props.alpr.tags.hasOwnProperty("wikimedia_commons")) {
    return;
  }
  const filename = props.alpr.tags["wikimedia_commons"];
  const thumbnailWidth = 300;

  const cleanFilename = filename.replace(/^File:/, '').replace(/ /g, '_');

  const md5Hash = md5(cleanFilename);
  const hashPath = `${md5Hash[0]}/${md5Hash.slice(0, 2)}`;
  
  const encodedFilename = encodeURIComponent(cleanFilename);
  
  const wiki = `https://commons.wikimedia.org/wiki/${encodeURIComponent(filename)}`;
  const thumbnail = `https://upload.wikimedia.org/wikipedia/commons/thumb/${hashPath}/${encodedFilename}/${thumbnailWidth}px-${encodedFilename}`;

  return { wiki, thumbnail };
});

function osmNodeLink(id: string): string {
  return `https://www.openstreetmap.org/node/${id}`;
}
</script>
