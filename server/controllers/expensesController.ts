import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getExpenses, saveExpenses, getProjects } from '../utils/jsonStore';
import { Expense } from '../../src/types';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAllExpenses = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const expenses = getExpenses(userId);
    const projects = getProjects(userId);

    const enriched = expenses.map(expense => {
      const project = projects.find(p => p.id === expense.projectId);
      return {
        ...expense,
        projectName: project ? project.name : 'Unknown Project'
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

export const getExpenseById = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const expenses = getExpenses(userId);
    const expense = expenses.find(e => e.id === req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const projects = getProjects(userId);
    const project = projects.find(p => p.id === expense.projectId);

    res.json({
      ...expense,
      projectName: project ? project.name : 'Unknown Project'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
};

export const createExpense = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const { projectId, date, description, category, amount, vendor } = req.body;
    if (!projectId || !date || !description || !category || amount === undefined) {
      return res.status(400).json({ error: 'projectId, date, description, category, and amount are required' });
    }

    const expenses = getExpenses(userId);
    const newExpense: Expense = {
      id: `exp_${uuidv4().substring(0, 8)}`,
      userId,
      projectId,
      date,
      description,
      category,
      amount: Number(amount) || 0,
      vendor: vendor || '',
      createdAt: new Date().toISOString()
    };

    expenses.unshift(newExpense);
    saveExpenses(expenses, userId);
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

export const updateExpense = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const { id } = req.params;
    const { projectId, date, description, category, amount, vendor } = req.body;

    const expenses = getExpenses(userId);
    const index = expenses.findIndex(e => e.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const updatedExpense: Expense = {
      ...expenses[index],
      ...(projectId !== undefined && { projectId }),
      ...(date !== undefined && { date }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(amount !== undefined && { amount: Number(amount) }),
      ...(vendor !== undefined && { vendor })
    };

    expenses[index] = updatedExpense;
    saveExpenses(expenses, userId);
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

export const deleteExpense = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const { id } = req.params;
    const expenses = getExpenses(userId);
    const index = expenses.findIndex(e => e.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    expenses.splice(index, 1);
    saveExpenses(expenses, userId);
    res.json({ message: 'Expense deleted successfully', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};
