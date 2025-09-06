import { ref } from "vue";
import { addDoc, collection, Timestamp } from "firebase/firestore";
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
   images: string[]; // ✅ Base64 strings only
   category: string;
   status?: string;
   threshold?: number | null;
 }) => {
   loading.value = true;
   error.value = null;

   try {
     const docRef = await addDoc(collection($db, "lost_item"), {
       ...itemData,
       status: itemData.status || "pending",
       createdAt: new Date(),
       expiryDate: itemData.threshold
         ? new Date(Date.now() + itemData.threshold * 24 * 60 * 60 * 1000)
         : null, // optional
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
