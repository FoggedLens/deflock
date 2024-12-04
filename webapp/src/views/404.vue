<template>
  <v-container>
    <div class="text-center">
      <h1>Page Not Found</h1>

      <div class="mt-8 mb-16">
        <v-img height="300" src="/404.webp" />
        <p class="caption">just like the license plate this guy is searching for</p>
      </div>

      <v-btn color="primary" to="/"><v-icon start>mdi-home</v-icon>Home</v-btn>
    </div>
  </v-container>
</template>

<style scoped>
.caption {
  font-size: 1.2rem;
  color: #666;
}
</style>
