<template>
  <v-app>
    <v-navigation-drawer
      app
      permanent
      color="white"
      width="220"
      class="pa-4"
    >
      <!-- Logo -->
      <div class="d-flex align-center mb-6">
        <!-- <v-img
          src="/logo.png"
          max-width="40"
          class="mr-3"
        ></v-img> -->
        <h2 class="font-weight-bold">Lost & Found</h2>
      </div>

      <!-- Sidebar Menu -->
      <v-list density="compact" nav>
        <v-list-item
          v-for="(item, index) in menuItems"
          :key="index"
          :to="item.to"
          prepend-icon="mdi-chevron-right"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <!-- Logout Button -->
      <div class="mt-auto">
        <v-btn
          block
          color="black"
          variant="tonal"
          class="mt-5"
          prepend-icon="mdi-logout"
        >
          Logout
        </v-btn>
      </div>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
const menuItems = [
  { title: 'Dashboard', to: '/' },
  { title: 'Lost Items', to: '/items' },
  { title: 'Settings', to: '/items/[id]' }
]
</script>

<style scoped>
.v-navigation-drawer {
  border-right: 1px solid #e0e0e0;
}
</style>
