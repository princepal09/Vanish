import api from "@/lib/axios";

export interface DashboardStats {
  totalCreated: number;
  totalBurned: number;
  totalExpired: number;
  currentlyAlive: number;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
  message: string;
}

export const getDashboardStats = async():Promise<DashboardResponse> => {
  const response = await api.get("/dashboard");

  return response.data;
}