import axios from 'axios';
import { Client, Project, Invoice, Expense, Settings, DashboardStats, ProjectJobCosting, User, AuthResponse, ChangeOrder, ProjectMilestone } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('buildledger_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData: { name: string; email: string; password: string; role?: 'admin' | 'user'; company?: string; clientId?: string }): Promise<AuthResponse> => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getProfile: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const res = await api.get('/users');
    return res.data;
  },
  updateRole: async (id: string, role: 'admin' | 'user'): Promise<User> => {
    const res = await api.patch(`/users/${id}/role`, { role });
    return res.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get('/dashboard');
    return res.data;
  },
};

export const clientsApi = {
  getAll: async (): Promise<Client[]> => {
    const res = await api.get('/clients');
    return res.data;
  },
  getById: async (id: string): Promise<Client> => {
    const res = await api.get(`/clients/${id}`);
    return res.data;
  },
  create: async (data: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
    const res = await api.post('/clients', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Client>): Promise<Client> => {
    const res = await api.put(`/clients/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<{ message: string; id: string }> => {
    const res = await api.delete(`/clients/${id}`);
    return res.data;
  },
};

export const projectsApi = {
  getAll: async (): Promise<(Project & { clientName?: string; totalExpenses?: number; remainingBudget?: number; totalInvoiced?: number; totalPaid?: number })[]> => {
    const res = await api.get('/projects');
    return res.data;
  },
  getById: async (id: string): Promise<ProjectJobCosting> => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },
  create: async (data: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    const res = await api.post('/projects', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const res = await api.put(`/projects/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<{ message: string; id: string }> => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },
};

export const invoicesApi = {
  getAll: async (): Promise<(Invoice & { projectName?: string; clientName?: string })[]> => {
    const res = await api.get('/invoices');
    return res.data;
  },
  getById: async (id: string): Promise<Invoice & { projectName?: string; clientName?: string; project?: Project; client?: Client }> => {
    const res = await api.get(`/invoices/${id}`);
    return res.data;
  },
  create: async (data: Partial<Invoice>): Promise<Invoice> => {
    const res = await api.post('/invoices', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Invoice>): Promise<Invoice> => {
    const res = await api.put(`/invoices/${id}`, data);
    return res.data;
  },
  updateStatus: async (id: string, status: Invoice['status']): Promise<Invoice> => {
    const res = await api.patch(`/invoices/${id}/status`, { status });
    return res.data;
  },
  delete: async (id: string): Promise<{ message: string; id: string }> => {
    const res = await api.delete(`/invoices/${id}`);
    return res.data;
  },
};

export const expensesApi = {
  getAll: async (): Promise<(Expense & { projectName?: string })[]> => {
    const res = await api.get('/expenses');
    return res.data;
  },
  getById: async (id: string): Promise<Expense & { projectName?: string }> => {
    const res = await api.get(`/expenses/${id}`);
    return res.data;
  },
  create: async (data: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> => {
    const res = await api.post('/expenses', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Expense>): Promise<Expense> => {
    const res = await api.put(`/expenses/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<{ message: string; id: string }> => {
    const res = await api.delete(`/expenses/${id}`);
    return res.data;
  },
};

export const settingsApi = {
  get: async (): Promise<Settings> => {
    const res = await api.get('/settings');
    return res.data;
  },
  update: async (data: Partial<Settings>): Promise<Settings> => {
    const res = await api.put('/settings', data);
    return res.data;
  },
  seedDemo: async (): Promise<{ message: string }> => {
    const res = await api.post('/settings/seed-demo');
    return res.data;
  },
  clearDemo: async (): Promise<{ message: string }> => {
    const res = await api.post('/settings/clear-demo');
    return res.data;
  },
  resetData: async (): Promise<{ message: string }> => {
    const res = await api.post('/settings/reset');
    return res.data;
  },
};

export const changeOrdersApi = {
  getAll: async (): Promise<(ChangeOrder & { projectName?: string })[]> => {
    const res = await api.get('/change-orders');
    return res.data;
  },
  create: async (data: Omit<ChangeOrder, 'id' | 'changeOrderNumber' | 'createdAt'>): Promise<ChangeOrder> => {
    const res = await api.post('/change-orders', data);
    return res.data;
  },
  updateStatus: async (id: string, status: ChangeOrder['status']): Promise<ChangeOrder> => {
    const res = await api.patch(`/change-orders/${id}/status`, { status });
    return res.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/change-orders/${id}`);
    return res.data;
  }
};

export const milestonesApi = {
  getAll: async (): Promise<(ProjectMilestone & { projectName?: string })[]> => {
    const res = await api.get('/milestones');
    return res.data;
  },
  create: async (data: Omit<ProjectMilestone, 'id' | 'createdAt'>): Promise<ProjectMilestone> => {
    const res = await api.post('/milestones', data);
    return res.data;
  },
  update: async (id: string, data: Partial<ProjectMilestone>): Promise<ProjectMilestone> => {
    const res = await api.put(`/milestones/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/milestones/${id}`);
    return res.data;
  }
};

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default api;
