<template>
  <v-app>
    <v-navigation-drawer app permanent color="white" width="220" class="pa-4">
      <v-row class="justify-center">
        <v-col cols="10">
          <v-img src="/images/logo-2.png" alt="Logo" contain></v-img>
        </v-col>
      </v-row>
      <!-- Sidebar -->
      <v-list density="compact" nav>
        <v-list-item
          v-for="(item, index) in menuItems"
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

    <!-- Reusable Confirmation Dialog -->
    <ConfirmDialog
      v-model="showDialog"
      title="Confirm Logout"
      message="Are you sure you want to log out?"
      confirm-text="Logout"
      cancel-text="Cancel"
      @confirm="handleLogout"
    />
  </v-app>
</template>

<script setup>
import { ref } from "vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { useRouter } from "vue-router";

// ✅ Import signOut and auth from Firebase
import { getAuth, signOut } from "firebase/auth";

const menuItems = [
  { title: "Dashboard", to: "/", icon: "mdi-view-dashboard" },
  { title: "Lost Items", to: "/items", icon: "mdi-package-variant" },
  // { title: "Settings", to: "/items/[id]", icon: "mdi-cog" },
];

const showDialog = ref(false);
const router = useRouter();

// ✅ Get auth instance
const auth = getAuth();
const user = useCookie("user");
async function handleLogout() {
  try {
    await signOut(auth); // Firebase logout
    user.value = null; // Clear user cookie
    router.push("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
}
</script>
