<template>
  <v-container>
    <v-row class="mb-4 align-center justify-space-between">
      <h1>Lost Items</h1>
      <v-btn color="primary" @click="goToAddItem"> + Add New Item </v-btn>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          placeholder="Search items..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          :disabled="loading"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          placeholder="Filter by Status"
          variant="outlined"
          density="compact"
          clearable
          :disabled="loading"
        />
      </v-col>
    </v-row>

    <!-- Table Skeleton Loader -->
    <template v-if="loading">
      <v-skeleton-loader type="table" class="mt-4" />
    </template>

    <!-- Data Table -->
    <template v-else>
      <DataTable
        :headers="headers"
        :items="filteredItems"
        @delete="handleDelete"
        @toggle="handleToggle"
        @click:item="handleItemClick"
      />
    </template>

    <!-- Delete Confirmation -->
    <DeleteDialog
      v-model="dialog"
      title="Delete Item"
      message="Are you sure you want to delete this item?"
      :itemName="selectedItem?.name"
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="confirmDelete"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useGetLostItems } from "~/composables/items/getLostItems";
import { useDeleteLostItem } from "~/composables/items/deleteItem";
import { useUpdateLostItem } from "~/composables/items/updateItems";

const router = useRouter();
const { getLostItems } = useGetLostItems();
const { deleteLostItem } = useDeleteLostItem();
const { updateLostItem } = useUpdateLostItem();

const search = ref("");
const statusFilter = ref("");
const dialog = ref(false);
const selectedItem = ref<any>(null);
const statusOptions = ["claimed", "pending"];
const loading = ref(true);

const headers = [
  { title: "Item Name", key: "name" },
  { title: "Posted On", key: "createdOn" },
  { title: "Posted By", key: "email" },
  { title: "Status", key: "status" },
  { title: "Threshold", key: "threshold" },
  { title: "Actions", key: "actions", sortable: false },
];

const items = ref<any[]>([]);

const fetchItems = async () => {
  try {
    loading.value = true;
    const data = await getLostItems();

    items.value = data.map((doc: any) => ({
      id: doc.id,
      name: doc.itemName,
      email: doc.contactEmail,
      createdOn: doc.createdAt?.toDate?.()?.toLocaleDateString() ?? "",
      status: doc.status,
      threshold: doc.threshold || "—",
      isEnabled: doc.isEnabled ?? false,
    }));

    console.log("Items:", items.value);
  } catch (err) {
    console.error("Error fetching items:", err);
  } finally {
    loading.value = false;
  }
};

const filteredItems = computed(() => {
  return items.value.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search?.value?.toLowerCase());
    const matchesStatus = statusFilter.value
      ? item.status === statusFilter.value
      : true;
    return matchesSearch && matchesStatus;
  });
});

onMounted(() => {
  fetchItems();
});

const handleDelete = (item: any) => {
  console.log("Delete clicked for:", item);
  selectedItem.value = item;
  dialog.value = true; // open dialog
};

const confirmDelete = async () => {
  if (!selectedItem.value) return;
  try {
    await deleteLostItem(selectedItem.value.id); // ✅ API call
    items.value = items.value.filter((i) => i.id !== selectedItem.value.id);
    console.log("Deleted:", selectedItem.value);
  } catch (err) {
    console.error("❌ Error deleting item:", err);
  } finally {
    dialog.value = false;
    selectedItem.value = null;
  }
};

const handleToggle = async (item: any) => {
  try {
    await updateLostItem(item.id, { isEnabled: item.isEnabled });
    console.log("✅ isEnabled updated:", item);
  } catch (err) {
    console.error("Failed to update isEnabled:", err);
    item.isEnabled = !item.isEnabled;
  }
};

const goToAddItem = () => {
  router.push({ path: "/items/new", query: { mode: "add" } });
};

const handleItemClick = (item: any) => {
  router.push({ path: `/items/${item.id}`, query: { mode: "edit" } });
};
</script>
