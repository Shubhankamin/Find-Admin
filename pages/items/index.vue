<template>
  <v-container>
    <v-row class="mb-4 align-center justify-space-between">
      <h1>Lost Items</h1>
      <v-btn color="primary" @click="goToAddItem"> + Add New Item </v-btn>
    </v-row>

    <!-- <VueDatePicker v-model="date" /> -->

    <!-- 🔍 Search & Filter Row -->
    <v-row class="mb-4">
      <!-- Search Box -->
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          placeholder="Search items..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
        />
      </v-col>

      <!-- Status Filter -->
      <v-col cols="12" md="4">
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          placeholder="Filter by Status"
          variant="outlined"
          density="compact"
          clearable
        />
      </v-col>
    </v-row>

    <!-- ✅ DataTable Component -->
    <DataTable
      :headers="headers"
      :items="filteredItems"
      @delete="handleDelete"
      @toggle="handleToggle"
      @click:item="handleItemClick"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
const date = ref();

const router = useRouter();

const search = ref("");
const statusFilter = ref("");

const statusOptions = ["claimed", "pending"];

const headers = [
  { title: "Item Name", key: "name" },
  { title: "Posted On", key: "createdOn" },
  { title: "Posted By", key: "email" },
  { title: "Status", key: "status" },
  { title: "Threshold", key: "threshold" },

  { title: "Actions", key: "actions", sortable: false },
];

const items = ref([
  {
    id: 1,
    name: "Laptop",
    createdOn: "2025-08-20",
    email: "user1@example.com",
    status: "claimed",
    threshold: "2 Weeks",
    enabled: false,
  },
  {
    id: 2,
    name: "Bag",
    createdOn: "2025-08-18",
    email: "user2@example.com",
    status: "pending",
    threshold: "1 Month",
    enabled: false,
  },
  {
    id: 3,
    name: "Watch",
    createdOn: "2025-08-15",
    email: "user3@example.com",
    threshold: "3 Weeks",
    status: "pending",
    enabled: true,
  },
]);

const filteredItems = computed(() => {
  return items.value.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.value.toLowerCase());
    const matchesStatus = statusFilter.value
      ? item.status === statusFilter.value
      : true;
    return matchesSearch && matchesStatus;
  });
});

const handleDelete = (item: any) => {
  items.value = items.value.filter((i) => i.id !== item.id);
  console.log("Deleted:", item);
};

const handleToggle = (item: any) => {
  item.enabled = !item.enabled;
  console.log("Toggled:", item);
};

const goToAddItem = () => {
  router.push({
    path: "/items/new",
    query: { mode: "add" },
  });
};

const handleItemClick = (item: any) => {
  router.push({
    path: `/items/${item.id}`,
    query: { mode: "edit" },
  });
};
</script>
