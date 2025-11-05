import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Team } from "@/types/teams";

export const teamsService = {
  async getAll() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Usuário não autenticado');

      const q = query(
        collection(db, "teams"),
        where("owner_id", "==", currentUser.uid),
        orderBy("name")
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Team[];
    } catch (error) {
      console.error('Erro ao buscar equipes:', error);
      throw error;
    }
  },

  async getById(id: string) {
    try {
      const docRef = doc(db, "teams", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Team;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar equipe:', error);
      throw error;
    }
  },

  async create(teamName: string) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Usuário não autenticado');

      const docRef = await addDoc(collection(db, "teams"), {
        name: teamName,
        owner_id: currentUser.uid,
        created_at: serverTimestamp()
      });
      
      return { 
        id: docRef.id, 
        name: teamName, 
        owner_id: currentUser.uid 
      };
    } catch (error) {
      console.error('Erro ao criar equipe:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<Team>) {
    try {
      const docRef = doc(db, "teams", id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Erro ao atualizar equipe:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const batch = writeBatch(db);
      
      // Delete team
      batch.delete(doc(db, "teams", id));
      
      // Delete team_members relationships
      const membersQuery = query(
        collection(db, "team_members"),
        where("team_id", "==", id)
      );
      const membersSnapshot = await getDocs(membersQuery);
      membersSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Delete team_leaders relationships
      const leadersQuery = query(
        collection(db, "team_leaders"),
        where("team_id", "==", id)
      );
      const leadersSnapshot = await getDocs(leadersQuery);
      leadersSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      await batch.commit();
    } catch (error) {
      console.error('Erro ao deletar equipe:', error);
      throw error;
    }
  }
};
