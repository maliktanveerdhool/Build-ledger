import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getProjects, saveProjects, getExpenses, getInvoices, getClients, getChangeOrders, getMilestones } from '../utils/jsonStore';
import { Project, ProjectJobCosting } from '../../src/types';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAllProjects = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const projects = getProjects(userId);
    const expenses = getExpenses(userId);
    const invoices = getInvoices(userId);
    const clients = getClients(userId);
    const changeOrders = getChangeOrders(userId);

    // Enrich projects with brief job costing totals
    const enriched = projects.map(project => {
      const projectExpenses = expenses.filter(e => e.projectId === project.id);
      const totalExpenses = projectExpenses.reduce((sum, e) => sum + e.amount, 0);

      const projectInvoices = invoices.filter(i => i.projectId === project.id);
      const totalInvoiced = projectInvoices.reduce((sum, i) => sum + i.total, 0);
      const totalPaid = projectInvoices
        .filter(i => i.status === 'Paid')
        .reduce((sum, i) => sum + i.total, 0);

      const approvedCOs = changeOrders
        .filter(co => co.projectId === project.id && co.status === 'Approved')
        .reduce((sum, co) => sum + co.amount, 0);

      const revisedContractValue = project.contractValue + approvedCOs;

      const client = clients.find(c => c.id === project.clientId);

      return {
        ...project,
        clientName: client ? `${client.company} (${client.name})` : 'Unknown Client',
        approvedChangeOrdersTotal: approvedCOs,
        revisedContractValue,
        totalExpenses,
        totalInvoiced,
        totalPaid,
        remainingBudget: revisedContractValue - totalExpenses
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

export const getProjectById = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const projects = getProjects(userId);
    const project = projects.find(p => p.id === req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const clients = getClients(userId);
    const client = clients.find(c => c.id === project.clientId);

    const expenses = getExpenses(userId).filter(e => e.projectId === project.id);
    const invoices = getInvoices(userId).filter(i => i.projectId === project.id);
    const changeOrders = getChangeOrders(userId).filter(co => co.projectId === project.id);
    const milestones = getMilestones(userId).filter(m => m.projectId === project.id);

    const approvedChangeOrdersTotal = changeOrders
      .filter(co => co.status === 'Approved')
      .reduce((sum, co) => sum + co.amount, 0);

    const originalContractValue = project.contractValue;
    const revisedContractValue = originalContractValue + approvedChangeOrdersTotal;

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);
    const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0);
    const retainageHeld = invoices.reduce((sum, i) => sum + i.retainageAmount, 0);

    const netProfit = revisedContractValue - totalExpenses;
    const profitMarginPercent = revisedContractValue > 0 ? (netProfit / revisedContractValue) * 100 : 0;
    const remainingBudget = revisedContractValue - totalExpenses;
    const budgetUsedPercent = revisedContractValue > 0 ? (totalExpenses / revisedContractValue) * 100 : 0;

    // Breakdown by category
    const categories = ["Labor", "Materials", "Equipment", "Subcontractor", "Other"] as const;
    const categoryExpenses = categories.map(cat => {
      const amount = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
      return {
        category: cat,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      };
    });

    const jobCosting: ProjectJobCosting = {
      project,
      client,
      totalContractValue: originalContractValue,
      approvedChangeOrdersTotal,
      revisedContractValue,
      totalInvoiced,
      totalPaid,
      totalExpenses,
      retainageHeld,
      netProfit,
      profitMarginPercent: Math.round(profitMarginPercent * 10) / 10,
      remainingBudget,
      budgetUsedPercent: Math.round(budgetUsedPercent * 10) / 10,
      categoryExpenses,
      invoices,
      expenses,
      changeOrders,
      milestones
    };

    res.json(jobCosting);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project details' });
  }
};

export const createProject = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const { name, clientId, location, startDate, endDate, contractValue, status, description } = req.body;
    if (!name || !clientId || contractValue === undefined) {
      return res.status(400).json({ error: 'Name, clientId, and contractValue are required' });
    }

    const projects = getProjects(userId);
    const newProject: Project = {
      id: `proj_${uuidv4().substring(0, 8)}`,
      userId,
      name,
      clientId,
      location: location || '',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '',
      contractValue: Number(contractValue) || 0,
      status: status || 'Active',
      description: description || '',
      createdAt: new Date().toISOString()
    };

    projects.unshift(newProject);
    saveProjects(projects, userId);
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
};

export const updateProject = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const { id } = req.params;
    const { name, clientId, location, startDate, endDate, contractValue, status, description } = req.body;

    const projects = getProjects(userId);
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updatedProject: Project = {
      ...projects[index],
      ...(name !== undefined && { name }),
      ...(clientId !== undefined && { clientId }),
      ...(location !== undefined && { location }),
      ...(startDate !== undefined && { startDate }),
      ...(endDate !== undefined && { endDate }),
      ...(contractValue !== undefined && { contractValue: Number(contractValue) }),
      ...(status !== undefined && { status }),
      ...(description !== undefined && { description })
    };

    projects[index] = updatedProject;
    saveProjects(projects, userId);
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
};

export const deleteProject = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const { id } = req.params;
    const projects = getProjects(userId);
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    projects.splice(index, 1);
    saveProjects(projects, userId);
    res.json({ message: 'Project deleted successfully', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
};
