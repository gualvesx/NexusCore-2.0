import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Member } from "@/types/members";

export const membersService = {
  async getAll() {
    try {
      const q = query(collection(db, "members"), orderBy("full_name"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Member[];
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
      throw error;
    }
  },

  async getById(id: string) {
    try {
      const docRef = doc(db, "members", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Member;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar membro:', error);
      throw error;
    }
  },

  async create(member: Omit<Member, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, "members"), {
        ...member,
        created_at: serverTimestamp()
      });
      return { id: docRef.id, ...member };
    } catch (error) {
      console.error('Erro ao criar membro:', error);
      throw error;
    }
  },

  async update(id: string, member: Partial<Member>) {
    try {
      const docRef = doc(db, "members", id);
      await updateDoc(docRef, member);
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      await deleteDoc(doc(db, "members", id));
    } catch (error) {
      console.error('Erro ao deletar membro:', error);
      throw error;
    }
  }
};
