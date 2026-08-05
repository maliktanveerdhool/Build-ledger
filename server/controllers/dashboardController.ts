import { Response } from 'express';
import { getInvoices, getExpenses, getProjects, getClients } from '../utils/jsonStore';
import { DashboardStats } from '../../src/types';
import { AuthenticatedRequest } from '../middleware/auth';

export const getDashboardStats = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const invoices = getInvoices(userId);
    const expenses = getExpenses(userId);
    const projects = getProjects(userId);
    const clients = getClients(userId);

    // Key KPIs
    const paidInvoices = invoices.filter(i => i.status === 'Paid');
    const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.total, 0);

    const outstandingInvoices = invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue');
    const outstandingReceivables = outstandingInvoices.reduce((sum, i) => sum + i.total, 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = totalRevenue - totalExpenses;

    const activeProjectsCount = projects.filter(p => p.status === 'Active').length;
    const completedProjectsCount = projects.filter(p => p.status === 'Completed').length;
    const totalClientsCount = clients.length;
    const overdueInvoicesCount = invoices.filter(i => i.status === 'Overdue').length;

    // Monthly Financials (Jan to Jun 2026 or past 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
    const monthlyFinancials = monthNames.map((m, idx) => {
      const monthNum = (idx + 1).toString().padStart(2, '0');
      const yearMonth = `2026-${monthNum}`;

      // Revenue from paid invoices in this month (or issue date if paid)
      const monthRevenue = invoices
        .filter(i => i.status === 'Paid' && (i.paidAt?.startsWith(yearMonth) || i.issueDate.startsWith(yearMonth)))
        .reduce((sum, i) => sum + i.total, 0);

      const monthExpenses = expenses
        .filter(e => e.date.startsWith(yearMonth))
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        month: m,
        revenue: monthRevenue,
        expenses: monthExpenses
      };
    });

    // Category Breakdown
    const categories = ["Labor", "Materials", "Equipment", "Subcontractor", "Other"] as const;
    const categoryExpenses = categories.map(cat => ({
      category: cat,
      amount: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
    }));

    // Recent Invoices (top 5)
    const recentInvoices = invoices.slice(0, 5).map(inv => {
      const proj = projects.find(p => p.id === inv.projectId);
      const cli = clients.find(c => c.id === inv.clientId);
      return {
        ...inv,
        projectName: proj ? proj.name : 'Unknown Project',
        clientName: cli ? cli.company : 'Unknown Client'
      };
    });

    // Recent Expenses (top 5)
    const recentExpenses = expenses.slice(0, 5).map(exp => {
      const proj = projects.find(p => p.id === exp.projectId);
      return {
        ...exp,
        projectName: proj ? proj.name : 'Unknown Project'
      };
    });

    const stats: DashboardStats = {
      totalRevenue,
      outstandingReceivables,
      totalExpenses,
      netIncome,
      activeProjectsCount,
      completedProjectsCount,
      totalClientsCount,
      overdueInvoicesCount,
      monthlyFinancials,
      categoryExpenses,
      recentInvoices,
      recentExpenses
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate dashboard stats' });
  }
};
