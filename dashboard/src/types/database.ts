// Tipos baseados no schema MySQL v_o_c_e

export interface Professor {
  id: number;
  full_name: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface Student {
  id: number;
  full_name: string;
  cpf: string | null;
  pc_id: string | null;
  created_at: string;
}

export interface Class {
  id: number;
  name: string;
  owner_id: number;
  owner_name?: string;
  student_count?: number;
  professor_count?: number;
  created_at: string;
}

export interface Log {
  id: number;
  aluno_id: string;
  url: string;
  duration: number;
  categoria: string | null;
  timestamp: string;
}

export interface CategoryOverride {
  hostname: string;
  category: string;
  updated_by_professor_id: number | null;
  updated_at: string;
}

export interface ClassMember {
  class_id: number;
  professor_id: number;
}

export interface ClassStudent {
  class_id: number;
  student_id: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalAlerts: number;
  aiDetections: number;
  totalLogs: number;
}

export interface RecentAccess {
  url: string;
  category: string;
  timestamp: string;
  student_name: string;
}
