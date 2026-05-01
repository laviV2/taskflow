import { create } from 'zustand';
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  projects: any[];
  setProjects: (projects: any[]) => void;
  fetchProjects: () => Promise<void>;
  
  tasks: any[];
  setTasks: (tasks: any[]) => void;
  fetchTasks: () => Promise<void>;
  
  team: any[];
  fetchTeam: () => Promise<void>;
  
  attendance: any[];
  fetchAttendance: () => Promise<void>;
  
  leaves: any[];
  fetchLeaves: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  projects: [],
  setProjects: (projects) => set({ projects }),
  fetchProjects: async () => {
    try {
      const res = await api.get('/projects');
      set({ projects: res.data });
    } catch (e) {}
  },
  
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  fetchTasks: async () => {
    try {
      const res = await api.get('/tasks');
      set({ tasks: res.data });
    } catch (e) {}
  },
  
  team: [],
  fetchTeam: async () => {
    try {
      const res = await api.get('/team');
      set({ team: res.data });
    } catch (e) {}
  },
  
  attendance: [],
  fetchAttendance: async () => {
    try {
      const res = await api.get('/attendance');
      set({ attendance: res.data });
    } catch (e) {}
  },
  
  leaves: [],
  fetchLeaves: async () => {
    try {
      const res = await api.get('/leaves');
      set({ leaves: res.data });
    } catch (e) {}
  }
}));
