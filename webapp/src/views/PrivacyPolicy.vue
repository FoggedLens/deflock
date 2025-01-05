<template>
  <v-container class="mb-16">
    <h1>Privacy Policy</h1>
    <p>Effective Date: <b>1/24/2025</b></p>

    <p>
      At DeFlock, we respect your privacy. This privacy policy outlines our approach to user privacy and how information may be handled when using our platform.
    </p>

    <h2>Information We Collect</h2>
    <p>
      DeFlock does not collect, store, or process any personal information about our users. We use local storage in your browser to anonymously identify first-time visitors for the purpose of showing an introductory message as well as to persist application state. This data cannot be used to identify you personally. We do not use cookies, analytics, or tracking technologies on our website.
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
      Email: <a href="mailto:contact@deflock.me">contact@deflock.me</a>
    </p>

    <h2>Policy Updates</h2>
    <p>
      We may update this privacy policy from time to time to reflect changes in our practices or for legal compliance. The "Effective Date" above will indicate when the latest changes were made.
    </p>
  </v-container>

  <Footer />
</template>

<script setup lang="ts">
import Footer from '@/components/layout/Footer.vue';
</script>
 
<style lang="css" scoped>
@import url('@/assets/typography.css');
</style>
