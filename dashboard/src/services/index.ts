// Central export file for all services

// Teams
export * from './teams/teamsService';
export * from './teams/teamMembersService';
export * from './teams/teamLeadersService';

// Members
export * from './members/membersService';

// Leaders
export * from './leaders/leadersService';

// Logs
export { logsService } from './firebaseService';

// Dashboard
export * from './dashboard/dashboardService';

// Re-export specific services for convenience
import { teamsService } from './teams/teamsService';
import { membersService } from './members/membersService';
import { leadersService } from './leaders/leadersService';

// Legacy aliases for backward compatibility
export const classesService = teamsService;
export const studentsService = membersService;
export const professorsService = leadersService;
