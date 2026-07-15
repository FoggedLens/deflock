<template>
  <v-footer>
    <v-container>
      <v-row align-items="center" justify="center">

        <v-col cols="12" class="mt-4">
          <v-img height="30" contain src="/deflock-logo-grey.svg" />
        </v-col>
        
        <!-- Link sections: CSS grid with auto-fit/minmax so columns reflow
             to a new row dynamically based on available width, rather than
             snapping to a fixed breakpoint that can leave text truncated
             (e.g. "Terms of Se…") right before it reorders. -->
        <v-col cols="12">
          <div class="footer-links-grid">

            <!-- Info -->
            <div>
              <v-list-subheader class="mx-2 font-weight-black text-subtitle-1" :class="isDark ? 'text-grey-lighten-5' : 'text-black'" id="footer-info-heading">Info</v-list-subheader>
              <v-list density="compact" aria-labelledby="footer-info-heading" role="list">
                <v-list-item role="listitem"
                  v-for="link in internalLinks"
                  :key="link.title"
                  link
                  :to="link.to"
                  slim
                  :aria-label="link.alt"
                >
                    <v-list-item-title class="d-flex align-center">
                    <v-icon class="custom-icon" start :icon="link.icon" :alt="link.alt" />
                    {{ link.title }}
                    </v-list-item-title>
                </v-list-item>
              </v-list>
            </div>

            <!-- Contact Us -->
            <div>
              <v-list-subheader class="mx-2 font-weight-black text-subtitle-1" :class="isDark ? 'text-grey-lighten-5' : 'text-black'" id="footer-contact-heading">Contact Us</v-list-subheader>
              <v-list density="compact" aria-labelledby="footer-contact-heading" role="list">
                <v-list-item role="listitem"
                  v-for="link in contactLinks"
                  :key="link.title"
                  link
                  :to="link.to"
                  slim
                  :aria-label="link.alt"
                >
                    <v-list-item-title class="d-flex align-center">
                    <v-icon class="custom-icon" start :icon="link.icon" :alt="link.alt" />
                    {{ link.title }}
                    </v-list-item-title>
                </v-list-item>
              </v-list>
            </div>

            <!-- Get Involved -->
            <div>
              <v-list-subheader class="mx-2 font-weight-black text-subtitle-1" :class="isDark ? 'text-grey-lighten-5' : 'text-black'" id="footer-involved-heading">Get Involved</v-list-subheader>
              <v-list density="compact" aria-labelledby="footer-involved-heading" role="list">
                <v-list-item
                  v-for="link in getInvolvedLinks"
                  :key="link.title"
                  link
                  slim
                  :href="link.href"
                  :to="link.to"
                  :target="link.href ? '_blank' : undefined"
                  role="listitem"
                >
                  <v-list-item-title class="d-flex align-center justify-start">
                    <v-icon start class="custom-icon" :icon="link.icon"></v-icon>
                    {{ link.title }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </div>

          </div>
        </v-col>


        <!-- Copyright -->
        <v-col
          class="text-center d-flex align-center justify-center text-grey-darken-1"
          cols="12"
        >
          <div class="copyright" :class="isDark ? 'text-grey-lighten-5' : 'text-black'">
            <p>&copy; {{ currentYear }} DeFlock. All Rights Reserved</p>
            <p>Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" style="color: unset; font-weight: normal;">OpenStreetMap contributors</a></p>
            <p class="mt-4">v1.1.0</p>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';
const theme = useTheme();
const isDark = computed(() => theme.name.value === 'dark');
const currentYear = new Date().getFullYear();

const internalLinks = [
  { title: 'About', to: '/about', icon: 'mdi-information', alt: 'About' },
  { title: 'Privacy Policy', to: '/privacy', icon: 'mdi-shield-lock', alt: 'Privacy Policy' },
  { title: 'Terms of Service', to: '/terms', icon: 'mdi-file-document', alt: 'Terms of Service' },
];

const contactLinks = [
  { title: 'Press', to: '/press', icon: 'mdi-newspaper', alt: 'Press' },
  { title: 'Contact', to: '/contact', icon: 'mdi-email', alt: 'Contact' },
];

const getInvolvedLinks = [
  { title: 'Local Groups', to: '/groups', icon: 'mdi-account-group' },
  { title: 'GitHub', href: 'https://github.com/FoggedLens/deflock', icon: 'mdi-github' },
  { title: 'Submit Cameras', to: '/report', icon: 'mdi-map-marker-plus' },
]
</script>

<style scoped>
.custom-icon {
  opacity: var(--v-medium-emphasis-opacity);
}
.copyright p {
  font-size: 0.85rem;
  line-height: 0.5rem;
}

/* Plain flexbox + wrap, rather than CSS grid's auto-fit/minmax: grid's
   auto-fit track-counting algorithm doesn't properly support intrinsic
   sizes (max-content) as a track minimum, which is why that approach
   either clipped text, wrapped it mid-word, or collapsed to one column
   depending on the minimum used. Flexbox with flex-wrap naturally sizes
   each item to its content and only wraps an item to the next line once
   it genuinely doesn't fit — no guessed pixel thresholds required.

   Columns are NOT stretched (flex-grow: 0) — each stays sized to its own
   content. Letting them grow to fill space (a prior revision) made wider
   columns pad out with empty space to the right of their left-aligned
   text, which visually dragged the whole row's "center of mass" left of
   the row's true center — an effect that got worse the more room there
   was to stretch into, i.e. on wider screens.

   Instead, `justify-content: space-evenly` distributes the *gaps* — both
   between columns and on the outer edges — based on the container's
   actual width. That gap recalculates continuously as the viewport
   resizes, so spacing scales smoothly with no fixed max-width/threshold
   needed and no snapping between layout states. */
.footer-links-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  row-gap: 24px;
}

.footer-links-grid > div {
  flex: 0 0 auto;
}
/* Keep each link label on a single line so a column reflows to its own
   row instead of wrapping mid-word when space is tight. */
.footer-links-grid :deep(.v-list-item-title) {
  white-space: nowrap;
}
</style>






