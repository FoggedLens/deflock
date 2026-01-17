<template>
  <v-sheet min-width="240">
    <!--  TODO: if a field is unknown, prompt user to edit it -->
    <div class="position-relative">
      <v-img v-if="imageUrl" cover width="100%" height="150px" :src="imageUrl" class="rounded mt-5" />
      <div v-if="imageUrl" class="position-absolute bottom-0 left-0 right-0 text-center text-white text-caption" style="background: rgba(0, 0, 0, 0.5);">
        {{ manufacturer }} LPR
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
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import type { PropType } from 'vue';
import type { ALPR } from '@/types';
import { VIcon, VList, VSheet, VListItem, VBtn, VImg, VListItemSubtitle, VDivider } from 'vuetify/components';
import { useVendorStore } from '@/stores/vendorStore';

const props = defineProps({
  alpr: {
    type: Object as PropType<ALPR>,
    required: true
  }
});

const manufacturer = computed(() => (
  props.alpr.tags.manufacturer || 
    props.alpr.tags['surveillance:manufacturer'] || 
    props.alpr.tags.brand || 
    props.alpr.tags['surveillance:brand'] ||
    'Unknown'
));

const store = useVendorStore();
const imageUrl = ref<string | undefined | null>(undefined);

onMounted(async () => {
  const url = await store.getFirstImageForManufacturer(manufacturer.value as string);
  if (url) imageUrl.value = url;
});

const abbreviatedOperator = computed(() => {
  const operatorTagKeys = [
    "operator",
    "surveillance:operator"
  ]
  const operatorTagKey = operatorTagKeys.find(key => props.alpr.tags[key] !== undefined);
  if (!operatorTagKey) {
    return undefined;
  }

  const replacements: Record<string, string> = {
    "Police Department": "PD",
    "Sheriff's Office": "SO",
    "Sheriffs Office": "SO",
  };

  const operator = props.alpr.tags.operator;
  for (const [full, abbr] of Object.entries(replacements)) {
    if (operator.includes(full)) {
      return operator.replace(full, abbr);
    }
  }
  return operator;
});

function osmNodeLink(id: string): string {
  return `https://www.openstreetmap.org/node/${id}`;
}
</script>
