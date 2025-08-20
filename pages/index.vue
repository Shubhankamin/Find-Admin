<template>
  <v-container fluid>
    <!-- Page Title -->
    <h1 class="text-h4 font-weight-bold mb-6">Dashboard</h1>

    <!-- Top Stats Section -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="pa-4" elevation="3">
          <v-icon size="32" color="primary" class="mb-2"
            >mdi-package-variant</v-icon
          >
          <h3 class="text-h5 font-weight-bold">Total Lost Items</h3>
          <p class="text-h6 mt-2">{{ stats.totalLostItems }}</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4" elevation="3">
          <v-icon size="32" color="success" class="mb-2"
            >mdi-check-circle</v-icon
          >
          <h3 class="text-h5 font-weight-bold">Claimed Items</h3>
          <p class="text-h6 mt-2">{{ stats.claimedItems }}</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4" elevation="3">
          <v-icon size="32" color="error" class="mb-2">mdi-alert</v-icon>
          <h3 class="text-h5 font-weight-bold">Pending Items</h3>
          <p class="text-h6 mt-2">{{ stats.pendingItems }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recently Lost Items -->
    <h2 class="text-h5 font-weight-bold my-6">Recently Lost Items</h2>

    <v-card elevation="3">
      <v-table>
        <thead>
          <tr>
            <th class="text-left">Image</th>
            <th class="text-left">Item Name</th>
            <th class="text-left">Location</th>
            <th class="text-left">Status</th>
            <th class="text-left">Posted On</th>
            <th class="text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in recentLostItems" :key="i">
            <td>
              <v-avatar size="40">
                <v-img :src="item.image" />
              </v-avatar>
            </td>
            <td>{{ item.name }}</td>
            <td>{{ item.location }}</td>
            <td>
              <v-chip
                :color="item.status === 'Claimed' ? 'green' : 'orange'"
                size="small"
                text-color="white"
              >
                {{ item.status }}
              </v-chip>
            </td>
            <td>{{ item.postedOn }}</td>
            <td>
              <v-btn
                size="small"
                color="primary"
                variant="tonal"
                :to="`/admin/lostitems/${item.id}`"
              >
                View
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>

<script setup>
const stats = {
  totalLostItems: 120,
  claimedItems: 45,
  pendingItems: 75,
};

const recentLostItems = [
  {
    id: 1,
    name: "Black Wallet",
    location: "Central Park",
    status: "Pending",
    postedOn: "2025-08-15",
    image: "/images/wallet.jpg",
  },
  {
    id: 2,
    name: "Blue Backpack",
    location: "City Mall",
    status: "Claimed",
    postedOn: "2025-08-14",
    image: "/images/backpack.jpg",
  },
  {
    id: 3,
    name: "Smartphone",
    location: "Train Station",
    status: "Pending",
    postedOn: "2025-08-13",
    image: "/images/phone.jpg",
  },
];
</script>
