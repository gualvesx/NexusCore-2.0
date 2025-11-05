import { 
  collection, 
  getDocs
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Leader } from "@/types/leaders";

export const leadersService = {
  async getAll() {
    try {
      const snapshot = await getDocs(collection(db, "leaders"));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Leader[];
    } catch (error) {
      console.error('Erro ao buscar líderes:', error);
      throw error;
    }
  }
};
