export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  clientId?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Client {
  id: string;
  userId?: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId?: string;
  name: string;
  clientId: string;
  location: string;
  startDate: string;
  endDate?: string;
  contractValue: number;
  status: "Active" | "Completed" | "On Hold";
  description?: string;
  createdAt: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  userId?: string;
  invoiceNumber: string;
  projectId: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  lineItems: InvoiceLineItem[];
  subtotal: number;
  retainagePercent: number;
  retainageAmount: number;
  total: number;
  notes?: string;
  paidAt?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  userId?: string;
  projectId: string;
  date: string;
  description: string;
  category: "Labor" | "Materials" | "Equipment" | "Subcontractor" | "Other";
  amount: number;
  vendor?: string;
  lienWaiverStatus?: "Collected" | "Pending" | "N/A";
  createdAt: string;
}

export interface ChangeOrder {
  id: string;
  userId?: string;
  projectId: string;
  changeOrderNumber: string; // e.g. CO-001
  title: string;
  description?: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
  createdAt: string;
}

export interface ProjectMilestone {
  id: string;
  userId?: string;
  projectId: string;
  title: string;
  targetDate: string;
  completionPercent: number; // 0 to 100
  status: "Not Started" | "In Progress" | "Completed" | "Delayed";
  notes?: string;
  createdAt: string;
}

export interface Settings {
  userId?: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  taxId: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  currency: string;
}

export interface DashboardStats {
  totalRevenue: number;
  outstandingReceivables: number;
  totalExpenses: number;
  netIncome: number;
  activeProjectsCount: number;
  completedProjectsCount: number;
  totalClientsCount: number;
  overdueInvoicesCount: number;
  monthlyFinancials: {
    month: string;
    revenue: number;
    expenses: number;
  }[];
  categoryExpenses: {
    category: string;
    amount: number;
  }[];
  recentInvoices: (Invoice & { projectName?: string; clientName?: string })[];
  recentExpenses: (Expense & { projectName?: string })[];
}

export interface ProjectJobCosting {
  project: Project;
  client?: Client;
  totalContractValue: number; // Original
  approvedChangeOrdersTotal: number;
  revisedContractValue: number; // Original + Approved COs
  totalInvoiced: number;
  totalPaid: number;
  totalExpenses: number;
  retainageHeld: number;
  netProfit: number;
  profitMarginPercent: number;
  remainingBudget: number;
  budgetUsedPercent: number;
  categoryExpenses: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  invoices: Invoice[];
  expenses: Expense[];
  changeOrders?: ChangeOrder[];
  milestones?: ProjectMilestone[];
}
