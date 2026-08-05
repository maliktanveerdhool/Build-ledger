import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getChangeOrders, saveChangeOrders, getProjects } from '../utils/jsonStore';
import { ChangeOrder } from '../../src/types';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAllChangeOrders = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const changeOrders = getChangeOrders(userId);
    const projects = getProjects(userId);

    const enriched = changeOrders.map(co => {
      const project = projects.find(p => p.id === co.projectId);
      return {
        ...co,
        projectName: project ? project.name : 'Unknown Project'
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch change orders' });
  }
};

export const createChangeOrder = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const { projectId, title, description, amount, status, date } = req.body;

    if (!projectId || !title || amount === undefined) {
      return res.status(400).json({ error: 'Project ID, title, and amount are required' });
    }

    const changeOrders = getChangeOrders(userId);
    const projectCOs = changeOrders.filter(co => co.projectId === projectId);
    const coCount = projectCOs.length + 1;
    const changeOrderNumber = `CO-${String(coCount).padStart(3, '0')}`;

    const newCO: ChangeOrder = {
      id: `co_${uuidv4().slice(0, 8)}`,
      userId,
      projectId,
      changeOrderNumber,
      title: title.trim(),
      description: description?.trim() || undefined,
      amount: Number(amount),
      status: status || 'Pending',
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    changeOrders.unshift(newCO);
    saveChangeOrders(changeOrders, userId);

    res.status(201).json(newCO);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create change order' });
  }
};

export const updateChangeOrderStatus = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const changeOrders = getChangeOrders(userId);
    const index = changeOrders.findIndex(co => co.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Change order not found' });
    }

    changeOrders[index].status = status;
    saveChangeOrders(changeOrders, userId);

    res.json(changeOrders[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update change order status' });
  }
};

export const deleteChangeOrder = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const { id } = req.params;

    let changeOrders = getChangeOrders(userId);
    const exists = changeOrders.some(co => co.id === id);
    if (!exists) {
      return res.status(404).json({ error: 'Change order not found' });
    }

    changeOrders = changeOrders.filter(co => co.id !== id);
    saveChangeOrders(changeOrders, userId);

    res.json({ message: 'Change order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete change order' });
  }
};
