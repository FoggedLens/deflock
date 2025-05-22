<template>
  <v-row class="align-center justify-center my-4">
      <v-col cols="12" sm="6" class="text-center">
        <v-select
          color="rgb(18, 151, 195)"
          prepend-inner-icon="mdi-factory"
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
        <v-btn to="/what-is-an-alpr#photos" color="grey-darken-2" variant="text" size="small"><v-icon start>mdi-image-multiple</v-icon> See All Photos</v-btn>
      </v-col>
    
      <v-col cols="12" sm="6">
        <h3 class="text-center serif">Tags to Copy</h3>
        <DFCode>
          man_made=surveillance<br>
          surveillance:type=ALPR<br>
          camera:mount=pole<br>
          camera:type=fixed<br>
          surveillance=public<br>
          surveillance:zone=traffic<br>
          manufacturer=<span class="highlight">{{ selectedBrand.name }}</span><br>
          manufacturer:wikidata=<span class="highlight">{{ selectedBrand.wikidata }}</span><br>
        </DFCode>

        <h5 class="text-center mt-4 serif">and if operator is known</h5>
        <DFCode>
          operator=<span class="highlight">(Police Dept/Owner)</span><br>
          operator:wikidata=<span class="highlight">(WikiData ID)</span><br>
        </DFCode>
      </v-col>
    </v-row>
</template>

<script setup lang="ts">
import DFCode from '@/components/DFCode.vue';
import { ref, type Ref } from 'vue';
import type { WikidataItem } from '@/types';

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
    wikidata: 'Q130958232',
    exampleImage: '/alprs/neology-2.jpg',
  },
  {
    name: '(brand goes here)',
    nickname: 'Other',
    wikidata: '(wikidata goes here)',
    exampleImage: '/other-1.jpeg',
  }
];
const selectedBrand: Ref<WikidataItem> = ref(alprBrands[0]);

</script>

<style scoped>
.highlight {
  background-color: #0081ac;
  padding: 0.15rem;
  border-radius: 0.25rem;
  font-weight: bold;
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
