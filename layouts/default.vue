<template>
  <v-app>
    <!-- Show this only on mobile (≤ md) -->
    <v-container
      fluid
      class="d-flex flex-column align-center justify-center text-center d-md-none"
      style="height: 100vh"
    >
      <v-icon size="64" color="error" class="mb-4">mdi-desktop-off</v-icon>
      <h2 class="text-h5 font-weight-bold">Admin Panel Unavailable</h2>
      <p class="text-subtitle-1 mt-2">
        The admin panel is only accessible on desktop screens.
      </p>
    </v-container>

    <!-- ✅ Show this only on desktop (md and above) -->
    <div class="d-none d-md-flex" style="width: 100%">
      <v-navigation-drawer app permanent color="white" width="220" class="pa-4">
        <v-row class="justify-center">
          <v-col cols="10">
            <v-img src="/images/logo-2.png" alt="Logo" contain></v-img>
          </v-col>
        </v-row>

        <!-- Sidebar -->
        <v-list density="compact" nav>
          <v-list-item
            v-for="(item, index) in [
              { title: 'Dashboard', to: '/', icon: 'mdi-view-dashboard' },
              {
                title: 'Lost Items',
                to: '/items',
                icon: 'mdi-package-variant',
              },
            ]"
            :key="index"
            :to="item.to"
            :prepend-icon="item.icon"
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
            @click="showDialog = true"
          >
            Logout
          </v-btn>
        </div>
      </v-navigation-drawer>

      <v-main>
        <v-container fluid>
          <slot />
        </v-container>
      </v-main>

      <!-- Confirmation Dialog -->
      <ConfirmDialog
        v-model="showDialog"
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        confirm-text="Logout"
        cancel-text="Cancel"
        @confirm="handleLogout"
      />
    </div>
  </v-app>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { getAuth, signOut } from "firebase/auth";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { useDisplay } from "vuetify"; // ✅ Vuetify composable

const { width } = useDisplay();
const isMobile = computed(() => width.value <= 768);

const menuItems = [
  { title: "Dashboard", to: "/", icon: "mdi-view-dashboard" },
  { title: "Lost Items", to: "/items", icon: "mdi-package-variant" },
];

const showDialog = ref(false);
const router = useRouter();

const auth = getAuth();
const user = useCookie("user");

async function handleLogout() {
  try {
    await signOut(auth);
    user.value = null;
    router.push("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
}
</script>
