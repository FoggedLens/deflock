<template>
  <DefaultLayout>
    <template #header>
      <Hero
        title="DeFlock Store"
        description="Shop physical goods or download free printables — signs, stickers, zines, and more."
        gradient="linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%)"
      />
    </template>

    <v-container>
      <v-tabs
        v-model="activeTab"
        align-tabs="center"
        color="var(--df-blue)"
        class="mb-6"
      >
        <v-tab value="shop" prepend-icon="mdi-shopping">Shop</v-tab>
        <v-tab value="printables" prepend-icon="mdi-download">Downloads</v-tab>
      </v-tabs>

      <v-window v-model="activeTab" :touch="false">

        <!-- ── Shop tab ─────────────────────────────────────────────────────── -->
        <v-window-item value="shop" eager>

          <p class="mt-4 mb-4 text-center text-medium-emphasis">
            T-shirts, stickers, yard signs, and more — proceeds support the anti-surveillance movement.
          </p>

          <v-row justify="center" class="mb-6">
            <v-col cols="12" sm="8" md="5" lg="4">
              <v-select
                v-model="collectionId"
                :items="collectionSelectItems"
                item-title="title"
                item-value="id"
                :item-props="(item: CollectionSelectItem) => item.type === 'header' ? { disabled: true, class: 'font-weight-bold text-medium-emphasis text-caption' } : {}"
                label="Browse by category"
                variant="outlined"
                prepend-inner-icon="mdi-tag-outline"
                hide-details
              >
                <template #item="{ props, item }">
                  <v-list-subheader v-if="item.raw.type === 'header'">
                    {{ item.raw.title }}
                  </v-list-subheader>
                  <v-list-item v-else v-bind="props" />
                </template>
              </v-select>
            </v-col>
          </v-row>

          <!-- Skeleton while Shopify SDK initialises -->
          <v-row v-if="!shopifyReady" class="mt-2">
            <v-col
              v-for="n in 6"
              :key="n"
              cols="12"
              md="6"
              lg="4"
            >
              <v-skeleton-loader type="image, list-item-two-line, actions" elevation="2" />
            </v-col>
          </v-row>

          <v-card
            v-show="shopifyReady"
            elevation="2"
            class="pa-4 mb-8"
          >
            <div ref="shopifyContainer" style="width: 100%" />
          </v-card>

        </v-window-item>

        <!-- ── Printables tab ───────────────────────────────────────────────── -->
        <v-window-item value="printables">

          <!-- Skeleton while fetching -->
          <v-row v-if="loading" class="mt-2">
            <v-col
              v-for="n in 4"
              :key="n"
              cols="12"
              md="6"
              lg="4"
            >
              <v-skeleton-loader type="image, list-item-two-line, actions" elevation="2" />
            </v-col>
          </v-row>

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

          <div v-else-if="printables.length > 0">
            <p class="mb-6 text-center text-medium-emphasis">Signs, stickers, zines, and more — free to download and print!</p>

            <v-row justify="center" class="mb-6">
              <v-col cols="12" md="6" lg="4">
                <v-select
                  v-model="selectedType"
                  :items="typeOptions"
                  label="Filter by type"
                  prepend-inner-icon="mdi-filter"
                  variant="outlined"
                  clearable
                  hide-details
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-icon :color="getTypeColor(item.raw.value)">{{ getTypeIcon(item.raw.value) }}</v-icon>
                      </template>
                    </v-list-item>
                  </template>
                  <template #selection="{ item }">
                    <div class="d-flex align-center">
                      <v-icon :color="getTypeColor(item.raw.value)" class="mr-2">{{ getTypeIcon(item.raw.value) }}</v-icon>
                      <span class="text-capitalize">{{ item.raw.title }}</span>
                    </div>
                  </template>
                </v-select>
              </v-col>
            </v-row>

            <v-row>
              <v-col
                v-for="printable in filteredPrintables"
                :key="printable.id"
                cols="12"
                md="6"
                lg="4"
              >
                <v-card elevation="2" height="100%">
                  <v-img
                    :src="getImageUrl(printable.preview)"
                    :alt="`${printable.title} preview`"
                    aspect-ratio="1.414"
                    class="mt-4 mx-2"
                    contain
                  >
                    <template #placeholder>
                      <div class="d-flex align-center justify-center fill-height">
                        <v-progress-circular color="grey-lighten-4" indeterminate />
                      </div>
                    </template>
                  </v-img>

                  <v-card-text class="pb-2">
                    <h3 class="text-h6 font-weight-bold mb-2">{{ printable.title }}</h3>

                    <v-chip
                      :color="getTypeColor(printable.type)"
                      size="small"
                      class="text-capitalize mb-2 font-weight-bold"
                    >
                      <v-icon start size="small">{{ getTypeIcon(printable.type) }}</v-icon>
                      {{ deCamel(printable.type) }}
                    </v-chip>

                    <div class="d-flex align-center text-caption text-medium-emphasis mb-3">
                      <v-icon size="small" class="mr-1">mdi-account</v-icon>
                      by {{ printable.author }}
                      <v-tooltip text="Licensed under CC BY-NC 4.0">
                        <template #activator="{ props }">
                          <v-icon v-bind="props" size="small" class="ml-1" color="grey">mdi-creative-commons</v-icon>
                        </template>
                      </v-tooltip>
                      <v-spacer />
                      <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                      {{ formatDate(printable.date_updated) }}
                    </div>

                    <v-divider class="mb-3" />

                    <div class="d-flex ga-2">
                      <v-btn
                        v-if="printable.front"
                        :href="getImageUrl(printable.front)"
                        target="_blank"
                        download
                        variant="tonal"
                        color="primary"
                        size="small"
                        prepend-icon="mdi-download"
                        class="flex-fill"
                      >
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
                        prepend-icon="mdi-download"
                        class="flex-fill"
                      >
                        Back Side
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <div v-else class="text-center py-12">
            <v-icon size="64" color="grey-lighten-1">mdi-inbox-outline</v-icon>
            <h3 class="text-h5 mt-4 mb-2 text-medium-emphasis">No printables available</h3>
            <p class="text-medium-emphasis">Check back later for new content!</p>
          </div>

        </v-window-item>

      </v-window>

      <v-divider class="my-8" />

      <div class="text-center py-4">
        <v-btn
          href="https://forms.gle/bbNdsZ8iKv7VVFYi8"
          target="_blank"
          rel="noopener noreferrer"
          color="primary"
          variant="outlined"
          size="large"
          prepend-icon="mdi-upload"
          class="text-none"
        >
          Submit Your Artwork
        </v-btn>
        <p class="text-caption text-medium-emphasis mt-2">
          Have anti-ALPR artwork? Share it with the community!
        </p>
      </div>
    </v-container>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import type { Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Hero from '@/components/layout/Hero.vue';

// ── Shopify constants ───────────────────────────────────────────────────────────

const ALL_COLLECTION_ID = '519581958426';

const COLLECTIONS: Record<string, Record<string, string>> = {
  Apparel: {
    'T-Shirts':      '519582155034',
    Hoodies:         '519582220570',
    Hats:            '519582253338',
    'Youth Apparel': '519708311834',
  },
  Drinkware: {
    Mugs:            '519582482714',
    Tumblers:        '519583793434',
    'Water Bottles': '519708475674',
    Koozies:         '519583826202',
  },
  Accessories: {
    Bags:     '519708541210',
    Patches:  '519582318874',
    Stickers: '519582515482',
    Buttons:  '519582548250',
    Magnets:  '519582089498',
  },
  'Home Accessories': {
    'Yard Signs': '519582056730',
  },
  'Car Accessories': {
    'Magnets':        '519582089498',
    'License Plates': '519708410138',
  },
  'Tech Accessories': {
    'Phone Cases':    '519708147994',
    'Laptop Sleeves': '519708213530',
  },
  'Featured': {
    'No ALPRs':       '520528560410',
  },
};

// Every surface the Shopify SDK renders (product tiles, the product modal,
// and the cart drawer) gets an explicit background + text color pulled from
// this palette, since the SDK has no awareness of the host page's theme and
// otherwise falls back to its own static (light) defaults.
function buildShopifyOptions(dark: boolean) {
  const surfaceBg   = dark ? '#1e1e1e' : '#ffffff';
  const surfaceBg2  = dark ? '#2a2a2a' : '#f5f5f5'; // footer/header accent surface
  const modalText   = dark ? '#e0e0e0' : '#2c2c2c';
  const modalText2  = dark ? '#b0b0b0' : '#6b6b6b';
  const borderColor = dark ? '#3a3a3a' : '#e0e0e0';

  return {
    product: {
      styles: {
        product: {
          'background-color': surfaceBg,
          '@media (min-width: 601px)': {
            'max-width': 'calc(33% - 20px)',
            'margin-left': '20px',
            'margin-bottom': '50px',
            width: 'calc(33% - 20px)',
          },
        },
        title: { 'font-family': 'Raleway, sans-serif', 'font-size': '17px', color: modalText },
        button: {
          'font-family': 'Raleway, sans-serif',
          'font-weight': 'bold',
          'font-size': '16px',
          'padding-top': '16px',
          'padding-bottom': '16px',
          ':hover': { 'background-color': '#0081ac', color: '#ffffff' },
          'background-color': 'rgb(18, 151, 195)',
          color: '#ffffff',
          ':focus': { 'background-color': '#0081ac', color: '#ffffff' },
          'border-radius': '4px',
          'padding-left': '20px',
          'padding-right': '20px',
        },
        quantityInput: {
          'font-size': '16px',
          'padding-top': '16px',
          'padding-bottom': '16px',
          'background-color': surfaceBg2,
          color: modalText,
          'border-color': borderColor,
        },
        price: { 'font-family': 'Raleway, sans-serif', 'font-size': '17px', color: modalText },
        compareAt: { 'font-family': 'Raleway, sans-serif', 'font-size': '14.45px', color: modalText2 },
        unitPrice: { 'font-family': 'Raleway, sans-serif', 'font-size': '14.45px', color: modalText2 },
        description: { 'font-family': 'Raleway, sans-serif', color: modalText2 },
      },
      buttonDestination: 'modal',
      contents: { button: false, options: false },
      isButton: true,
      text: { button: 'View Item' },
      googleFonts: ['Raleway'],
    },
    productSet: {
      styles: {
        products: { '@media (min-width: 601px)': { 'margin-left': '-20px' } },
      },
      text: {
        nextPageButton: 'Load more',
      },
    },
    modalProduct: {
      contents: { img: false, imgWithCarousel: true, button: false, buttonWithQuantity: true },
      styles: {
        modal: { 'background-color': surfaceBg },
        product: {
          'background-color': surfaceBg,
          '@media (min-width: 601px)': { 'max-width': '100%', 'margin-left': '0px', 'margin-bottom': '0px' },
        },
        button: {
          'font-family': 'Raleway, sans-serif',
          'font-weight': 'bold',
          'font-size': '16px',
          'padding-top': '16px',
          'padding-bottom': '16px',
          ':hover': { 'background-color': '#0081ac', color: '#ffffff' },
          'background-color': 'rgb(18, 151, 195)',
          color: '#ffffff',
          ':focus': { 'background-color': '#0081ac', color: '#ffffff' },
          'border-radius': '4px',
          'padding-left': '20px',
          'padding-right': '20px',
        },
        quantityInput: {
          'font-size': '16px',
          'padding-top': '16px',
          'padding-bottom': '16px',
          'background-color': surfaceBg2,
          color: modalText,
          'border-color': borderColor,
        },
        title:       { 'font-family': 'Raleway, sans-serif', 'font-weight': 'bold',   'font-size': '26px',   color: modalText },
        price:       { 'font-family': 'Raleway, sans-serif', 'font-weight': 'normal', 'font-size': '18px',   color: modalText },
        compareAt:   { 'font-family': 'Raleway, sans-serif', 'font-weight': 'normal', 'font-size': '15.3px', color: modalText2 },
        unitPrice:   { 'font-family': 'Raleway, sans-serif', 'font-weight': 'normal', 'font-size': '15.3px', color: modalText2 },
        description: { 'font-family': 'Raleway, sans-serif', 'font-weight': 'normal', 'font-size': '14px',   color: modalText2 },
      },
      googleFonts: ['Raleway'],
      text: { button: 'Add to cart' },
    },
    option: {
      styles: {
        label:  { 'font-family': 'Raleway, sans-serif' },
        select: { 'font-family': 'Raleway, sans-serif' },
      },
      googleFonts: ['Raleway'],
    },
    cart: {
      styles: {
        cart: { 'background-color': surfaceBg },
        header: { 'background-color': surfaceBg, color: modalText, 'border-color': borderColor },
        lineItems: { 'background-color': surfaceBg, color: modalText, 'border-color': borderColor },
        footer: { 'background-color': surfaceBg2, color: modalText, 'border-color': borderColor },
        title: { color: modalText },
        notice: { color: modalText2 },
        currency: { color: modalText },
        button: {
          'font-family': 'Raleway, sans-serif',
          'font-weight': 'bold',
          'font-size': '16px',
          'padding-top': '16px',
          'padding-bottom': '16px',
          ':hover': { 'background-color': '#0081ac', color: '#ffffff' },
          'background-color': 'rgb(18, 151, 195)',
          color: '#ffffff',
          ':focus': { 'background-color': '#0081ac', color: '#ffffff' },
          'border-radius': '4px',
        },
      },
      text: {
        total: 'Subtotal',
        notice: 'Shipping and discount codes are added at checkout - powered by Agora Markets',
        button: 'Checkout',
        noteDescription: 'Additional Information for the deflock.org team',
      },
      googleFonts: ['Raleway'],
    },
    toggle: {
      styles: {
        toggle: {
          'font-family': 'Raleway, sans-serif',
          'font-weight': 'bold',
          'background-color': 'rgb(18, 151, 195)',
          color: '#ffffff',
          ':hover': { 'background-color': '#0081ac', color: '#ffffff' },
          ':focus': { 'background-color': '#0081ac', color: '#ffffff' },
        },
        count: { 'font-size': '16px' },
      },
      googleFonts: ['Raleway'],
    },
  };
}

// ── Theme ───────────────────────────────────────────────────────────────────────

const theme = useTheme();
const isDark = computed(() => theme.global.current.value.dark);

// ── Tabs ────────────────────────────────────────────────────────────────────────

const route = useRoute();
const router = useRouter();

const activeTab = ref((route.query.tab as string) || 'shop');

// ── Shopify state ───────────────────────────────────────────────────────────────

interface CollectionSelectItem {
  id: string;
  title: string;
  type: 'item' | 'header';
  group: string | null;
}

const collectionSelectItems = computed<CollectionSelectItem[]>(() => {
  const items: CollectionSelectItem[] = [
    { id: ALL_COLLECTION_ID, title: 'All Products', type: 'item', group: null },
  ];
  for (const [groupName, subItems] of Object.entries(COLLECTIONS)) {
    items.push({ id: `__header__${groupName}`, title: groupName, type: 'header', group: null });
    for (const [label, id] of Object.entries(subItems)) {
      items.push({ id, title: label, type: 'item', group: groupName });
    }
  }
  return items;
});

const collectionId = ref((route.query.category as string) || ALL_COLLECTION_ID);
const shopifyContainer = ref<HTMLElement | null>(null);
const shopifyReady = ref(false);

// Sync tab + category to URL so back/forward/refresh restores state.
watch([activeTab, collectionId], ([tab, category]) => {
  const currentTab = (route.query.tab as string) || 'shop';
  const currentCategory = (route.query.category as string) || ALL_COLLECTION_ID;
  if (tab === currentTab && category === currentCategory) return;
  router.push({
    query: {
      ...(tab !== 'shop' ? { tab } : {}),
      ...(category !== ALL_COLLECTION_ID ? { category } : {}),
    },
  });
}, { flush: 'post' });

// Sync refs back from URL when the user navigates with back/forward.
watch(() => route.query, (query) => {
  const newTab = (query.tab as string) || 'shop';
  const newCategory = (query.category as string) || ALL_COLLECTION_ID;
  if (activeTab.value !== newTab) activeTab.value = newTab;
  if (collectionId.value !== newCategory) collectionId.value = newCategory;
});

watch(collectionId, (id) => {
  if (window.ShopifyBuy?.UI) renderShopify(id);
});

declare global {
  interface Window { ShopifyBuy: any }
}

// The client/checkout is built exactly once and reused for the lifetime of
// the page. Rebuilding it on every theme or collection change risked
// re-triggering whatever caused the earlier "empty cart on page load" bug —
// now on every toggle instead of just once per load.
let shopifyUIPromise: Promise<any> | null = null;
let shopifyUI: any = null;
let shopifyComponent: any = null;
let shopifyRenderToken = 0;

function getShopifyUI(): Promise<any> {
  if (shopifyUIPromise) return shopifyUIPromise;
  const client = window.ShopifyBuy.buildClient({
    domain: 'agora.markets',
    storefrontAccessToken: '78991208f7fea14aa4ac02a58f8025dd',
  });
  shopifyUIPromise = window.ShopifyBuy.UI.onReady(client).then((ui: any) => {
    shopifyUI = ui;
    return ui;
  });
  return shopifyUIPromise;
}

// The cart drawer and product modal are singletons the SDK attaches outside
// `shopifyContainer` (not as children of it). Destroys every component
// instance the SDK created (collection, plus whatever cart/toggle it
// auto-spawned) so a rebuild always starts from a clean slate — updateConfig()
// was tried here previously but doesn't reliably clear already-mounted DOM,
// which caused old collections/themes to linger alongside new ones.
function destroyShopifyComponents() {
  if (!shopifyUI?.components) return;
  Object.values(shopifyUI.components).forEach((instances: any) => {
    (instances as any[]).forEach((component) => {
      try {
        component?.destroy?.();
      } catch {
        // Component may already be detached; safe to ignore.
      }
    });
  });
  shopifyComponent = null;
}

function renderShopify(id: string) {
  const container = shopifyContainer.value;
  if (!container) return;

  // Guards against overlapping renders (e.g. the theme value settling in
  // two quick ticks). If a newer render starts before this one's async
  // onReady() resolves, the stale callback below becomes a no-op instead
  // of creating a second, duplicate set of product tiles.
  const myToken = ++shopifyRenderToken;
  shopifyReady.value = false;

  getShopifyUI().then((ui: any) => {
    if (myToken !== shopifyRenderToken) return;

    destroyShopifyComponents();
    container.innerHTML = '';

    shopifyComponent = ui.createComponent('collection', {
      id,
      node: container,
      moneyFormat: '%24%7B%7Bamount%7D%7D',
      options: buildShopifyOptions(isDark.value),
    });
    shopifyReady.value = true;
  });
}

// Rebuild the widget whenever the Vuetify theme flips, so the cart drawer
// and product modal singletons pick up the new theme immediately instead
// of requiring a page refresh.
watch(isDark, () => {
  if (window.ShopifyBuy?.UI) renderShopify(collectionId.value);
});

function loadShopifySDK() {
  if (window.ShopifyBuy?.UI) {
    renderShopify(collectionId.value);
    return;
  }
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
  script.onload = () => renderShopify(collectionId.value);
  document.head.appendChild(script);
}


// ── Printables ──────────────────────────────────────────────────────────────────

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

const printables: Ref<Printable[]> = ref([]);
const loading = ref(true);
const error: Ref<string | null> = ref(null);
const selectedType: Ref<string | null> = ref(null);

const typeOptions = computed(() => {
  const types = [...new Set(printables.value.map(p => p.type))];
  return types.map(type => ({
    title: type.charAt(0).toUpperCase() + type.slice(1),
    value: type,
  }));
});

const filteredPrintables = computed(() => {
  if (!selectedType.value) return printables.value;
  return printables.value.filter(p => p.type === selectedType.value);
});

const fetchPrintables = async (): Promise<void> => {
  try {
    loading.value = true;
    error.value = null;
    const response = await fetch('https://cms.deflock.me/items/Printables');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data: CMSResponse = await response.json();
    printables.value = data.data || [];
  } catch (err) {
    console.error('Error fetching printables:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load printables';
  } finally {
    loading.value = false;
  }
};

const deCamel = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1 $2');

const getImageUrl = (imageId: string) => imageId ? `https://cms.deflock.me/assets/${imageId}` : '';

const getTypeColor = (type: string): string =>
  ({ poster: 'primary', zine: 'success', yardSign: 'secondary', sticker: 'accent', bumperSticker: 'info' } as Record<string, string>)[type] ?? 'grey';

const getTypeIcon = (type: string): string =>
  ({ poster: 'mdi-post', zine: 'mdi-book-open-page-variant', yardSign: 'mdi-sign-real-estate', sticker: 'mdi-sticker-circle-outline', bumperSticker: 'mdi-rectangle-outline' } as Record<string, string>)[type] ?? 'mdi-file';

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

watch(shopifyContainer, (el) => {
  if (el) loadShopifySDK();
}, { once: true });

onMounted(() => {
  fetchPrintables();
});
</script>
