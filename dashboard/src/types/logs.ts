// Types for Logs

export interface Log {
  id?: string;
  log_id?: string;
  aluno_id: string;
  student_name?: string;
  member_name?: string;
  url: string;
  duration: number;
  categoria: string;
  timestamp: string | Date;
}

export interface CategoryOverride {
  hostname: string;
  category: string;
  updated_by_leader_id?: string | null;
  updated_at: string | Date;
}
