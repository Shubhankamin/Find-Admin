import { ref } from "vue";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { useNuxtApp } from "#app";

export function useGetAnnouncements() {
  const announcements = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const { $db } = useNuxtApp();

  const getAnnouncements = async () => {
    loading.value = true;
    error.value = null;

    try {
      const now = new Date();
      const q = query(
        collection($db, "announcements"),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);

      announcements.value = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return announcements.value;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { announcements, getAnnouncements, loading, error };
}
