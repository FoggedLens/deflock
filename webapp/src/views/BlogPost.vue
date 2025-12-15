<template>
  <DefaultLayout>
    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center" style="min-height: 50vh;">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
    </div>

    <!-- Error State -->
    <v-container v-else-if="error" class="py-8">
      <v-btn
        :to="{ name: 'blog' }"
        variant="text"
        prepend-icon="mdi-arrow-left"
      >
        Back to News
      </v-btn>
      <v-alert type="error" class="mt-6" variant="tonal">
        {{ error }}
      </v-alert>
    </v-container>

    <!-- Blog Post Content -->
    <div v-else-if="blogPost">
      <!-- Header -->
      <v-container class="py-8">
        <div class="mb-6">
          <v-btn
            :to="{ name: 'blog' }"
            variant="text"
            size="small"
            prepend-icon="mdi-arrow-left"
            class="mb-4"
          >
            Back to News
          </v-btn>
          
          <h1 class="text-h3 text-md-h2 font-weight-bold mb-4 mt-0">
            {{ blogPost.title }}
          </h1>
          
          <v-card flat class="mb-6" color="transparent">
            <div class="d-flex flex-column flex-sm-row">
              <v-chip
                prepend-icon="mdi-account"
                color="grey-darken-1"
                variant="text"
                size="default"
              >
                by Will Freeman
              </v-chip>
              <v-chip
                prepend-icon="mdi-calendar"
                color="grey-darken-1"
                variant="text"
                size="default"
              >
                {{ formatDate(blogPost.published) }}
              </v-chip>
            </div>
          </v-card>
        </div>

        <!-- Blog Content -->
        <v-card v-if="blogPost.content"elevation="0" class="bg-transparent">
          <v-card-text class="pa-0">
            <div 
              class="blog-content"
              v-html="blogPost.content"
            ></div>
          </v-card-text>
        </v-card>
      </v-container>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { blogService, type BlogPost } from '@/services/blogService';

const route = useRoute();

// Reactive state
const blogPost = ref<BlogPost | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Methods
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const fetchBlogPost = async () => {
  const postId = route.params.id;
  
  if (!postId || Array.isArray(postId)) {
    error.value = 'Invalid blog post ID';
    return;
  }

  const id = parseInt(postId, 10);
  if (isNaN(id)) {
    error.value = 'Invalid blog post ID';
    return;
  }

  loading.value = true;
  error.value = null;
  
  try {
    blogPost.value = await blogService.getBlogPost(id);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load blog post';
    console.error('Error fetching blog post:', err);
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchBlogPost();
});
</script>

<style scoped>
.blog-content {
  font-size: 1.1rem;
  line-height: 1.7;
}

.blog-content :deep(h1),
.blog-content :deep(h2),
.blog-content :deep(h3),
.blog-content :deep(h4),
.blog-content :deep(h5),
.blog-content :deep(h6) {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.blog-content :deep(h1) { font-size: 2.5rem; }
.blog-content :deep(h2) { font-size: 2rem; }
.blog-content :deep(h3) { font-size: 1.75rem; }
.blog-content :deep(h4) { font-size: 1.5rem; }
.blog-content :deep(h5) { font-size: 1.25rem; }
.blog-content :deep(h6) { font-size: 1.1rem; }

.blog-content :deep(p) {
  margin-bottom: 1.5rem;
}

.blog-content :deep(ul),
.blog-content :deep(ol) {
  margin-bottom: 1.5rem;
  padding-left: 2rem;
}

.blog-content :deep(li) {
  margin-bottom: 0.5rem;
}

.blog-content :deep(blockquote) {
  margin: 2rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  font-style: italic;
}

.blog-content :deep(code) {
  background-color: rgba(var(--v-theme-surface-variant), 0.2);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.blog-content :deep(pre) {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.blog-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.blog-content :deep(a) {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

.blog-content :deep(a:hover) {
  text-decoration: underline;
}

.blog-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1.5rem 0;
}

.blog-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

.blog-content :deep(th),
.blog-content :deep(td) {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  padding: 0.75rem;
  text-align: left;
}

.blog-content :deep(th) {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  font-weight: 600;
}
</style>