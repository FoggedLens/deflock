<template>
  <DefaultLayout>
    <template #header>

<style>
body {
        background-color: #121212;
        color: #e8e8e8;
        font-family: 'PT Serif', Georgia, serif;
        font-size: 15px;
        line-height: 1.5;
        min-height: 100vh;
    }

    /* Dropdown Button */
    .merch-dropbtn {
        background-color: rgb(255, 193, 7);
        color: black;
        padding: 10px 14px 10px 14px;
        font-size: 16px;
        border: none;
    }

    /* The container <div> - needed to position the dropdown content */
    .merch-dropdown {
        position: relative;
        display: inline-block;
    }

    /* Dropdown Content (Hidden by Default) */
    .merch-dropdown-content {
        display: none;
        position: absolute;
        background-color: rgb(255, 193, 7);
        min-width: 150px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
    }

    /* Links inside the dropdown */
    .merch-dropdown-content a {
        color: black;
        padding: 10px 12px;
        text-decoration: none;
        display: block;
        text-align: left;
    }

    /* Change color of dropdown links on hover */
    .merch-dropdown-content a:hover { background-color: black; color:rgb(255, 193, 7) }

    /* Show the dropdown menu on hover */
    .merch-dropdown:hover .merch-dropdown-content { display: block; }

    /* Change the background color of the dropdown button when the dropdown content is shown */
    .merch-dropdown:hover .merch-dropbtn { background-color: black; color:rgb(255, 193, 7)}
</style>


<title>deflock.me store</title>

<script>
// =====================================================================
// COLLECTION CONFIGURATION
// Add, remove, or update collections here. The first entry in each
// group is used as the default collection when none is specified in
// the URL. IDs must match Shopify collection IDs.
// =====================================================================
// Collection ID for the "ALL" button (entire deflock.me catalog)
var ALL_COLLECTION_ID = '519581958426';

// Default collection to load on page load (shown when no ?collectionid= in URL)
var DEFAULT_COLLECTION_ID = '519582056730'; // Yard Signs

var COLLECTIONS = {
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
    Magnets:          '519582089498',
    'License Plates': '519708410138',
  },
  'Tech Accessories': {
    'Phone Cases':    '519708147994',
    'Laptop Sleeves': '519708213530',
  },
};
// =====================================================================
</script>

</head><body>

<!--
    Menu links need to go back to this same file for everything to work properly.
    Shopify needs to be able to treat category changes as page reloads or else the shopping cart gets reset on category change.
    If these links don't work, add the url of the file, e.g.
        <a href="https://www.banishbigbrother.com/merch.html?collectionid=508073541914">Shirts</a>
-->

<div style="text-align: center">
    <div id="merch-nav"></div>
    <script>
    (function buildNav() {
      var nav = document.getElementById('merch-nav');

      // "ALL" button — no dropdown, links directly to the full catalog
      var allBtn = document.createElement('a');
      allBtn.href = '?collectionid=' + ALL_COLLECTION_ID;
      allBtn.className = 'merch-dropbtn';
      allBtn.style.textDecoration = 'none';
      allBtn.style.display = 'inline-block';
      allBtn.textContent = 'ALL';
      nav.appendChild(allBtn);

      // Category dropdowns built from COLLECTIONS
      Object.keys(COLLECTIONS).forEach(function(groupName) {
        var wrapper = document.createElement('div');
        wrapper.className = 'merch-dropdown';

        var btn = document.createElement('button');
        btn.className = 'merch-dropbtn';
        btn.textContent = groupName;
        wrapper.appendChild(btn);

        var content = document.createElement('div');
        content.className = 'merch-dropdown-content';

        var items = COLLECTIONS[groupName];
        Object.keys(items).forEach(function(label) {
          var a = document.createElement('a');
          a.href = '?collectionid=' + items[label];
          a.textContent = label;
          content.appendChild(a);
        });

        wrapper.appendChild(content);
        nav.appendChild(wrapper);
      });
    })();
    </script>
    <br>
    <br>
    <br>

    <div id='collection-component-1762030662068' style="width: 90%"></div>
    <script type="text/javascript">
    var searchParams = new URLSearchParams(window.location.search);
    var collectionid = searchParams.get('collectionid');
    if (!collectionid) { collectionid = DEFAULT_COLLECTION_ID; }

    /*<![CDATA[*/
    (function () {
      var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
      if (window.ShopifyBuy) {
        if (window.ShopifyBuy.UI) {
          ShopifyBuyInit();
        } else {
          loadScript();
        }
      } else {
        loadScript();
      }
      function loadScript() {
        var script = document.createElement('script');
        script.async = true;
        script.src = scriptURL;
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
        script.onload = ShopifyBuyInit;
      }
      function ShopifyBuyInit() {
        var client = ShopifyBuy.buildClient({
          domain: 'ccf325.myshopify.com',
          storefrontAccessToken: '78991208f7fea14aa4ac02a58f8025dd',
        });
        ShopifyBuy.UI.onReady(client).then(function (ui) {
          ui.createComponent('collection', {
            id: collectionid,
            node: document.getElementById('collection-component-1762030662068'),
            moneyFormat: '%24%7B%7Bamount%7D%7D',
            options: {
      "product": {
        "styles": {
          "product": {
            "@media (min-width: 601px)": {
              "max-width": "calc(25% - 20px)",
              "margin-left": "20px",
              "margin-bottom": "50px",
              "width": "calc(25% - 20px)"
            }
          },
          "title": {
            "font-family": "Raleway, sans-serif",
            "font-size": "17px",
            "color": "#ffffff"
          },
          "button": {
            "font-family": "Raleway, sans-serif",
            "font-weight": "bold",
            "font-size": "16px",
            "padding-top": "16px",
            "padding-bottom": "16px",
            ":hover": {
               "background-color": "black", "color": "rgb(255, 193, 7)"
            },
            "background-color": "rgb(255, 193, 7)", "color": "black",
            ":focus": {
               "background-color": "black", "color": "rgb(255, 193, 7)"
            },
            "border-radius": "0px",
            "padding-left": "20px",
            "padding-right": "20px"
          },
          "quantityInput": {
            "font-size": "16px",
            "padding-top": "16px",
            "padding-bottom": "16px"
          },
          "price": {
            "font-family": "Raleway, sans-serif",
            "font-size": "17px",
            "color": "#ffffff"
          },
          "compareAt": {
            "font-family": "Raleway, sans-serif",
            "font-size": "14.45px",
            "color": "#ffffff"
          },
          "unitPrice": {
            "font-family": "Raleway, sans-serif",
            "font-size": "14.45px",
            "color": "#ffffff"
          },
          "description": {
            "font-family": "Raleway, sans-serif"
          }
        },
        "buttonDestination": "modal",
        "contents": {
          "button": false,
          "options": false
        },
        "isButton": true,
        "text": {
          "button": "View Item"
        },
        "googleFonts": [
          "Raleway"
        ]
      },
      "productSet": {
        "styles": {
          "products": {
            "@media (min-width: 601px)": {
              "margin-left": "-20px"
            }
          }
        }
      },
      "modalProduct": {
        "contents": {
          "img": false,
          "imgWithCarousel": true,
          "button": false,
          "buttonWithQuantity": true
        },
        "styles": {
          "product": {
            "@media (min-width: 601px)": {
              "max-width": "100%",
              "margin-left": "0px",
              "margin-bottom": "0px"
            }
          },
          "button": {
            "font-family": "Raleway, sans-serif",
            "font-weight": "bold",
            "font-size": "16px",
            "padding-top": "16px",
            "padding-bottom": "16px",
            ":hover": {
               "background-color": "black", "color": "rgb(255, 193, 7)"
            },
            "background-color": "rgb(255, 193, 7)", "color": "black",
            ":focus": {
              "background-color": "black", "color": "rgb(255, 193, 7)"
            },
            "border-radius": "0px",
            "padding-left": "20px",
            "padding-right": "20px"
          },
          "quantityInput": {
            "font-size": "16px",
            "padding-top": "16px",
            "padding-bottom": "16px"
          },
          "title": {
            "font-family": "Raleway, sans-serif",
            "font-weight": "bold",
            "font-size": "26px",
            "color": "#4c4c4c"
          },
          "price": {
            "font-family": "Raleway, sans-serif",
            "font-weight": "normal",
            "font-size": "18px",
            "color": "#4c4c4c"
          },
          "compareAt": {
            "font-family": "Raleway, sans-serif",
            "font-weight": "normal",
            "font-size": "15.299999999999999px",
            "color": "#4c4c4c"
          },
          "unitPrice": {
            "font-family": "Raleway, sans-serif",
            "font-weight": "normal",
            "font-size": "15.299999999999999px",
            "color": "#4c4c4c"
          },
          "description": {
            "font-family": "Raleway, sans-serif",
            "font-weight": "normal",
            "font-size": "14px",
            "color": "#4c4c4c"
          }
        },
        "googleFonts": [
          "Raleway"
        ],
        "text": {
          "button": "Add to cart"
        }
      },
      "option": {
        "styles": {
          "label": {
            "font-family": "Raleway, sans-serif"
          },
          "select": {
            "font-family": "Raleway, sans-serif"
          }
        },
        "googleFonts": [
          "Raleway"
        ]
      },
      "cart": {
        "styles": {
          "button": {
            "font-family": "Raleway, sans-serif",
            "font-weight": "bold",
            "font-size": "16px",
            "padding-top": "16px",
            "padding-bottom": "16px",
            ":hover": {
               "background-color": "black", "color": "rgb(255, 193, 7)"
            },
            "background-color": "rgb(255, 193, 7)", "color": "black",
            ":focus": {
               "background-color": "black", "color": "rgb(255, 193, 7)"
            },
            "border-radius": "0px"
          }
        },
        "text": {
          "total": "Subtotal",
          "notice": "Shipping and discount codes are added at checkout - powered by the Agora Markets",
          "button": "Checkout",
          "noteDescription": "Additional Information for the deflock.org teamt"
        },
        "googleFonts": [
          "Raleway"
        ]
      },
      "toggle": {
        "styles": {
          "toggle": {
            "font-family": "Raleway, sans-serif",
            "font-weight": "bold",
            "background-color": "rgb(255, 193, 7)", 
	    "color": "black",
            ":hover": {
              "background-color": "black", "color": "rgb(255, 193, 7)"
            },
            ":focus": {
              "background-color": "black", "color": "rgb(255, 193, 7)"
            }
          },
          "count": {
            "font-size": "16px"
          }
        },
        "googleFonts": [
          "Raleway"
        ]
      }
    },
          });
        });
      }
    })();
    /*]]>*/
    </script>
</div>

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
                prepend-inner-icon="mdi-filter"
                variant="outlined"
                clearable
                hide-details
                class="filter-select"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon :color="getTypeColor(item.raw.value)">{{ getTypeIcon(item.raw.value) }}</v-icon>
                    </template>
                  </v-list-item>
                </template>
                <template v-slot:selection="{ item }">
                  <div class="d-flex align-center">
                    <v-icon :color="getTypeColor(item.raw.value)" class="mr-2">{{ getTypeIcon(item.raw.value) }}</v-icon>
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
                  <v-icon start size="small">{{ getTypeIcon(printable.type) }}</v-icon>
                  {{ deCamel(printable.type) }}
                </v-chip>
                
                <div class="d-flex align-center text-caption text-grey mb-3">
                  <v-icon size="small" class="mr-1">mdi-account</v-icon>
                  by {{ printable.author }}
                  <v-tooltip text="Licensed under CC BY-NC 4.0">
                    <template v-slot:activator="{ props }">
                      <v-icon 
                        v-bind="props"
                        size="small" 
                        class="ml-1"
                        color="grey"
                      >
                        mdi-creative-commons
                      </v-icon>
                    </template>
                  </v-tooltip>
                  <v-spacer />
                  <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
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
                      prepend-icon="mdi-download"
                      class="flex-1-1-50"
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
                      class="flex-1-1-50"
                    >
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
        <v-icon size="64" color="grey-lighten-1">mdi-inbox-outline</v-icon>
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
          prepend-icon="mdi-upload"
          class="text-none"
        >
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

const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    poster: 'mdi-post',
    zine: 'mdi-book-open-page-variant',
    yardSign: 'mdi-sign-real-estate',
    sticker: 'mdi-sticker-circle-outline',
    bumperSticker: 'mdi-rectangle-outline',
  };
  return icons[type] || 'mdi-file';
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