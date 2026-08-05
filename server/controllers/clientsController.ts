import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getClients, saveClients, getProjects } from '../utils/jsonStore';
import { Client } from '../../src/types';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAllClients = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const clients = getClients(userId);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
};

export const getClientById = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const clients = getClients(userId);
    const client = clients.find(c => c.id === req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch client' });
  }
};

export const createClient = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const { name, company, email, phone, address } = req.body;
    if (!name || !company || !email) {
      return res.status(400).json({ error: 'Name, company, and email are required' });
    }

    const clients = getClients(userId);
    const newClient: Client = {
      id: `cli_${uuidv4().substring(0, 8)}`,
      userId,
      name,
      company,
      email,
      phone: phone || '',
      address: address || '',
      createdAt: new Date().toISOString()
    };

    clients.unshift(newClient);
    saveClients(clients, userId);
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create client' });
  }
};

export const updateClient = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const { id } = req.params;
    const { name, company, email, phone, address } = req.body;

    const clients = getClients(userId);
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const updatedClient: Client = {
      ...clients[index],
      ...(name !== undefined && { name }),
      ...(company !== undefined && { company }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address })
    };

    clients[index] = updatedClient;
    saveClients(clients, userId);
    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update client' });
  }
};

export const deleteClient = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const { id } = req.params;
    const clients = getClients(userId);
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Check if client has projects
    const projects = getProjects(userId);
    const clientProjects = projects.filter(p => p.clientId === id);
    if (clientProjects.length > 0) {
      return res.status(400).json({
        error: `Cannot delete client with ${clientProjects.length} active/associated project(s). Reassign or delete projects first.`
      });
    }

    clients.splice(index, 1);
    saveClients(clients, userId);
    res.json({ message: 'Client deleted successfully', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete client' });
  }
};
