import { 
  collection, 
  doc,
  query, 
  where, 
  getDocs,
  getDoc,
  addDoc,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Leader } from "@/types/leaders";

export const teamLeadersService = {
  async getLeaders(teamId: string) {
    try {
      const q = query(
        collection(db, "team_leaders"),
        where("team_id", "==", teamId)
      );
      
      const snapshot = await getDocs(q);
      const leaderIds = snapshot.docs.map(doc => doc.data().leader_id);
      
      const leaders = [];
      for (const leaderId of leaderIds) {
        const docRef = doc(db, "leaders", leaderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          leaders.push({ id: docSnap.id, ...docSnap.data() });
        }
      }
      
      return leaders as Leader[];
    } catch (error) {
      console.error('Erro ao buscar líderes da equipe:', error);
      throw error;
    }
  },

  async addLeader(teamId: string, leaderId: string) {
    try {
      await addDoc(collection(db, "team_leaders"), {
        team_id: teamId,
        leader_id: leaderId,
        added_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao adicionar líder à equipe:', error);
      throw error;
    }
  },

  async removeLeader(teamId: string, leaderId: string) {
    try {
      const q = query(
        collection(db, "team_leaders"),
        where("team_id", "==", teamId),
        where("leader_id", "==", leaderId)
      );
      
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    } catch (error) {
      console.error('Erro ao remover líder da equipe:', error);
      throw error;
    }
  }
};
