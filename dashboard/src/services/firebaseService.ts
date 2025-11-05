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
  limit,
  Timestamp,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

// ============= LOGS =============

export interface Log {
  id?: string;
  aluno_id: string;
  student_name: string;
  url: string;
  duration: number;
  categoria: string;
  timestamp: string;
}

export const logsService = {
  async getAll(filters?: { startDate?: string; endDate?: string; category?: string }) {
    try {
      let q = query(collection(db, "logs"), orderBy("timestamp", "desc"));
      
      const snapshot = await getDocs(q);
      let logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          log_id: doc.id,
          aluno_id: data.aluno_id || '',
          student_name: data.student_name || '',
          url: data.url || '',
          duration: data.duration || 0,
          categoria: data.categoria || '',
          timestamp: data.timestamp instanceof Date ? data.timestamp.toISOString() : (data.timestamp || '')
        } as Log;
      });

      // Filter client-side for now (could be optimized with composite indexes)
      if (filters?.startDate) {
        logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate!));
      }
      if (filters?.endDate) {
        logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate!));
      }
      if (filters?.category) {
        logs = logs.filter(log => log.categoria === filters.category);
      }

      return logs;
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      throw error;
    }
  },

  async getRecent(limitCount: number = 10) {
    try {
      const q = query(
        collection(db, "logs"), 
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          log_id: doc.id,
          aluno_id: data.aluno_id || '',
          student_name: data.student_name || '',
          url: data.url || '',
          duration: data.duration || 0,
          categoria: data.categoria || '',
          timestamp: data.timestamp instanceof Date ? data.timestamp.toISOString() : (data.timestamp || '')
        } as Log;
      });
    } catch (error) {
      console.error('Erro ao buscar logs recentes:', error);
      throw error;
    }
  },

  async getByStudentAndCategory(alunoId: string, categories: string[]) {
    try {
      const q = query(
        collection(db, "logs"),
        where("aluno_id", "==", alunoId),
        where("categoria", "in", categories),
        orderBy("timestamp", "desc")
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          log_id: doc.id,
          aluno_id: data.aluno_id || '',
          student_name: data.student_name || '',
          url: data.url || '',
          duration: data.duration || 0,
          categoria: data.categoria || '',
          timestamp: data.timestamp instanceof Date ? data.timestamp.toISOString() : (data.timestamp || '')
        } as Log;
      });
    } catch (error) {
      console.error('Erro ao buscar logs por aluno:', error);
      throw error;
    }
  },

  async getCategoryStats() {
    try {
      const snapshot = await getDocs(collection(db, "logs"));
      const logs = snapshot.docs.map(doc => doc.data());
      
      const categoryCount: { [key: string]: number } = {};
      logs.forEach(log => {
        if (log.categoria) {
          categoryCount[log.categoria] = (categoryCount[log.categoria] || 0) + 1;
        }
      });

      const total = logs.length;
      return Object.entries(categoryCount).map(([category, count]) => ({
        category,
        count,
        percentage: ((count / total) * 100).toFixed(2)
      }));
    } catch (error) {
      console.error('Erro ao buscar stats de categorias:', error);
      throw error;
    }
  }
};

// ============= STUDENTS =============

export interface Student {
  id?: string;
  full_name: string;
  cpf?: string;
  pc_id?: string;
  created_at?: Date;
}

export const studentsService = {
  async getAll() {
    try {
      const q = query(collection(db, "students"), orderBy("full_name"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
    } catch (error) {
      console.error('Erro ao buscar estudantes:', error);
      throw error;
    }
  },

  async getById(id: string) {
    try {
      const docRef = doc(db, "students", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Student;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar estudante:', error);
      throw error;
    }
  },

  async create(student: Omit<Student, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, "students"), {
        ...student,
        created_at: serverTimestamp()
      });
      return { id: docRef.id, ...student };
    } catch (error) {
      console.error('Erro ao criar estudante:', error);
      throw error;
    }
  },

  async update(id: string, student: Partial<Student>) {
    try {
      const docRef = doc(db, "students", id);
      await updateDoc(docRef, student);
    } catch (error) {
      console.error('Erro ao atualizar estudante:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      await deleteDoc(doc(db, "students", id));
    } catch (error) {
      console.error('Erro ao deletar estudante:', error);
      throw error;
    }
  }
};

// ============= CLASSES =============

export interface Class {
  id?: string;
  name: string;
  owner_id: string;
  created_at?: Date;
}

export const classesService = {
  async getAll() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Usuário não autenticado');

      const q = query(
        collection(db, "classes"),
        where("owner_id", "==", currentUser.uid),
        orderBy("name")
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Class[];
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      throw error;
    }
  },

  async getById(id: string) {
    try {
      const docRef = doc(db, "classes", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Class;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar turma:', error);
      throw error;
    }
  },

  async create(className: string) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Usuário não autenticado');

      const docRef = await addDoc(collection(db, "classes"), {
        name: className,
        owner_id: currentUser.uid,
        created_at: serverTimestamp()
      });
      
      return { 
        id: docRef.id, 
        name: className, 
        owner_id: currentUser.uid 
      };
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<Class>) {
    try {
      const docRef = doc(db, "classes", id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Erro ao atualizar turma:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const batch = writeBatch(db);
      
      // Delete class
      batch.delete(doc(db, "classes", id));
      
      // Delete class_students relationships
      const studentsQuery = query(
        collection(db, "class_students"),
        where("class_id", "==", id)
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      studentsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Delete class_members relationships
      const membersQuery = query(
        collection(db, "class_members"),
        where("class_id", "==", id)
      );
      const membersSnapshot = await getDocs(membersQuery);
      membersSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      await batch.commit();
    } catch (error) {
      console.error('Erro ao deletar turma:', error);
      throw error;
    }
  },

  async getStudents(classId: string) {
    try {
      const q = query(
        collection(db, "class_students"),
        where("class_id", "==", classId)
      );
      
      const snapshot = await getDocs(q);
      const studentIds = snapshot.docs.map(doc => doc.data().student_id);
      
      if (studentIds.length === 0) return [];
      
      const students: Student[] = [];
      for (const studentId of studentIds) {
        const student = await studentsService.getById(studentId);
        if (student) students.push(student);
      }
      
      return students;
    } catch (error) {
      console.error('Erro ao buscar estudantes da turma:', error);
      throw error;
    }
  },

  async addStudent(classId: string, studentId: string) {
    try {
      await addDoc(collection(db, "class_students"), {
        class_id: classId,
        student_id: studentId,
        added_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao adicionar estudante à turma:', error);
      throw error;
    }
  },

  async removeStudent(classId: string, studentId: string) {
    try {
      const q = query(
        collection(db, "class_students"),
        where("class_id", "==", classId),
        where("student_id", "==", studentId)
      );
      
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    } catch (error) {
      console.error('Erro ao remover estudante da turma:', error);
      throw error;
    }
  },

  async getMembers(classId: string) {
    try {
      const q = query(
        collection(db, "class_members"),
        where("class_id", "==", classId)
      );
      
      const snapshot = await getDocs(q);
      const memberIds = snapshot.docs.map(doc => doc.data().professor_id);
      
      const members = [];
      for (const memberId of memberIds) {
        const docRef = doc(db, "leaders", memberId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          members.push({ id: docSnap.id, ...docSnap.data() });
        }
      }
      
      return members;
    } catch (error) {
      console.error('Erro ao buscar membros da turma:', error);
      throw error;
    }
  },

  async addMember(classId: string, professorId: string) {
    try {
      await addDoc(collection(db, "class_members"), {
        class_id: classId,
        professor_id: professorId,
        added_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao adicionar membro à turma:', error);
      throw error;
    }
  },

  async removeMember(classId: string, professorId: string) {
    try {
      const q = query(
        collection(db, "class_members"),
        where("class_id", "==", classId),
        where("professor_id", "==", professorId)
      );
      
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    } catch (error) {
      console.error('Erro ao remover membro da turma:', error);
      throw error;
    }
  }
};

// ============= PROFESSORS =============

export const professorsService = {
  async getAll() {
    try {
      const snapshot = await getDocs(collection(db, "leaders"));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar professores:', error);
      throw error;
    }
  }
};

// ============= DASHBOARD =============

export const dashboardService = {
  async getStats() {
    try {
      const [studentsSnap, logsSnap] = await Promise.all([
        getDocs(collection(db, "students")),
        getDocs(collection(db, "logs"))
      ]);

      const logs = logsSnap.docs.map(doc => doc.data());
      
      const totalAlerts = logs.filter(log => 
        ['Rede Social', 'Streaming & Jogos', 'Outros'].includes(log.categoria)
      ).length;
      
      const aiDetections = logs.filter(log => log.categoria === 'IA').length;

      return {
        totalUsers: studentsSnap.size,
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
      const [logsData, studentsData] = await Promise.all([
        logsService.getRecent(100),
        studentsService.getAll()
      ]);

      // Create summary from logs
      const summary = studentsData.map(student => {
        const studentLogs = logsData.filter(
          log => log.aluno_id === student.cpf || log.aluno_id === student.pc_id
        );

        const totalDuration = studentLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
        const lastActivity = studentLogs.length > 0 
          ? studentLogs[0].timestamp 
          : null;

        const hasRedAlert = studentLogs.some(log => 
          ['Rede Social', 'Streaming & Jogos'].includes(log.categoria)
        );
        const hasBlueAlert = studentLogs.some(log => log.categoria === 'IA');

        return {
          student_db_id: student.id,
          student_name: student.full_name,
          cpf: student.cpf || '',
          pc_id: student.pc_id || '',
          aluno_id: student.cpf || student.pc_id || '',
          total_duration: totalDuration,
          log_count: studentLogs.length,
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
