<template>
  <DefaultLayout>
    <template #header>
      <Hero
        title="DeFlock Store"
        description="Full store coming soon! In the meantime, check out our free Downloads."
        gradient="linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%)"
      />
    </template>

    <v-container>
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="mt-4 text-grey">Loading printables...</p>
      </div>

      <!-- Error State -->
      <v-alert
        v-else-if="error"
        type="error"
        variant="tonal"
        class="mb-6"
        closable
        @click:close="error = null"
      >
        <strong>Failed to load printables:</strong> {{ error }}
      </v-alert>

      <!-- Printables Grid -->
      <div v-else-if="printables.length > 0">
        <h2 class="text-h4 mb-2 font-weight-bold text-center">Printables</h2>
        <p class="mb-6 text-center">
          Signs, stickers, zines, and more!
        </p>
        
        <!-- Filter Section -->
        <div class="filter-section mb-6">
          <v-row justify="center">
            <v-col cols="12" md="6" lg="4">
              <v-select
                v-model="selectedType"
                :items="typeOptions"
                label="Filter by type"
                variant="outlined"
                clearable
                hide-details
                class="filter-select"
              >
                <template v-slot:prepend-inner>
                  <v-icon><FilterIcon /></v-icon>
                </template>
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon :color="getTypeColor(item.raw.value)">
                        <component :is="getTypeIcon(item.raw.value)" />
                      </v-icon>
                    </template>
                  </v-list-item>
                </template>
                <template v-slot:selection="{ item }">
                  <div class="d-flex align-center">
                    <v-icon :color="getTypeColor(item.raw.value)" class="mr-2">
                      <component :is="getTypeIcon(item.raw.value)" />
                    </v-icon>
                    <span class="text-capitalize">{{ item.raw.title }}</span>
                  </div>
                </template>
              </v-select>
            </v-col>
          </v-row>
        </div>

        <v-row>
          <v-col
            v-for="printable in filteredPrintables"
            :key="printable.id"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card
              elevation="2"
              height="100%"
            >
              <!-- Preview Image -->
              <div class="position-relative">
                <v-img
                  :src="getImageUrl(printable.preview)"
                  :alt="`${printable.title} preview`"
                  aspect-ratio="1.414"
                  class="mt-4 mx-2"
                  contain
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-progress-circular
                        color="grey-lighten-4"
                        indeterminate
                      />
                    </div>
                  </template>
                </v-img>
              </div>

              <!-- Card Content -->
              <v-card-text class="pb-2">
                <h3 class="text-h6 font-weight-bold mb-2">
                  {{ printable.title }}
                </h3>

                <!-- Type Badge -->
                <v-chip
                  :color="getTypeColor(printable.type)"
                  size="small"
                  class="text-capitalize mb-2 font-weight-bold"
                >
                  <template v-slot:prepend>
                    <v-icon size="small" class="mr-2">
                      <component :is="getTypeIcon(printable.type)" />
                    </v-icon>
                  </template>
                  {{ deCamel(printable.type) }}
                </v-chip>
                
                <div class="d-flex align-center text-caption text-grey mb-3">
                  <v-icon size="small" class="mr-1"><AccountIcon /></v-icon>
                  by {{ printable.author }}
                  <v-tooltip text="Licensed under CC BY-NC 4.0">
                    <template v-slot:activator="{ props }">
                      <v-icon 
                        v-bind="props"
                        size="small" 
                        class="ml-1"
                        color="grey"
                      >
                        <CreativeCommonsIcon />
                      </v-icon>
                    </template>
                  </v-tooltip>
                  <v-spacer />
                  <v-icon size="small" class="mr-1"><ClockIcon /></v-icon>
                  {{ formatDate(printable.date_updated) }}
                </div>

                <!-- Download Options -->
                <div class="download-section">
                  <div class="d-flex gap-2">
                    <v-btn
                      v-if="printable.front"
                      :href="getImageUrl(printable.front)"
                      target="_blank"
                      download
                      variant="tonal"
                      color="primary"
                      size="small"
                      class="flex-1-1-50"
                    >
                      <template v-slot:prepend>
                        <v-icon><DownloadIcon /></v-icon>
                      </template>
                      <span v-if="printable.back">Front Side</span>
                      <span v-else>Download</span>
                    </v-btn>
                    
                    <v-btn
                      v-if="printable.back"
                      :href="getImageUrl(printable.back)"
                      target="_blank"
                      download
                      variant="tonal"
                      color="secondary"
                      size="small"
                      class="flex-1-1-50"
                    >
                      <template v-slot:prepend>
                        <v-icon><DownloadIcon /></v-icon>
                      </template>
                      Back Side
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <v-icon size="64" color="grey-lighten-1"><InboxIcon /></v-icon>
        <h3 class="text-h5 mt-4 mb-2 text-grey">No printables available</h3>
        <p class="text-grey">Check back later for new content!</p>
      </div>

      <!-- Submit Artwork Section -->
      <v-divider class="my-8" />
      <div class="text-center py-4">
        <v-btn
          href="https://forms.gle/bbNdsZ8iKv7VVFYi8"
          target="_blank"
          rel="noopener noreferrer"
          color="primary"
          variant="outlined"
          size="large"
          class="text-none"
        >
          <template v-slot:prepend>
            <v-icon><UploadIcon /></v-icon>
          </template>
          Submit Your Artwork
        </v-btn>
        <p class="text-caption text-grey mt-2">
          Have anti-ALPR artwork? Share it with the community!
        </p>
      </div>
    </v-container>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Ref } from 'vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Hero from '@/components/layout/Hero.vue';

// Icon imports
import FilterIcon from '@iconify-vue/mdi/filter';
import AccountIcon from '@iconify-vue/mdi/account';
import CreativeCommonsIcon from '@iconify-vue/mdi/creative-commons';
import ClockIcon from '@iconify-vue/mdi/clock-outline';
import DownloadIcon from '@iconify-vue/mdi/download';
import InboxIcon from '@iconify-vue/mdi/inbox-outline';
import UploadIcon from '@iconify-vue/mdi/upload';
import PostIcon from '@iconify-vue/mdi/post';
import BookIcon from '@iconify-vue/mdi/book-open-page-variant';
import SignIcon from '@iconify-vue/mdi/sign-real-estate';
import StickerIcon from '@iconify-vue/mdi/sticker-circle-outline';
import RectangleIcon from '@iconify-vue/mdi/rectangle-outline';
import FileIcon from '@iconify-vue/mdi/file';

// Types
interface Printable {
  id: number;
  date_updated: string;
  type: string;
  author: string;
  preview: string;
  front: string | null;
  back: string | null;
  title: string;
}

interface CMSResponse {
  data: Printable[];
}

// Reactive state
const printables: Ref<Printable[]> = ref([]);
const loading = ref(true);
const error: Ref<string | null> = ref(null);
const selectedType: Ref<string | null> = ref(null);

// Computed properties
const typeOptions = computed(() => {
  const types = [...new Set(printables.value.map(p => p.type))];
  return types.map(type => ({
    title: type.charAt(0).toUpperCase() + type.slice(1),
    value: type
  }));
});

const filteredPrintables = computed(() => {
  if (!selectedType.value) {
    return printables.value;
  }
  return printables.value.filter(printable => printable.type === selectedType.value);
});

// Methods
const fetchPrintables = async (): Promise<void> => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await fetch('https://cms.deflock.me/items/Printables');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: CMSResponse = await response.json();
    printables.value = data.data || [];
  } catch (err) {
    console.error('Error fetching printables:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load printables';
  } finally {
    loading.value = false;
  }
};

const deCamel = (str: string): string => {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2');
};

const getImageUrl = (imageId: string): string => {
  if (!imageId) return '';
  return `https://cms.deflock.me/assets/${imageId}`;
};

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    poster: 'primary',
    zine: 'success',
    yardSign: 'secondary',
    sticker: 'accent',
    bumperSticker: 'info'
  };
  return colors[type] || 'grey';
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, any> = {
    poster: PostIcon,
    zine: BookIcon,
    yardSign: SignIcon,
    sticker: StickerIcon,
    bumperSticker: RectangleIcon,
  };
  return icons[type] || FileIcon;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Lifecycle
onMounted(() => {
  fetchPrintables();
});
</script>

<style scoped>
.filter-section {
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 12px;
  padding: 16px;
}

.filter-select {
  max-width: 100%;
}

.download-section {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: 12px;
  margin-top: 8px;
}

.gap-2 {
  gap: 8px;
}

.flex-1-1-50 {
  flex: 1 1 50%;
}
</style>