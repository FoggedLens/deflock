<template>
<DefaultLayout>
  <template #header>
    <Hero
      title="DeFlock News"
      description="The latest news on LPRs and surveillance from us and our partners."
      gradient="linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%)"
    />
  </template>
  
  <v-container class="py-8">
    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center" style="min-height: 200px;">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
    </div>

    <!-- Error State -->
    <v-alert v-else-if="error" type="error" class="mb-6">
      {{ error }}
      <template #append>
        <v-btn variant="outlined" size="small" @click="fetchBlogPosts">
          Retry
        </v-btn>
      </template>
    </v-alert>

    <!-- Blog Posts List -->
    <div v-else>
      <div v-if="blogPosts.length > 0" class="mx-auto" style="max-width: 900px;">
        <article 
          v-for="post in blogPosts" 
          :key="post.id"
          class="mb-8"
        >
          <v-card
            class="rounded-xl transition-all cursor-pointer mx-4 mx-sm-0"
            :href="post.externalUrl || `/blog/${post.id}`"
            :target="post.externalUrl ? '_blank' : undefined"
            :to="post.externalUrl ? undefined : `/blog/${post.id}`"
            flat
          >
            <v-card-text class="pa-8">
              <div class="mb-3">
                <h2 class="font-weight-medium mb-0">{{ post.title }}</h2>
              </div>
              
              <p class="text-caption text-uppercase font-weight-medium text-medium-emphasis mb-4">
                {{ formatDate(post.published) }}
              </p>
              
              <p class="text-body-1 mb-6" style="line-height: 1.6;">
                {{ post.description }}
              </p>

              <div class="d-flex align-center justify-space-between">
                <span class="text-body-2 font-weight-medium text-primary">
                  {{ post.externalUrl ? `Read on ${getExternalOrigin(post.externalUrl)}` : 'Read full article' }}
                </span>
                <v-icon 
                  size="20"
                  color="primary"
                  :icon="post.externalUrl ? 'mdi-open-in-new' : 'mdi-arrow-right'"
                ></v-icon>
              </div>
            </v-card-text>
          </v-card>
        </article>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-post-outline</v-icon>
        <h3 class="text-h5 text-grey-darken-1 mb-2">No blog posts yet</h3>
        <p class="text-body-1 text-grey-darken-2">Check back later for updates!</p>
      </div>

      <!-- Pagination -->
      <div v-if="blogPosts.length > 0" class="d-flex justify-center mt-8">
        <v-pagination
          class="pl-0"
          v-model="currentPage"
          :length="totalPages > 0 ? totalPages : 1"
          :total-visible="3"
          :disabled="totalPages <= 1"
          @update:model-value="onPageChange"
        ></v-pagination>
      </div>
    </div>
  </v-container>
</DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Hero from '@/components/layout/Hero.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { blogService, type BlogPost } from '@/services/blogService';

// Router
const route = useRoute();
const router = useRouter();

// Reactive state
const blogPosts = ref<BlogPost[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const totalCount = ref(0);
const postsPerPage = 5; // Fewer posts per page for larger cards

// Current page from route query parameter
const currentPage = computed({
  get: () => {
    const page = parseInt(route.query.page as string) || 1;
    return page > 0 ? page : 1;
  },
  set: (page: number) => {
    router.push({
      path: route.path,
      query: { ...route.query, page: page > 1 ? page.toString() : undefined }
    });
  }
});

// Computed properties
const totalPages = computed(() => Math.ceil(totalCount.value / postsPerPage));

// Methods
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getExternalOrigin = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return 'external site';
  }
};

const fetchBlogPosts = async (page = 1) => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await blogService.getBlogPosts({
      limit: postsPerPage,
      page: page,
      sort: '-published',
      fields: ['id', 'title', 'description', 'published', 'externalUrl']
    });
    
    blogPosts.value = response.data;
    totalCount.value = response.meta?.total_count || response.data.length;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load blog posts';
    console.error('Error fetching blog posts:', err);
  } finally {
    loading.value = false;
  }
};

const onPageChange = (page: number) => {
  currentPage.value = page;
  // Scroll to top of the page
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Watch route query changes to fetch posts when page parameter changes
watch(() => route.query.page, (newPage) => {
  const page = parseInt(newPage as string) || 1;
  fetchBlogPosts(page);
}, { immediate: false });

// Lifecycle
onMounted(() => {
  fetchBlogPosts(currentPage.value);
});
</script>

<style scoped>
/* Fix for pagination padding issue */
:deep(.v-pagination__list) {
  padding-left: 0 !important;
}
</style>