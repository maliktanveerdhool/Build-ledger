import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { getSettings, saveSettings, seedInitialData, seedUserData, clearUserData } from '../utils/jsonStore';

export const getCompanySettings = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const settings = getSettings(userId);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateCompanySettings = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const current = getSettings(userId);
    const updated = {
      ...current,
      ...req.body,
      userId
    };

    if (updated.nextInvoiceNumber) {
      updated.nextInvoiceNumber = Number(updated.nextInvoiceNumber);
    }

    saveSettings(updated, userId);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

export const seedUserDemoData = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    if (userId === 'usr_admin_1') {
      seedInitialData(true);
    } else {
      seedUserData(userId);
    }
    res.json({ message: 'Sample demo construction data loaded successfully into your workspace!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to seed sample demo data' });
  }
};

export const clearUserDemoData = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    clearUserData(userId);
    res.json({ message: 'All workspace data cleared successfully. Starting with clean zero data.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear workspace data' });
  }
};

export const resetDataToSeed = (req: AuthenticatedRequest, res: Response) => {
  try {
    seedInitialData(true);
    res.json({ message: 'All JSON data successfully reset to initial seed values' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset data' });
  }
};
