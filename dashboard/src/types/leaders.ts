// Types for Leaders (formerly Professors)

export interface Leader {
  id?: string;
  full_name: string;
  username?: string;
  email: string;
  created_at?: Date | string;
  isOwner?: boolean;
}
