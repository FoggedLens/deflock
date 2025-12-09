<template>
  <v-row class="align-center justify-center my-4">
      <v-col cols="12" sm="6" class="text-center">
        <v-select
          color="rgb(18, 151, 195)"
          :prepend-inner-icon="CompanyIcon"
          v-model="selectedBrand"
          :items="alprBrands"
          item-title="nickname"
          return-object
          label="Choose a Manufacturer"
          variant="outlined"
          flat
          hide-details
        ></v-select>
        <v-img
          :aspect-ratio="3/2"
          cover
          v-if="selectedBrand"
          :src="selectedBrand.exampleImage"
          :alt="selectedBrand.nickname"
          max-width="100%"
          class="my-4"
        ></v-img>
        <v-btn to="/identify" color="#1297C3" variant="tonal" size="small"><v-icon start><ImageMultipleIcon /></v-icon> See All Photos</v-btn>
      </v-col>
    
      <v-col cols="12" sm="6">
        <h3 class="text-center serif">Tags to Copy</h3>
        <DFCode>
          man_made=surveillance<br>
          surveillance:type=ALPR<br>
          camera:type=fixed<br>
          <span v-if="selectedBrand.name">manufacturer=<span :class="highlightClass(selectedBrand)">{{ selectedBrand.name }}</span><br></span>
          <span v-if="selectedBrand.wikidata">manufacturer:wikidata=<span :class="highlightClass(selectedBrand)">{{ selectedBrand.wikidata }}</span><br></span>
        </DFCode>

        <h5 class="text-center mt-4 serif">and if operator is known</h5>
        <DFCode :show-copy-button="false">
          operator=<span class="placeholder">[Enter operator name]</span><br>
          operator:wikidata=<span class="placeholder">[Enter WikiData ID]</span>
        </DFCode>
        <div class="text-caption text-center mt-1">
          <a href="https://www.wikidata.org/wiki/Wikidata:Main_Page" target="_blank" rel="noopener" class="text-decoration-none text-grey-darken-1">
            What is WikiData? <v-icon size="x-small"><OpenInNewIcon /></v-icon>
          </a>
        </div>
      </v-col>
    </v-row>
</template>

<script setup lang="ts">
import DFCode from '@/components/DFCode.vue';
import { ref, type Ref } from 'vue';
import type { WikidataItem } from '@/types';

import CompanyIcon from '@iconify-vue/mdi/company';
import ImageMultipleIcon from '@iconify-vue/mdi/image-multiple';
import OpenInNewIcon from '@iconify-vue/mdi/open-in-new';

const alprBrands: WikidataItem[] = [
  {
    name: 'Flock Safety',
    nickname: 'Flock',
    wikidata: 'Q108485435',
    exampleImage: '/alprs/flock-1.jpg',
  },
  {
    name: 'Motorola Solutions',
    nickname: 'Motorola/Vigilant',
    wikidata: 'Q634815',
    exampleImage: '/alprs/motorola-4.jpg',
  },
  {
    name: 'Genetec',
    nickname: 'Genetec',
    wikidata: 'Q30295174',
    exampleImage: '/alprs/genetec-3.webp',
  },
  {
    name: 'Leonardo',
    nickname: 'Leonardo/ELSAG',
    wikidata: 'Q910379',
    exampleImage: '/alprs/elsag-1.jpg',
  },
  {
    name: 'Neology, Inc.',
    nickname: 'Neology',
    wikidata: undefined,
    exampleImage: '/alprs/neology-2.jpg',
  },
  {
    name: undefined,
    nickname: 'Other',
    wikidata: undefined,
    exampleImage: '/other-1.jpeg',
  }
];
const selectedBrand: Ref<WikidataItem> = ref(alprBrands[0]);

function highlightClass(item: WikidataItem): string {
  return item.nickname === 'Other' ? 'placeholder' : 'highlight';
}

</script>

<style scoped>
.highlight {
  background-color: #0081ac;
  padding: 0.15rem;
  border-radius: 0.25rem;
  font-weight: bold;
}

.placeholder {
  background-color: #ffe066;
  color: #333;
  padding: 0.15rem;
  border-radius: 0.25rem;
  font-weight: bold;
  font-style: italic;
}

.info-icon {
  cursor: help;
}

.overlay {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 1);
  color: white;
  /* font-family: 'Courier New', Courier, monospace; */
  font-weight: bold;
  text-transform: uppercase;
  font-size: 1.2rem;
}

.selected {
  border: 4px solid #75ddff;
}
</style>
