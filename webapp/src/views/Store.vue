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

          <p class="mb-6 text-center text-medium-emphasis">
            T-shirts, stickers, yard signs, and more — sold at (our) cost to help spread the word.<br>
            Tips will be used to push back against mass surveillance.
          </p>

          <v-row justify="center" class="mb-6">
            <v-col cols="12" md="6" lg="4">
              <v-select
                v-model="collectionId"
                :items="collectionSelectItems"
                item-title="title"
                item-value="id"
                :item-props="(item: CollectionSelectItem) => item.type === 'header' ? { disabled: true, class: 'font-weight-bold text-medium-emphasis text-caption' } : {}"
                label="Browse by category"
                variant="outlined"
                prepend-inner-icon="mdi-tag-outline"
                clearable
                hide-details
              >
                <template #item="{ props, item }">
                  <v-list-subheader v-if="item.raw.type === 'header'">
                    {{ item.raw.title }}
                  </v-list-subheader>
                  <v-list-item v-else v-bind="props" />
                </template>
                <template #selection="{ item }">
                  {{ item.raw.title }}
                </template>
              </v-select>
            </v-col>
          </v-row>

          <v-row v-if="collectionDescription" justify="center" class="mb-6">
            <v-col cols="12" md="8" lg="6" class="text-center collection-description-col">
              <div class="text-body-2 text-medium-emphasis" v-html="collectionDescription" />
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
  },
  'Community Awareness': {
    'Yard Signs': '519582056730',
    'Flyers/Posters/Handouts': '521125593370',
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
          'background-color': `${surfaceBg2} !important`,
          color: `${modalText} !important`,
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
      layout: 'vertical',
      contents: { img: false, imgWithCarousel: true, button: false, buttonWithQuantity: true },
      styles: {
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
          'background-color': `${surfaceBg2} !important`,
          color: `${modalText} !important`,
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
        notice: 'Please be aware of local laws and ordinances regarding public signage; many jurisdictions require a permit to do so. Please do not Place Signage on Private Property without permission. Shipping and discount codes are added at checkout - powered by Agora Markets',
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
    // `lineItem` is its own top-level component (a sibling of `cart`, not
    // nested inside it) — confirmed against real working configs in
    // Shopify's community forum. A previous revision nested this under
    // cart.styles.lineItems, which isn't a real key and silently did
    // nothing, leaving each cart row's quantity stepper on the SDK's
    // unstyled default (white input, illegible in dark mode).
    lineItem: {
      styles: {
        title: { color: modalText },
        itemTitle: { color: modalText }, // some SDK builds use this key instead of `title`
        variantTitle: { color: modalText2 },
        price: { color: modalText },
        fullPrice: { color: modalText },
        discount: { color: modalText2 },
        discountIcon: { fill: modalText2 },
        quantity: { color: modalText },
        quantityIncrement: {
          color: `${modalText} !important`,
          'border-color': borderColor,
          'background-color': `${surfaceBg2} !important`,
        },
        quantityDecrement: {
          color: `${modalText} !important`,
          'border-color': borderColor,
          'background-color': `${surfaceBg2} !important`,
        },
        quantityInput: {
          color: `${modalText} !important`,
          'border-color': borderColor,
          'background-color': `${surfaceBg2} !important`,
        },
      },
    },
    // `modal` is the pop-up wrapper itself and is a separate top-level
    // component from `modalProduct` (which styles the product content
    // inside it) — a previous revision nested this inside modalProduct,
    // where it likely had no effect. This key name is a best-effort guess
    // following the self-named pattern seen in `cart.styles.cart` and
    // `toggle.styles.toggle`; it hasn't been confirmed against a working
    // example the way the lineItem keys above have.
    modal: {
      styles: {
        modal: { 'background-color': surfaceBg },
      },
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
const collectionDescription = ref('');

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
  // The category select is clearable to match the Downloads filter's UX,
  // but the Shopify embed always needs a valid collection id — clearing
  // falls back to "All Products" rather than passing null through.
  if (!id) {
    collectionId.value = ALL_COLLECTION_ID;
    return;
  }
  if (window.ShopifyBuy?.UI) renderShopify(id);
fetchCollectionDescription(id);
});

// Fetches the real collection description from Shopify's Storefront API —
// entirely separate from the Buy Button SDK/iframe embed, so a failure or
// missing description here can never affect the product grid itself.
async function fetchCollectionDescription(id: string): Promise<void> {
  try {
    const gid = `gid://shopify/Collection/${id}`;
    const response = await fetch('https://agora.markets/api/2024-10/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': '78991208f7fea14aa4ac02a58f8025dd',
      },
      body: JSON.stringify({
        query: `
          query CollectionDescription($id: ID!) {
            collection(id: $id) {
              descriptionHtml
            }
          }
        `,
        variables: { id: gid },
      }),
    });
    if (!response.ok) {
      collectionDescription.value = '';
      return;
    }
    const json = await response.json();
    collectionDescription.value = json?.data?.collection?.descriptionHtml ?? '';

  } catch {
    collectionDescription.value = '';
  }
}
declare global {
  interface Window { ShopifyBuy: any }
}

let shopifyRenderToken = 0;

// Plain clear-and-recreate, matching the only pattern BuyButton.js
// documents: ui.createComponent(type, config) with a node to render into.
// There is no documented destroy()/updateConfig() API — a prior revision
// guessed at both and produced empty renders, since createComponent() with
// a previously-used node confused the SDK's internal state.
//
// A fresh client + ui is built on every render rather than cached and
// reused. Caching was tried to reduce how often buildClient() runs (out of
// concern for the earlier "empty cart on page load" bug), but reusing the
// same ui instance across multiple createComponent() calls broke the
// product grid on theme change — same category of problem as the
// destroy()/updateConfig() guesswork, just from a different angle. This is
// the version that was confirmed working for live grid theme-switching.
//
// Per Shopify's own docs, creating a product/collection component also
// auto-creates a separate cart and "cart toggle" component tied to that
// call — they are not children of `container` and there is no documented
// way to re-theme them without a full page reload. That's an accepted,
// known limitation (Option A): the product grid re-themes live on every
// toggle; the cart drawer and product modal pick up the new theme on the
// next page load.
function renderShopify(id: string) {
  const container = shopifyContainer.value;
  if (!container || !window.ShopifyBuy?.UI) return;

  // Guards against overlapping renders (e.g. the theme value settling in
  // two quick ticks). If a newer render starts before this one's async
  // onReady() resolves, the stale callback below becomes a no-op instead
  // of creating a second, duplicate set of product tiles.
  const myToken = ++shopifyRenderToken;
  shopifyReady.value = false;

  const client = window.ShopifyBuy.buildClient({
    domain: 'agora.markets',
    storefrontAccessToken: '78991208f7fea14aa4ac02a58f8025dd',
  });
  window.ShopifyBuy.UI.onReady(client).then((ui: any) => {
    if (myToken !== shopifyRenderToken) return;

    container.innerHTML = '';
    ui.createComponent('collection', {
      id,
      node: container,
      moneyFormat: '%24%7B%7Bamount%7D%7D',
      options: buildShopifyOptions(isDark.value),
    });
    shopifyReady.value = true;
  });
}

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
  fetchCollectionDescription(collectionId.value);
});
</script>

<style scoped>
/* Shopify's descriptionHtml comes back as raw <p>/<br>/etc. markup; reset
   the default browser paragraph margins so multi-paragraph descriptions
   don't end up with oversized gaps inside this centered column. */
.collection-description-col :deep(p) {
  margin: 0 0 0.75rem;
}
.collection-description-col :deep(p:last-child) {
  margin-bottom: 0;
}
</style>

