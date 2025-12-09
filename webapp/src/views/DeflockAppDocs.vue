<template>
<DefaultLayout>
  <template #header>
    <Hero 
        title="App User Guide"
        description="Learn how to use the Deflock app."
        gradient="linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%)"
    />
  </template>

  <v-container class="documentation-content" fluid>
    <div class="content-wrapper">
      <v-row>
        <!-- Desktop TOC Sidebar Column -->
        <v-col 
          v-if="!loading && !error && tocItems.length > 0" 
          cols="12" 
          md="3" 
          lg="3" 
          xl="2"
          class="d-none d-md-block toc-column"
        >
        <v-card class="toc-sidebar" elevation="1" sticky>
          <v-card-title class="text-h6 py-3">
            <v-icon start>
              <ListBulletedIcon />
            </v-icon>
            Table of Contents
          </v-card-title>
          <v-divider />
          <v-card-text class="py-2 toc-scrollable">
            <nav class="toc-desktop">
              <template v-for="item in tocItems" :key="item.id">
                <div class="toc-item" :class="`toc-level-${item.level}`">
                  <button
                    @click="scrollToSection(item.id)"
                    class="toc-link"
                    :class="{ 'toc-active': activeSection === item.id }"
                  >
                    <span class="toc-text">{{ item.text }}</span>
                  </button>
                </div>
                
                <!-- Render children recursively -->
                <template v-if="item.children && item.children.length > 0">
                  <template v-for="child in item.children" :key="child.id">
                    <div class="toc-item" :class="`toc-level-${child.level}`">
                      <button
                        @click="scrollToSection(child.id)"
                        class="toc-link"
                        :class="{ 'toc-active': activeSection === child.id }"
                      >
                        <span class="toc-text">{{ child.text }}</span>
                      </button>
                    </div>
                    
                    <!-- Third level -->
                    <template v-if="child.children && child.children.length > 0">
                      <div 
                        v-for="grandchild in child.children" 
                        :key="grandchild.id"
                        class="toc-item" 
                        :class="`toc-level-${grandchild.level}`"
                      >
                        <button
                          @click="scrollToSection(grandchild.id)"
                          class="toc-link"
                          :class="{ 'toc-active': activeSection === grandchild.id }"
                        >
                          <span class="toc-text">{{ grandchild.text }}</span>
                        </button>
                      </div>
                    </template>
                  </template>
                </template>
              </template>
            </nav>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Main Content Column -->
      <v-col 
        :cols="12"
        :md="(!loading && !error && tocItems.length > 0) ? 9 : 12"
        :lg="(!loading && !error && tocItems.length > 0) ? 9 : 12"
        :xl="(!loading && !error && tocItems.length > 0) ? 10 : 12"
        class="content-column"
      >
        <div v-if="loading" class="text-center my-8">
          <v-progress-circular indeterminate color="primary" size="64" />
          <p class="mt-4">Loading user guide...</p>
        </div>
        
        <div v-else-if="error" class="text-center my-8">
          <v-alert type="error" variant="tonal" class="mb-4">
            Failed to load user guide: {{ error }}
          </v-alert>
        </div>
        
        <article v-else-if="content" class="docs-content" v-html="content" />
      </v-col>
    </v-row>
    </div>
  </v-container>
</DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Hero from '@/components/layout/Hero.vue';

import ListBulletedIcon from '@iconify-vue/mdi/format-list-bulleted';

interface CMSResponse {
  data: {
    id: number;
    title: string;
    content: string;
  };
}

interface TocItem {
  id: string;
  text: string;
  level: number;
  children?: TocItem[];
}

const loading = ref(true);
const error = ref<string | null>(null);
const content = ref<string>('');
const tocItems = ref<TocItem[]>([]);
const activeSection = ref<string>('');

// Generate a URL-friendly ID from heading text
const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

// Parse HTML content to extract headings and build TOC
const buildTableOfContents = (htmlContent: string): TocItem[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  const items: TocItem[] = [];
  const stack: TocItem[] = [];
  
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.substring(1));
    const text = heading.textContent?.trim() || '';
    const id = generateId(text);
    
    // Add ID to the heading for anchor links
    heading.id = id;
    
    const item: TocItem = {
      id,
      text,
      level,
      children: []
    };
    
    // Build hierarchy
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }
    
    if (stack.length === 0) {
      items.push(item);
    } else {
      const parent = stack[stack.length - 1];
      if (!parent.children) parent.children = [];
      parent.children.push(item);
    }
    
    stack.push(item);
  });
  
  return items;
};

// Update content with IDs added to headings
const processContentWithIds = (htmlContent: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  headings.forEach((heading) => {
    const text = heading.textContent?.trim() || '';
    const id = generateId(text);
    heading.id = id;
  });
  
  return doc.body.innerHTML;
};

// Smooth scroll to section
const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const headerOffset = 100; // Account for fixed header space
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
    
    activeSection.value = id;
  }
};

// Track active section while scrolling
const updateActiveSection = () => {
  const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
  const scrollPosition = window.scrollY + 150; // Offset for header
  
  let current = '';
  
  headings.forEach((heading) => {
    const element = heading as HTMLElement;
    if (element.offsetTop <= scrollPosition) {
      current = element.id;
    }
  });
  
  activeSection.value = current;
};

const fetchUserGuide = async () => {
  try {
    const response = await fetch('https://cms.deflock.me/items/AppUserGuide');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: CMSResponse = await response.json();
    const processedContent = processContentWithIds(data.data.content);
    content.value = processedContent;
    
    // Build TOC after content is processed
    await nextTick();
    tocItems.value = buildTableOfContents(data.data.content);
  } catch (err) {
    console.error('Error fetching user guide:', err);
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchUserGuide();
  
  // Add scroll listener for active section tracking
  window.addEventListener('scroll', updateActiveSection);
});

// Watch for content changes to rebuild TOC
watch(content, () => {
  if (content.value) {
    nextTick(() => {
      updateActiveSection();
    });
  }
});
</script>

<style scoped>
/* Container styles */
.documentation-content {
  padding: 2rem 0;
}

/* Max width wrapper for large screens */
.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Article content styles */
.docs-content {
  line-height: 1.7;
  font-family: "PT Serif", serif;
}

/* Headings */
.docs-content :deep(h1),
.docs-content :deep(h2),
.docs-content :deep(h3),
.docs-content :deep(h4),
.docs-content :deep(h5),
.docs-content :deep(h6) {
  font-family: var(--v-font-family);
  font-weight: 600;
  margin: 2rem 0 1rem 0;
  line-height: 1.3;
  color: rgb(var(--v-theme-on-surface));
}

.docs-content :deep(h1) {
  font-size: 2.5rem;
  font-weight: 700;
  border-bottom: 2px solid rgb(var(--v-theme-primary));
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

.docs-content :deep(h2) {
  font-size: 2rem;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  padding-bottom: 0.25rem;
}

.docs-content :deep(h3) {
  font-size: 1.5rem;
}

.docs-content :deep(h4) {
  font-size: 1.25rem;
}

.docs-content :deep(h5) {
  font-size: 1.125rem;
}

.docs-content :deep(h6) {
  font-size: 1rem;
  opacity: 0.9;
}

/* Paragraphs */
.docs-content :deep(p) {
  margin: 1.2rem 0;
  font-size: 1.1rem;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

/* Lists */
.docs-content :deep(ul),
.docs-content :deep(ol) {
  margin: 1.5rem 0;
  padding-left: 2rem;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.docs-content :deep(li) {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.docs-content :deep(ul li) {
  position: relative;
}

.docs-content :deep(ul li::marker) {
  color: rgb(var(--v-theme-primary));
}

.docs-content :deep(ol li::marker) {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}

/* Nested lists */
.docs-content :deep(ul ul),
.docs-content :deep(ol ol),
.docs-content :deep(ul ol),
.docs-content :deep(ol ul) {
  margin: 0.5rem 0;
}

/* Links */
.docs-content :deep(a) {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.docs-content :deep(a:hover) {
  color: rgb(var(--v-theme-secondary));
  text-decoration: underline;
}

/* Emphasis */
.docs-content :deep(strong),
.docs-content :deep(b) {
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.95);
}

.docs-content :deep(em),
.docs-content :deep(i) {
  font-style: italic;
  color: rgba(var(--v-theme-on-surface), 0.85);
}

/* Code */
.docs-content :deep(code) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  background: rgba(var(--v-theme-surface-variant), 0.6);
  color: rgb(var(--v-theme-on-surface-variant));
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.docs-content :deep(pre) {
  background: rgba(var(--v-theme-surface-variant), 0.8);
  color: rgb(var(--v-theme-on-surface-variant));
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1.5rem 0;
  overflow-x: auto;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.docs-content :deep(pre code) {
  background: none;
  padding: 0;
  border: none;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Blockquotes */
.docs-content :deep(blockquote) {
  margin: 1.5rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 0 8px 8px 0;
  font-style: italic;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.docs-content :deep(blockquote p) {
  margin: 0.5rem 0;
}

/* Tables */
.docs-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.docs-content :deep(th),
.docs-content :deep(td) {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.docs-content :deep(th) {
  background: rgba(var(--v-theme-primary), 0.1);
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.95);
}

.docs-content :deep(tbody tr:nth-child(even)) {
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.docs-content :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-primary), 0.05);
}

/* Images */
.docs-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 1.5rem 1rem;
}

/* Horizontal rules */
.docs-content :deep(hr) {
  border: none;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(var(--v-theme-outline), 0.3),
    transparent
  );
  margin: 2rem 0;
}

/* Dark mode adjustments */
.v-theme--dark .docs-content :deep(code) {
  background: rgba(var(--v-theme-surface-bright), 0.8);
}

.v-theme--dark .docs-content :deep(pre) {
  background: rgba(var(--v-theme-surface-bright), 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.v-theme--dark .docs-content :deep(blockquote) {
  background: rgba(var(--v-theme-surface-bright), 0.4);
}

.v-theme--dark .docs-content :deep(table) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.v-theme--dark .docs-content :deep(img) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Responsive design */
@media (max-width: 768px) {
  .documentation-content {
    padding: 1rem 0;
  }
  
  .docs-content :deep(h1) {
    font-size: 2rem;
  }
  
  .docs-content :deep(h2) {
    font-size: 1.75rem;
  }
  
  .docs-content :deep(h3) {
    font-size: 1.375rem;
  }
  
  .docs-content :deep(pre) {
    padding: 1rem;
    font-size: 0.85rem;
  }
  
  .docs-content :deep(table) {
    font-size: 0.9rem;
  }
  
  .docs-content :deep(th),
  .docs-content :deep(td) {
    padding: 0.5rem 0.75rem;
  }
}

/* Table of Contents Styles */
.toc-column {
  padding-left: 1.5rem !important;
  padding-right: 1.5rem !important;
}

.toc-sidebar {
  position: fixed;
  top: 100px;
  left: 1.5rem;
  width: calc((100vw - 1400px) / 2 * 0.25 + 1400px * 0.25 - 3rem);
  max-width: 320px;
  min-width: 280px;
  max-height: calc(100vh - 120px);
  border-radius: 8px;
  z-index: 100;
}

.toc-scrollable {
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  padding-right: 4px;
}

/* Content column padding */
.content-column {
  padding-left: 1.5rem !important;
  padding-right: 1.5rem !important;
}

/* Add margin when TOC is fixed on desktop screens */
@media (min-width: 960px) {
  .content-column {
    margin-left: 320px !important;
  }
}

/* Adjust margin for very large screens */
@media (min-width: 1500px) {
  .content-column {
    margin-left: 340px !important;
  }
}

/* Additional content spacing */
.docs-content {
  padding: 0 1rem;
}

/* Custom scrollbar for TOC */
.toc-scrollable::-webkit-scrollbar {
  width: 4px;
}

.toc-scrollable::-webkit-scrollbar-track {
  background: transparent;
}

.toc-scrollable::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 2px;
}

.toc-scrollable::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.5);
}

.toc-desktop {
  padding: 0;
}

.toc-item {
  display: block;
  width: 100%;
  margin: 1px 0;
}

/* Clean button styling with proper text wrapping */
.toc-link {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  text-transform: none;
  font-weight: 400;
  color: rgba(var(--v-theme-on-surface), 0.7);
  border-radius: 6px;
  font-size: 0.875rem;
  line-height: 1.4;
  transition: all 0.2s ease;
  padding: 8px 12px;
  position: relative;
}

.toc-text {
  display: block;
  width: 100%;
  white-space: normal !important;
  word-wrap: break-word !important;
  word-break: break-word !important;
  overflow-wrap: break-word !important;
  line-height: 1.3;
}

.toc-link:hover {
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
}

.toc-link.toc-active {
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
  border-left: 3px solid rgb(var(--v-theme-primary));
}

/* Hierarchy indentation */
.toc-level-1 .toc-link {
  padding-left: 12px;
  font-weight: 600;
  font-size: 0.9rem;
}

.toc-level-1 .toc-text {
  font-weight: 600;
}

.toc-level-2 .toc-link {
  padding-left: 24px;
  font-size: 0.875rem;
}

.toc-level-3 .toc-link {
  padding-left: 36px;
  font-size: 0.8125rem;
  opacity: 0.9;
}

.toc-level-4 .toc-link {
  padding-left: 48px;
  font-size: 0.8125rem;
  opacity: 0.85;
}

.toc-level-5 .toc-link {
  padding-left: 60px;
  font-size: 0.75rem;
  opacity: 0.8;
}

.toc-level-6 .toc-link {
  padding-left: 72px;
  font-size: 0.75rem;
  opacity: 0.75;
}

/* Smooth scrolling for the whole page */
html {
  scroll-behavior: smooth;
}

/* Add scroll margin to headings for better anchor positioning */
.docs-content :deep(h1[id]),
.docs-content :deep(h2[id]),
.docs-content :deep(h3[id]),
.docs-content :deep(h4[id]),
.docs-content :deep(h5[id]),
.docs-content :deep(h6[id]) {
  scroll-margin-top: 100px;
}

/* Dark theme adjustments */
.v-theme--dark .toc-sidebar {
  border: 1px solid rgba(var(--v-theme-surface-variant), 0.3);
}

.v-theme--dark .toc-link.toc-active {
  background: rgba(var(--v-theme-primary), 0.2);
}

/* Hide TOC on print */
@media print {
  .toc-column {
    display: none !important;
  }
  
  .content-column {
    flex: 0 0 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  .content-wrapper {
    max-width: none !important;
  }
}

/* Loading and error states */
.text-center {
  text-align: center;
}

.v-progress-circular {
  margin: 2rem auto;
}

/* Print styles */
@media print {
  .docs-content :deep(h1),
  .docs-content :deep(h2),
  .docs-content :deep(h3),
  .docs-content :deep(h4),
  .docs-content :deep(h5),
  .docs-content :deep(h6) {
    page-break-after: avoid;
  }
  
  .docs-content :deep(blockquote),
  .docs-content :deep(pre),
  .docs-content :deep(table) {
    page-break-inside: avoid;
  }
}
</style>