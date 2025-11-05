import { auth, db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

export interface DashboardStats {
  totalUsers: number;
  totalAlerts: number;
  aiDetections: number;
  totalLogs: number;
}

export interface RecentAccess {
  log_id: string;
  aluno_id: string;
  student_name: string;
  url: string;
  duration: number;
  category: string;
  timestamp: string;
}

export interface UserSummary {
  student_db_id: string;
  student_name: string;
  cpf: string;
  pc_id: string;
  aluno_id: string;
  total_duration: number;
  log_count: number;
  last_activity: string | null;
  has_red_alert: boolean;
  has_blue_alert: boolean;
}

export interface Log {
  id?: string;
  log_id?: string;
  aluno_id: string;
  student_name: string;
  url: string;
  duration: number;
  categoria: string;
  timestamp: string;
}

export interface Student {
  id?: string;
  full_name: string;
  cpf?: string | null;
  pc_id?: string | null;
}

export interface Class {
  id?: string;
  name: string;
  owner_id?: string;
  owner_name?: string;
  student_count?: number;
  professor_count?: number;
}

export interface Professor {
  id: string;
  full_name: string;
  username: string;
  email: string;
  isOwner?: boolean;
}

const getUid = () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Usuário não autenticado');
  return uid;
};

const asISO = (value: any): string => {
  // Firestore Timestamp has toDate(); strings are used as-is
  try {
    if (!value) return new Date().toISOString();
    if (typeof value === 'string') return value;
    if (value?.toDate) return value.toDate().toISOString();
    return new Date(value).toISOString();
  } catch {
    return new Date().toISOString();
  }
};

export const api = {
  // DASHBOARD
  async getLogs(filters?: { startDate?: string; endDate?: string; category?: string }): Promise<Log[]> {
    // Base query: logs ordered by timestamp desc
    const logsCol = collection(db, 'logs');
    
    // Firestore cannot orderBy on a field not included in where inequality unless indexed.
    // We use client-side filter for dates to avoid index requirements.
    const q = query(logsCol, orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);

    const items: Log[] = snap.docs.map((d) => {
      const data: any = d.data();
      return {
        id: d.id,
        log_id: data.log_id || d.id,
        aluno_id: data.aluno_id || data.student_id || '',
        student_name: data.student_name || data.aluno_nome || data.nome_aluno || '',
        url: data.url || '',
        duration: Number(data.duration || data.tempo || 0),
        categoria: data.categoria || data.category || 'Outros',
        timestamp: asISO(data.timestamp),
      };
    });

    const filtered = items.filter((it) => {
      const time = Date.parse(it.timestamp);
      const startOk = filters?.startDate ? time >= Date.parse(filters.startDate) : true;
      const endOk = filters?.endDate ? time <= Date.parse(filters.endDate) : true;
      const catOk = filters?.category ? it.categoria === filters.category : true;
      return startOk && endOk && catOk;
    });

    return filtered;
  },

  async getAlertLogs(alunoId: string, type: 'red' | 'blue'): Promise<Log[]> {
    const categories = type === 'red'
      ? ['Rede Social', 'Streaming & Jogos', 'Outros']
      : ['IA'];
    const all = await this.getLogs();
    return all.filter(l => l.aluno_id === alunoId && categories.includes(l.categoria));
  },

  async getDashboardData(): Promise<{ logs: Log[]; summary: UserSummary[] }> {
    const logs = await this.getLogs();
    const summaryMap = new Map<string, UserSummary>();

    logs.forEach((log) => {
      const key = log.aluno_id || 'desconhecido';
      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          student_db_id: key,
          student_name: log.student_name || 'Desconhecido',
          cpf: '',
          pc_id: '',
          aluno_id: key,
          total_duration: 0,
          log_count: 0,
          last_activity: null,
          has_red_alert: false,
          has_blue_alert: false,
        });
      }
      const s = summaryMap.get(key)!;
      s.total_duration += log.duration || 0;
      s.log_count += 1;
      if (!s.last_activity || log.timestamp > s.last_activity) s.last_activity = log.timestamp;
      if (['Rede Social', 'Streaming & Jogos', 'Outros'].includes(log.categoria)) s.has_red_alert = true;
      if (log.categoria === 'IA') s.has_blue_alert = true;
    });

    return { logs, summary: Array.from(summaryMap.values()) };
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const { logs } = await this.getDashboardData();
    const users = new Set(logs.map((l) => l.aluno_id)).size;
    const totalAlerts = logs.filter((l) => ['Rede Social', 'Streaming & Jogos', 'Outros'].includes(l.categoria)).length;
    const aiDetections = logs.filter((l) => l.categoria === 'IA').length;
    return {
      totalUsers: users,
      totalAlerts,
      aiDetections,
      totalLogs: logs.length,
    };
  },

  async getRecentAccess(limitNum = 10): Promise<RecentAccess[]> {
    const logsCol = collection(db, 'logs');
    const q = query(logsCol, orderBy('timestamp', 'desc'), fsLimit(limitNum));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data: any = d.data();
      return {
        log_id: data.log_id || d.id,
        aluno_id: data.aluno_id || data.student_id || '',
        student_name: data.student_name || '',
        url: data.url || '',
        duration: Number(data.duration || 0),
        category: data.categoria || data.category || 'Outros',
        timestamp: asISO(data.timestamp),
      };
    });
  },

  async getCategoryBreakdown() {
    const logs = await this.getLogs();
    const counts: Record<string, number> = {};
    logs.forEach((l) => {
      counts[l.categoria] = (counts[l.categoria] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  },

  async getActivityByHour() {
    const logs = await this.getLogs();
    const hours = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, count: 0 }));
    logs.forEach((l) => {
      const d = new Date(l.timestamp);
      const h = d.getHours();
      hours[h].count += 1;
    });
    return hours;
  },

  async getActivityByWeekday() {
    const logs = await this.getLogs();
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const agg = days.map((d) => ({ day: d, count: 0 }));
    logs.forEach((l) => {
      const d = new Date(l.timestamp);
      agg[d.getDay()].count += 1;
    });
    return agg;
  },

  async getTopSites(limitNum = 10) {
    const logs = await this.getLogs();
    const counts: Record<string, number> = {};
    logs.forEach((l) => {
      try {
        const url = l.url.startsWith('http') ? l.url : `https://${l.url}`;
        const host = new URL(url).hostname.replace('www.', '');
        counts[host] = (counts[host] || 0) + 1;
      } catch {}
    });
    return Object.entries(counts)
      .map(([site, count]) => ({ site, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limitNum);
  },

  // STUDENTS (coleção: members)
  async getAllStudents(): Promise<Student[]> {
    const snap = await getDocs(collection(db, 'members'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  },

  async getStudent(id: string): Promise<Student> {
    const ref = doc(db, 'members', id);
    const s = await getDoc(ref);
    if (!s.exists()) throw new Error('Aluno não encontrado');
    return { id: s.id, ...(s.data() as any) };
  },

  async createStudent(data: { fullName: string; cpf?: string; pc_id?: string }): Promise<{ success: boolean; student: Student }> {
    const ref = await addDoc(collection(db, 'members'), {
      full_name: data.fullName,
      cpf: data.cpf || null,
      pc_id: data.pc_id || null,
      createdAt: serverTimestamp(),
    });
    const student = await this.getStudent(ref.id);
    return { success: true, student };
  },

  async updateStudent(id: string, data: { fullName: string; cpf?: string; pc_id?: string }): Promise<void> {
    await updateDoc(doc(db, 'members', id), {
      full_name: data.fullName,
      cpf: data.cpf || null,
      pc_id: data.pc_id || null,
    });
  },

  async deleteStudent(id: string): Promise<void> {
    await deleteDoc(doc(db, 'members', id));
  },

  // CLASSES/TEAMS (coleções: teams, team_members, team_leaders, leaders)
async getClasses(): Promise<Class[]> {
    const uid = getUid();
    // Usar um Map para guardar as equipas por ID e evitar duplicados
    const teamMap = new Map<string, Class>();

    // 1. Buscar Turmas que sou owner
    const ownedQ = query(collection(db, 'teams'), where('owner_id', '==', uid));
    const ownedSnap = await getDocs(ownedQ);
    // Adicionar equipas que possuo ao Map
    ownedSnap.docs.forEach((d) => {
        const teamData = { id: d.id, ...(d.data() as any) } as Class;
        if (!teamMap.has(d.id)) {
            teamMap.set(d.id, teamData);
        }
    });

    // 2. Buscar Turmas que partilham comigo
    const shareQ = query(collection(db, 'team_leaders'), where('leaderId', '==', uid));
    const shareSnap = await getDocs(shareQ);
    const sharedTeamIds = shareSnap.docs
        .map((d) => (d.data() as any).teamId)
        .filter(Boolean); // Obter IDs das equipas onde sou líder

    // Buscar os detalhes das equipas partilhadas, *apenas se ainda não estiverem no Map*
    for (const teamId of sharedTeamIds) {
        if (!teamMap.has(teamId)) { // <-- Chave da deduplicação
            const t = await getDoc(doc(db, 'teams', teamId));
            if (t.exists()) {
                 const teamData = { id: t.id, ...(t.data() as any) } as Class;
                 // Adicionar ao Map apenas se realmente existir e não for uma que já possuo (segurança extra)
                 if (teamData.owner_id !== uid) {
                     teamMap.set(t.id, teamData);
                 }
            }
        }
    }

    // 3. Enriquecer com contagens básicas (agora iterando sobre os valores únicos do Map)
    const results: Class[] = [];
    // Usar Promise.all para buscar contagens em paralelo
    await Promise.all(Array.from(teamMap.values()).map(async (t) => {
        const studentsQuery = query(collection(db, 'team_members'), where('teamId', '==', t.id));
        const profsQuery = query(collection(db, 'team_leaders'), where('teamId', '==', t.id));

        const [studentsSnap, profsSnap] = await Promise.all([
            getDocs(studentsQuery),
            getDocs(profsQuery)
        ]);

        // Contagem correta de professores: número de entradas distintas em team_leaders
        // (Já que createClass adiciona o owner, esta contagem inclui o owner)
        const uniqueLeaderIds = new Set(profsSnap.docs.map(d => d.data().leaderId));
        const profsCount = uniqueLeaderIds.size;

        // Tenta obter o nome do owner (pode falhar se o owner não tiver perfil em 'leaders')
        let ownerName = '-'; // Default
        if (t.owner_id) {
           try {
             const ownerDoc = await getDoc(doc(db, 'leaders', t.owner_id));
             if (ownerDoc.exists()) {
                ownerName = ownerDoc.data()?.full_name || ownerName;
             }
           } catch (err) { console.error("Erro ao buscar nome do owner:", err); }
        }


        results.push({
            id: t.id,
            name: t.name,
            owner_id: t.owner_id,
            owner_name: ownerName, // Incluir nome do owner
            student_count: studentsSnap.size,
            professor_count: profsCount, // Usar a contagem correta
        });
    }));

     // Ordenar resultados pelo nome da equipa
     results.sort((a, b) => a.name.localeCompare(b.name));

    // console.log('API getClasses returning:', results); // Descomentar se precisar de depurar
    return results;
},
  async getClass(id: string): Promise<Class> {
    const s = await getDoc(doc(db, 'teams', id));
    if (!s.exists()) throw new Error('Turma não encontrada');
    const data: any = s.data();
    return { id: s.id, name: data.name, owner_id: data.owner_id };
  },

  async createClass(name: string): Promise<{ success: boolean; classId: string; message: string }> {
    const uid = getUid();
    const ref = await addDoc(collection(db, 'teams'), {
      name,
      owner_id: uid,
      createdAt: serverTimestamp(),
    });

    // Garantir que o owner também conste como leader
    await addDoc(collection(db, 'team_leaders'), {
      teamId: ref.id,
      leaderId: uid,
      createdAt: serverTimestamp(),
    });

    return { success: true, classId: ref.id, message: 'Turma criada com sucesso' };
  },

  async updateClass(id: string, name: string): Promise<void> {
    await updateDoc(doc(db, 'teams', id), { name });
  },

  async deleteClass(classId: string): Promise<{ success: boolean; message: string }> {
    await deleteDoc(doc(db, 'teams', classId));
    return { success: true, message: 'Turma deletada com sucesso' };
  },

  async getClassMembers(classId: string): Promise<{ members: Professor[]; isCurrentUserOwner: boolean }> {
    const team = await this.getClass(classId);
    const uid = getUid();
    const isOwner = team.owner_id === uid;

    const members: Professor[] = [];

    // Adiciona owner
    if (team.owner_id) {
      const ownerDoc = await getDoc(doc(db, 'leaders', team.owner_id));
      if (ownerDoc.exists()) {
        const o: any = ownerDoc.data();
        members.push({ id: ownerDoc.id, full_name: o.full_name || '', username: o.username || '', email: o.email || '', isOwner: true });
      }
    }

    // Adiciona leaders compartilhados
    const leadersSnap = await getDocs(query(collection(db, 'team_leaders'), where('teamId', '==', classId)));
    for (const l of leadersSnap.docs) {
      const leaderId = (l.data() as any).leaderId;
      if (!leaderId || leaderId === team.owner_id) continue;
      const uDoc = await getDoc(doc(db, 'leaders', leaderId));
      if (uDoc.exists()) {
        const u: any = uDoc.data();
        members.push({ id: uDoc.id, full_name: u.full_name || '', username: u.username || '', email: u.email || '' });
      }
    }

    return { members, isCurrentUserOwner: isOwner };
  },

  async shareClass(classId: string, professorId: string): Promise<{ success: boolean; message: string }> {
    await addDoc(collection(db, 'team_leaders'), { teamId: classId, leaderId: professorId, createdAt: serverTimestamp() });
    return { success: true, message: 'Professor adicionado à turma' };
  },

  async removeClassMember(classId: string, professorId: string): Promise<{ success: boolean; message: string }> {
    const q = query(collection(db, 'team_leaders'), where('teamId', '==', classId), where('leaderId', '==', professorId));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    return { success: true, message: 'Professor removido da turma' };
  },

  async getClassStudents(classId: string): Promise<Student[]> {
    const q = query(collection(db, 'team_members'), where('teamId', '==', classId));
    const snap = await getDocs(q);
    const students: Student[] = [];
    for (const d of snap.docs) {
      const studentId = (d.data() as any).studentId;
      if (!studentId) continue;
      const sDoc = await getDoc(doc(db, 'members', studentId));
      if (sDoc.exists()) {
        const s: any = sDoc.data();
        students.push({ id: sDoc.id, full_name: s.full_name || '', cpf: s.cpf || null, pc_id: s.pc_id || null });
      }
    }
    return students;
  },

  async addStudentToClass(classId: string, studentId: string): Promise<{ success: boolean; message: string }> {
    await addDoc(collection(db, 'team_members'), { teamId: classId, studentId, createdAt: serverTimestamp() });
    return { success: true, message: 'Estudante adicionado à turma' };
  },

  async removeStudentFromClass(classId: string, studentId: string): Promise<{ success: boolean; message: string }> {
    const q = query(collection(db, 'team_members'), where('teamId', '==', classId), where('studentId', '==', studentId));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    return { success: true, message: 'Estudante removido da turma' };
  },

  // Professores = documentos em "leaders"
  async getProfessors(): Promise<Professor[]> {
    const uid = getUid();
    const snap = await getDocs(collection(db, 'leaders'));
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as any) }))
      .filter((p: any) => p.id !== uid)
      .map((p: any) => ({ id: p.id, full_name: p.full_name || '', username: p.username || '', email: p.email || '' }));
  },

  // Outros (placeholders mantidos por compatibilidade)
  async overrideCategory(_url: string, _newCategory: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: 'Funcionalidade em desenvolvimento' };
  },

  downloadReport(_date: string) {
    console.log('Download report - não implementado no Firebase');
  },
};
