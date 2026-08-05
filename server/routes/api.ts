import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
} from '../controllers/clientsController';

import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectsController';

import {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice
} from '../controllers/invoicesController';

import {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
} from '../controllers/expensesController';

import {
  getAllChangeOrders,
  createChangeOrder,
  updateChangeOrderStatus,
  deleteChangeOrder
} from '../controllers/changeOrdersController';

import {
  getAllMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone
} from '../controllers/milestonesController';

import {
  getCompanySettings,
  updateCompanySettings,
  resetDataToSeed,
  seedUserDemoData,
  clearUserDemoData
} from '../controllers/settingsController';

import { getDashboardStats } from '../controllers/dashboardController';
import {
  login,
  register,
  getProfile,
  getAllUsers,
  updateUserRole,
  deleteUser
} from '../controllers/authController';

const router = Router();

// Public Auth Routes
router.post('/auth/login', login);
router.post('/auth/register', register);

// Apply auth middleware to all subsequent API endpoints
router.use(authMiddleware as any);

router.get('/auth/me', getProfile);

// User Management Routes (Admin capability verified inside or via role)
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Clients
router.get('/clients', getAllClients);
router.get('/clients/:id', getClientById);
router.post('/clients', createClient);
router.put('/clients/:id', updateClient);
router.delete('/clients/:id', deleteClient);

// Projects
router.get('/projects', getAllProjects);
router.get('/projects/:id', getProjectById);
router.post('/projects', createProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

// Invoices
router.get('/invoices', getAllInvoices);
router.get('/invoices/:id', getInvoiceById);
router.post('/invoices', createInvoice);
router.put('/invoices/:id', updateInvoice);
router.delete('/invoices/:id', deleteInvoice);
router.patch('/invoices/:id/status', updateInvoiceStatus);

// Expenses
router.get('/expenses', getAllExpenses);
router.get('/expenses/:id', getExpenseById);
router.post('/expenses', createExpense);
router.put('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);

// Change Orders
router.get('/change-orders', getAllChangeOrders);
router.post('/change-orders', createChangeOrder);
router.patch('/change-orders/:id/status', updateChangeOrderStatus);
router.delete('/change-orders/:id', deleteChangeOrder);

// Milestones
router.get('/milestones', getAllMilestones);
router.post('/milestones', createMilestone);
router.put('/milestones/:id', updateMilestone);
router.delete('/milestones/:id', deleteMilestone);

// Settings & Demo Data
router.get('/settings', getCompanySettings);
router.put('/settings', updateCompanySettings);
router.post('/settings/seed-demo', seedUserDemoData);
router.post('/settings/clear-demo', clearUserDemoData);
router.post('/settings/reset', resetDataToSeed);

export default router;
