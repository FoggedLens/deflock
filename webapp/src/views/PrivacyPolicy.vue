<template>
<DefaultLayout>
  <v-container class="narrow-text">
    <h1>Privacy Policy</h1>
    <p>Effective Date: <b>1/4/2025</b></p>

    <p>
      At DeFlock, we respect your privacy. This privacy policy outlines our approach to user privacy and how information may be handled when using our platform.
    </p>

    <h2>Information We Collect</h2>
    <p>
      DeFlock does not collect, store, or process any personal information about our users. We use local storage in your browser to anonymously identify first-time visitors for the purpose of showing an introductory message as well as to persist application state, including your dark/light theme preference. This data cannot be used to identify you personally. We do not use cookies, analytics, or tracking technologies on our website.
    </p>

    <h2>Route Calculation (maps.deflock.org)</h2>
    <p>
      On our maps page (<a href="https://maps.deflock.org">maps.deflock.org</a>), we offer a route planning feature that calculates routes designed to avoid ALPR cameras. When you request a route, your start and end coordinates are sent to our server solely for the purpose of computing the route. These coordinates are not logged or retained long-term.
    </p>

    <h2>Third-Party Services</h2>
    <p>
      DeFlock relies on OpenStreetMap (OSM) for map data and functionality. If you choose to contribute Automatic License Plate Recognition (ALPR) data or other content to OSM, you will interact directly with their platform. OSM may request personal information, such as your email address and name, to facilitate your contributions. Please refer to the OpenStreetMap Privacy Policy for details on their data practices.
    </p>

    <h2>Your Choices</h2>
    <p>
      If you prefer not to share personal information, you are not required to contribute to OSM to use DeFlock. You can still enjoy the map data we source from OSM without uploading additional information.
    </p>

    <h2>Contact Us</h2>
    <p>
      If you have any questions or concerns about this privacy policy, please contact us at:
    </p>
    <p>
      Email: <a href="mailto:contact@deflock.org">contact@deflock.org</a>
    </p>

    <h2>Policy Updates</h2>
    <p>
      We may update this privacy policy from time to time to reflect changes in our practices or for legal compliance. The "Effective Date" above will indicate when the latest changes were made.
    </p>
  </v-container>
</DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
</script>
