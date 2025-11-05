import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboardData"],
    queryFn: api.getDashboardData,
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useClasses = () => {
  return useQuery({
    queryKey: ["classes"],
    queryFn: api.getClasses,
    staleTime: 60000,
  });
};

export const useAllStudents = () => {
  return useQuery({
    queryKey: ["allStudents"],
    queryFn: api.getAllStudents,
    staleTime: 60000,
  });
};

export const useClassStudents = (classId: string | null) => {
  return useQuery({
    queryKey: ["classStudents", classId],
    queryFn: () => classId ? api.getClassStudents(classId) : Promise.resolve([]),
    enabled: !!classId,
    staleTime: 30000,
  });
};

export const useClassMembers = (classId: string | null) => {
  return useQuery({
    queryKey: ["classMembers", classId],
    queryFn: () => classId ? api.getClassMembers(classId) : Promise.resolve({ members: [], isCurrentUserOwner: false }),
    enabled: !!classId,
    staleTime: 30000,
  });
};

export const useProfessors = () => {
  return useQuery({
    queryKey: ["professors"],
    queryFn: api.getProfessors,
    staleTime: 60000,
  });
};
