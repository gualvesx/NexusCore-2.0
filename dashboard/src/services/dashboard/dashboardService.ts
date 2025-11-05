import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { logsService } from "../firebaseService";
import { membersService } from "../members/membersService";

export const dashboardService = {
  async getStats() {
    try {
      const [membersSnap, logsSnap] = await Promise.all([
        getDocs(collection(db, "members")),
        getDocs(collection(db, "logs"))
      ]);

      const logs = logsSnap.docs.map(doc => doc.data());
      
      const totalAlerts = logs.filter(log => 
        ['Rede Social', 'Streaming & Jogos', 'Outros'].includes(log.categoria)
      ).length;
      
      const aiDetections = logs.filter(log => log.categoria === 'IA').length;

      return {
        totalUsers: membersSnap.size,
        totalAlerts,
        aiDetections,
        totalLogs: logsSnap.size
      };
    } catch (error) {
      console.error('Erro ao buscar stats:', error);
      throw error;
    }
  },

  async getData() {
    try {
      const [logsData, membersData] = await Promise.all([
        logsService.getRecent(100),
        membersService.getAll()
      ]);

      // Create summary from logs
      const summary = membersData.map(member => {
        const memberLogs = logsData.filter(
          log => log.aluno_id === member.cpf || log.aluno_id === member.pc_id
        );

        const totalDuration = memberLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
        const lastActivity = memberLogs.length > 0 
          ? memberLogs[0].timestamp 
          : null;

        const hasRedAlert = memberLogs.some(log => 
          ['Rede Social', 'Streaming & Jogos'].includes(log.categoria)
        );
        const hasBlueAlert = memberLogs.some(log => log.categoria === 'IA');

        return {
          student_db_id: member.id,
          member_db_id: member.id,
          student_name: member.full_name,
          member_name: member.full_name,
          cpf: member.cpf || '',
          pc_id: member.pc_id || '',
          aluno_id: member.cpf || member.pc_id || '',
          total_duration: totalDuration,
          log_count: memberLogs.length,
          last_activity: lastActivity,
          has_red_alert: hasRedAlert,
          has_blue_alert: hasBlueAlert
        };
      });

      return {
        logs: logsData,
        summary
      };
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw error;
    }
  }
};
