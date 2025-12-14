<template>
  <DefaultLayout>
    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center" style="min-height: 50vh;">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
    </div>

    <!-- Error State -->
    <v-container v-else-if="error" class="py-8">
      <v-alert type="error" class="mb-6">
        {{ error }}
        <template #append>
          <v-btn variant="outlined" size="small" @click="fetchBlogPost">
            Retry
          </v-btn>
        </template>
      </v-alert>
      
      <v-btn
        :to="{ name: 'blog' }"
        variant="outlined"
        prepend-icon="mdi-arrow-left"
      >
        Back to News
      </v-btn>
    </v-container>

    <!-- Blog Post Content -->
    <div v-else-if="blogPost">
      <!-- Header -->
      <v-container class="py-8">
        <div class="mb-6">
          <v-btn
            :to="{ name: 'blog' }"
            variant="outlined"
            size="small"
            prepend-icon="mdi-arrow-left"
            class="mb-4"
          >
            Back to News
          </v-btn>
          
          <h1 class="text-h3 text-md-h2 font-weight-bold mb-4">
            {{ blogPost.title }}
          </h1>
          
          <div class="d-flex flex-wrap align-center gap-4 mb-6">
            <v-chip 
              size="small" 
              variant="outlined" 
              color="primary"
              prepend-icon="mdi-calendar"
            >
              {{ formatDate(blogPost.published) }}
            </v-chip>
            
            <v-chip 
              v-if="blogPost.externalUrl"
              size="small" 
              variant="outlined" 
              color="secondary"
              prepend-icon="mdi-link-variant"
            >
              External Article
            </v-chip>
          </div>

          <p v-if="blogPost.description" class="text-h6 text-grey-darken-1 mb-6">
            {{ blogPost.description }}
          </p>
        </div>

        <!-- External URL Notice -->
        <v-alert 
          v-if="blogPost.externalUrl" 
          type="info" 
          variant="outlined" 
          class="mb-6"
        >
          <div class="d-flex align-center">
            <div class="flex-grow-1">
              <strong>External Article:</strong> This content is hosted on an external website.
            </div>
            <v-btn
              :href="blogPost.externalUrl"
              target="_blank"
              variant="outlined"
              size="small"
              append-icon="mdi-open-in-new"
            >
              Read on External Site
            </v-btn>
          </div>
        </v-alert>

        <!-- Blog Content -->
        <v-card v-if="blogPost.content && !blogPost.externalUrl" elevation="0" class="bg-transparent">
          <v-card-text class="pa-0">
            <div 
              class="blog-content"
              v-html="blogPost.content"
            ></div>
          </v-card-text>
        </v-card>

        <!-- No Content Message -->
        <v-alert
          v-else-if="!blogPost.externalUrl"
          type="warning"
          variant="outlined"
        >
          <strong>Content Unavailable:</strong> The full content for this blog post is not available.
        </v-alert>
      </v-container>
    </div>

    <!-- Not Found State -->
    <v-container v-else class="py-8 text-center">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-file-document-remove-outline</v-icon>
      <h2 class="text-h4 text-grey-darken-1 mb-2">Blog Post Not Found</h2>
      <p class="text-body-1 text-grey-darken-2 mb-6">
        The blog post you're looking for doesn't exist or has been removed.
      </p>
      <v-btn
        :to="{ name: 'blog' }"
        variant="outlined"
        prepend-icon="mdi-arrow-left"
      >
        Back to News
      </v-btn>
    </v-container>
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