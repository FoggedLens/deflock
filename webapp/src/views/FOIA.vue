<template>
<Hero
  imageUrl="/documents.jpg"
  title="How to Request Public Records" 
  description="Learn how simple it is to request ALPR data from your city"
  button-text="Get Started"
  button-href="#how-to"
/>

<v-container class="mb-12">
  <h2>Why File a Public Records Request?</h2>
  <p>
    ALPRs are being installed across the country with little transparency. Public records requests allow us to track where these cameras are, ensuring that all installations are documented.
  </p>
  <p>
    Your help is crucial. Filing a public records request is easy, and your contribution will help us build a complete map of these surveillance networks. We'll even link you to several hundred <a target="_blank" href="https://www.muckrock.com/search/?q=Flock">examples to follow</a>.<sup>[1]</sup>
  </p>
  <footer class="serif text-grey-darken-2 mt-4">
    <small><sup>[1]</sup> While these examples focus on Flock Safety, the process applies to all ALPR vendors. Flock is highlighted here because it is the most widely reported ALPR vendor in the US on OpenStreetMap at the time this was written.</small>
  </footer>

  <v-divider class="my-8" />

  <h2 id="how-to">How to File a Public Records Request</h2>
  <ol class="serif">
    <li class="mb-4">
      Determine the correct agency that would have the responsive documents. For contracts and invoices, this is likely a <b>law enforcement agency</b> such as the police department or sheriff's office. For other records, such as installation permits, this might be the <b>city or county government</b>. If you're unsure, consider submitting requests to multiple agencies or researching which agency oversees the type of records you're seeking.
    </li>
    <li class="mb-4">
      Locate their public records request portal. If they don't have one, find the relevant contact email.
    </li>
    <li class="mb-4">
      <p>
        Browse <a href="https://www.muckrock.com/search/?q=Flock" target="_blank">Muckrock</a> for examples of public records requests related to ALPRs. Use these as templates to draft your own request. Here are some common requests you can adapt:
      </p>
      <ul>
        <li>Right-of-Way Installation Permits (typically include a map of locations)</li>
        <li>Invoices for ALPRs (contain count of cameras)</li>
        <li>Contracts with ALPR vendors (show proof of usage)</li>
        <li>Emails discussing ALPR installations</li>
      </ul>

      <p><b>If you need help tailoring this to your situation, appealing rejections, etc., ChatGPT is a great resource.</b></p>
    </li>
    <li class="mb-4">
      If you receive responsive documents that include location info, <router-link to="/report">add them to the site</router-link>.
    </li>
  </ol>

  <v-alert class="mt-8" type="info" variant="tonal">
    <b>Tip:</b> If you run into any issues while submitting the public records request, such as not being able to locate the records portal or find a contact email, you can use <a href="https://muckrock.com" target="_blank">Muckrock</a>, a nonprofit public records platform that will submit it to the agency on your behalf for a small fee.
  </v-alert>

  <v-divider class="my-8" />

  <h2>Public Records Basics</h2>

  <h3>What is a public records request?</h3>
  <p>
    A public records request is a formal way to ask government agencies for public records. Laws vary by state, but most allow residents to request documents such as contracts, emails, and invoices.
  </p>

  <h3>Who can file a public records request?</h3>
  <p>
    Most states allow anyone to file a public records request, while some restrict it to state residents.
  </p>

  <h3>What can be requested?</h3>
  <p>
    Invoices, contracts, emails, and other documents related to government spending and agreements with companies, including these surveillance companies.
  </p>

  <h3>What if my request is rejected?</h3>
  <p>
    Agencies may reject requests for various reasons, but you can often appeal. <a href="https://discord.gg/aV7v4R3sKT" target="_blank">Let us know</a> if you encounter issues, and we can help.
  </p>

  <h3>Can I remain anonymous?</h3>
  <p>
    Typically, yes. Many states allow you to submit public records requests anonymously or through an alias. If anonymity is important to you, consider using a disposable email address and avoiding personally identifying information in your request. If you're requesting records from a state that requires residency, you may need to provide an in-state address.
  </p>
  
</v-container>

<Footer />

</template>

<script setup lang="ts">
import { useSeoMeta } from '@unhead/vue';
import Hero from '@/components/layout/Hero.vue';
import Footer from '@/components/layout/Footer.vue';

useSeoMeta({
  title: 'How to Request Public Records | DeFlock',
  description: 'Learn how simple it is to request ALPR data from your city.',

  ogTitle: 'How to Request ALPR Data',
  ogDescription: 'Learn how simple it is to request ALPR data from your city.',
  ogImage: 'https://deflock.me/documents.jpg',
});
</script>

<style lang="css" scoped>
@import url('@/assets/typography.css');

blockquote {
  margin: 1em 0;
  padding-left: 1em;
  border-left: 4px solid #ccc;
}
</style>
