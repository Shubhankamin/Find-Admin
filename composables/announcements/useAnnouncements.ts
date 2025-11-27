import { ref } from "vue";
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { useNuxtApp } from "#app";

export function useAddAnnouncement() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const { $db } = useNuxtApp();

  const addAnnouncement = async (data: {
    message: string;
    endDate?: string; // yyyy-mm-dd string from date input
  }) => {
    loading.value = true;
    error.value = null;

    try {
      if (!data.message || data.message.trim() === "") {
        throw new Error("Announcement message is required");
      }

      const endTimestamp = data.endDate
        ? Timestamp.fromDate(new Date(data.endDate))
        : null;

      const docRef = await addDoc(collection($db, "announcements"), {
        message: data.message.trim(),
        createdAt: serverTimestamp(),
        endDate: endTimestamp,
        isActive: true,
      });

      return docRef.id;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { addAnnouncement, loading, error };
}
