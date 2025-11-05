// Types for Teams (formerly Classes)

export interface Team {
  id?: string;
  name: string;
  owner_id: string;
  owner_name?: string;
  member_count?: number;
  leader_count?: number;
  created_at?: Date | string;
}

export interface TeamLeader {
  team_id: string;
  leader_id: string;
  added_at?: Date | string;
}

export interface TeamMember {
  team_id: string;
  member_id: string;
  added_at?: Date | string;
}
