import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getMilestones, saveMilestones, getProjects } from '../utils/jsonStore';
import { ProjectMilestone } from '../../src/types';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAllMilestones = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const milestones = getMilestones(userId);
    const projects = getProjects(userId);

    const enriched = milestones.map(m => {
      const project = projects.find(p => p.id === m.projectId);
      return {
        ...m,
        projectName: project ? project.name : 'Unknown Project'
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
};

export const createMilestone = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const { projectId, title, targetDate, completionPercent, status, notes } = req.body;

    if (!projectId || !title || !targetDate) {
      return res.status(400).json({ error: 'Project ID, title, and target date are required' });
    }

    const milestones = getMilestones(userId);
    const newMilestone: ProjectMilestone = {
      id: `ms_${uuidv4().slice(0, 8)}`,
      userId,
      projectId,
      title: title.trim(),
      targetDate,
      completionPercent: completionPercent !== undefined ? Number(completionPercent) : 0,
      status: status || 'Not Started',
      notes: notes?.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    milestones.unshift(newMilestone);
    saveMilestones(milestones, userId);

    res.status(201).json(newMilestone);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create milestone' });
  }
};

export const updateMilestone = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const { id } = req.params;
    const { title, targetDate, completionPercent, status, notes } = req.body;

    const milestones = getMilestones(userId);
    const index = milestones.findIndex(m => m.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    if (title !== undefined) milestones[index].title = title.trim();
    if (targetDate !== undefined) milestones[index].targetDate = targetDate;
    if (completionPercent !== undefined) milestones[index].completionPercent = Number(completionPercent);
    if (status !== undefined) milestones[index].status = status;
    if (notes !== undefined) milestones[index].notes = notes.trim();

    saveMilestones(milestones, userId);

    res.json(milestones[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update milestone' });
  }
};

export const deleteMilestone = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const { id } = req.params;

    let milestones = getMilestones(userId);
    const exists = milestones.some(m => m.id === id);
    if (!exists) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    milestones = milestones.filter(m => m.id !== id);
    saveMilestones(milestones, userId);

    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete milestone' });
  }
};
