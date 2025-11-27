import { ref } from "vue";
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { useNuxtApp } from "#app";

export function useAddLostItem() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const { $db } = useNuxtApp();

  const addLostItem = async (itemData: {
    itemName: string;
    description: string;
    location: string;
    contactEmail: string;
    images: string[]; // Base64 only
    category: string;
    status?: string;
    threshold?: number | null;
  }) => {
    loading.value = true;
    error.value = null;

    try {
      const now = new Date();
      const expiryTimestamp = itemData.threshold
        ? Timestamp.fromDate(
            new Date(now.getTime() + itemData.threshold * 24 * 60 * 60 * 1000)
          )
        : null;

      const docRef = await addDoc(collection($db, "lost_item"), {
        ...itemData,
        status: itemData.status || "pending",
        createdAt: serverTimestamp(), // trusted Firestore time
        expiryDate: expiryTimestamp, // Timestamp for accurate querying
      });

      return docRef.id;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { addLostItem, loading, error };
}
