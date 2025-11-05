import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Member } from "@/types/members";
import { membersService } from "../members/membersService";

export const teamMembersService = {
  async getMembers(teamId: string): Promise<Member[]> {
    try {
      const q = query(
        collection(db, "team_members"),
        where("team_id", "==", teamId)
      );
      
      const snapshot = await getDocs(q);
      const memberIds = snapshot.docs.map(doc => doc.data().member_id);
      
      if (memberIds.length === 0) return [];
      
      const members: Member[] = [];
      for (const memberId of memberIds) {
        const member = await membersService.getById(memberId);
        if (member) members.push(member);
      }
      
      return members;
    } catch (error) {
      console.error('Erro ao buscar membros da equipe:', error);
      throw error;
    }
  },

  async addMember(teamId: string, memberId: string) {
    try {
      await addDoc(collection(db, "team_members"), {
        team_id: teamId,
        member_id: memberId,
        added_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao adicionar membro à equipe:', error);
      throw error;
    }
  },

  async removeMember(teamId: string, memberId: string) {
    try {
      const q = query(
        collection(db, "team_members"),
        where("team_id", "==", teamId),
        where("member_id", "==", memberId)
      );
      
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    } catch (error) {
      console.error('Erro ao remover membro da equipe:', error);
      throw error;
    }
  }
};
