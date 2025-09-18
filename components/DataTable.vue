<template>
  <v-card class="overflow-x-auto">
    <div style="overflow-x: auto; max-width: 100%">
      <v-data-table
        :headers="headers"
        :items="items"
        :items-per-page="itemsPerPage"
        class="elevation-1"
        style="min-width: 800px"
      >
        <!-- ✅ Clickable Item Name -->
        <template #item.name="{ item }">
          <span
            class="text-primary font-weight-medium cursor-pointer"
            @click="goToEdit(item)"
          >
            {{ item.name }}
          </span>
        </template>

        <!-- ✅ Status Chip -->
        <template #item.status="{ item }">
          <v-chip :color="item.status === 'claimed' ? 'green' : 'orange'" dark>
            {{ item.status === "claimed" ? "Claimed" : "Pending" }}
          </v-chip>
        </template>

        <!-- ✅ Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex align-center">
            <v-btn icon color="red" variant="text" @click="emitDelete(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>

            <v-switch
              v-model="item.isEnabled"
              color="primary"
              @change="$emit('toggle', item)"
            />
          </div>
        </template>
      </v-data-table>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
  headers: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
});

const emit = defineEmits(["delete", "toggle"]);

const emitDelete = (item: any) => {
  emit("delete", item);
};

const emitToggle = (item: any) => {
  emit("toggle", item);
};

// ✅ Navigate to edit page
const goToEdit = (item: any) => {
  router.push({
    path: `/items/${item.id}`,
    query: { mode: "edit" },
  });
};
</script>
<style scoped>
:deep(.v-data-table thead th) {
  font-weight: bold !important;
}
th {
  font-weight: bold !important;
}
</style>
