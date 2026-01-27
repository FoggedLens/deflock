<template>
  <v-row class="align-center justify-center my-4">
      <v-col cols="12" sm="6" class="text-center">
        <v-select
          color="rgb(18, 151, 195)"
          prepend-inner-icon="mdi-factory"
          v-model="selectedLprVendor"
          :items="lprVendors"
          item-title="shortName"
          return-object
          label="Choose a Manufacturer"
          variant="outlined"
          flat
          hide-details
        ></v-select>
        <v-img
          :aspect-ratio="3/2"
          cover
          v-if="selectedLprVendor?.urls?.length"
          :src="selectedLprVendor.urls[0]?.url"
          :alt="selectedLprVendor.shortName + ' LPR'"
          max-width="100%"
          class="my-4"
        />
        <v-responsive :aspect-ratio="3/2" class="my-4" v-else>
          <div class="d-flex align-center justify-center fill-height">
            <v-icon size="96" color="grey lighten-1" aria-hidden="true">mdi-image-off</v-icon>
          </div>
        </v-responsive>
        <v-btn to="/identify" color="#1297C3" variant="tonal" size="small"><v-icon start>mdi-image-multiple</v-icon> See All Photos</v-btn>
      </v-col>
    
      <v-col cols="12" sm="6">
        <h3 class="text-center serif">Tags to Copy</h3>
        <DFCode :osm-tags="mergedTags" :highlight-values-for-keys="vendorTagKeys" />

        <h5 class="text-center mt-4 serif">and if operator is known</h5>
        <DFCode :osm-tags="operatorTags" :highlight-values-for-keys="['operator', 'operator:wikidata']" :show-copy-button="false" />
        <div class="text-caption text-center mt-1">
          <a href="https://www.wikidata.org/wiki/Wikidata:Main_Page" target="_blank" rel="noopener" class="text-decoration-none text-grey-darken-1">
            What is WikiData? <v-icon size="x-small">mdi-open-in-new</v-icon>
          </a>
        </div>
      </v-col>
    </v-row>
</template>

<script setup lang="ts">
import DFCode from '@/components/DFCode.vue';
import { ref, type Ref, onMounted, computed } from 'vue';
import { type LprVendor } from '@/types';
import { lprBaseTags } from '@/constants';
import { useVendorStore } from '@/stores/vendorStore';

const lprVendors = ref<LprVendor[]>([]);
const selectedLprVendor: Ref<LprVendor | null> = ref(null);
const vendorStore = useVendorStore();

const operatorTags: Record<string, string> = {
  'operator': '[Enter operator name]',
  'operator:wikidata': '[Enter WikiData ID]'
};

const mergedTags = computed(() => ({
  ...lprBaseTags,
  ...(selectedLprVendor.value?.osmTags ?? {})
}));

const vendorTagKeys = computed(() => 
  Object.keys(selectedLprVendor.value?.osmTags ?? {})
);

onMounted(async () => {
  const genericLprVendor: LprVendor = {
    id: -1,
    fullName: 'Generic',
    shortName: 'Generic',
    osmTags: {},
    urls: [],
  }
  await vendorStore.loadAllVendors();
  lprVendors.value = [...vendorStore.lprVendors, genericLprVendor];

  selectedLprVendor.value = lprVendors.value[0] ?? null;
});

</script>

<style scoped>
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
