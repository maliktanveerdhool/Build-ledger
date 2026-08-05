import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getInvoices, saveInvoices, getSettings, saveSettings, getProjects, getClients } from '../utils/jsonStore';
import { Invoice, InvoiceLineItem } from '../../src/types';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAllInvoices = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const invoices = getInvoices(userId);
    const projects = getProjects(userId);
    const clients = getClients(userId);

    const enriched = invoices.map(invoice => {
      const project = projects.find(p => p.id === invoice.projectId);
      const client = clients.find(c => c.id === invoice.clientId);
      return {
        ...invoice,
        projectName: project ? project.name : 'Unknown Project',
        clientName: client ? client.company : 'Unknown Client'
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

export const getInvoiceById = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const invoices = getInvoices(userId);
    const invoice = invoices.find(i => i.id === req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const projects = getProjects(userId);
    const clients = getClients(userId);
    const project = projects.find(p => p.id === invoice.projectId);
    const client = clients.find(c => c.id === invoice.clientId);

    res.json({
      ...invoice,
      project,
      client,
      projectName: project ? project.name : 'Unknown Project',
      clientName: client ? client.company : 'Unknown Client'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

export const createInvoice = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const {
      projectId,
      clientId,
      issueDate,
      dueDate,
      status,
      lineItems = [],
      retainagePercent = 0,
      notes
    } = req.body;

    if (!projectId || !clientId || !issueDate) {
      return res.status(400).json({ error: 'projectId, clientId, and issueDate are required' });
    }

    const settings = getSettings(userId);
    const invoiceNumStr = String(settings.nextInvoiceNumber || 1001);
    const invoiceNumber = req.body.invoiceNumber || `${settings.invoicePrefix || 'INV-'}${invoiceNumStr}`;

    // Calculate line item amounts
    const processedLineItems: InvoiceLineItem[] = lineItems.map((item: any) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      return {
        description: item.description || '',
        quantity: qty,
        unitPrice: price,
        amount: Math.round(qty * price * 100) / 100
      };
    });

    const subtotal = processedLineItems.reduce((sum, item) => sum + item.amount, 0);
    const retainagePct = Number(retainagePercent) || 0;
    const retainageAmount = Math.round(subtotal * (retainagePct / 100) * 100) / 100;
    const total = Math.round((subtotal - retainageAmount) * 100) / 100;

    const invoices = getInvoices(userId);
    const newInvoice: Invoice = {
      id: `inv_${uuidv4().substring(0, 8)}`,
      userId,
      invoiceNumber,
      projectId,
      clientId,
      issueDate,
      dueDate: dueDate || issueDate,
      status: status || 'Draft',
      lineItems: processedLineItems,
      subtotal,
      retainagePercent: retainagePct,
      retainageAmount,
      total,
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    if (newInvoice.status === 'Paid') {
      newInvoice.paidAt = new Date().toISOString();
    }

    invoices.unshift(newInvoice);
    saveInvoices(invoices, userId);

    // Auto-increment nextInvoiceNumber in settings if default was used
    if (!req.body.invoiceNumber) {
      settings.nextInvoiceNumber = (settings.nextInvoiceNumber || 1000) + 1;
      saveSettings(settings, userId);
    }

    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

export const updateInvoice = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const { id } = req.params;
    const {
      projectId,
      clientId,
      issueDate,
      dueDate,
      status,
      lineItems,
      retainagePercent,
      notes,
      invoiceNumber
    } = req.body;

    const invoices = getInvoices(userId);
    const index = invoices.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const current = invoices[index];
    const finalLineItems: InvoiceLineItem[] = lineItems !== undefined
      ? lineItems.map((item: any) => {
          const qty = Number(item.quantity) || 0;
          const price = Number(item.unitPrice) || 0;
          return {
            description: item.description || '',
            quantity: qty,
            unitPrice: price,
            amount: Math.round(qty * price * 100) / 100
          };
        })
      : current.lineItems;

    const subtotal = finalLineItems.reduce((sum, item) => sum + item.amount, 0);
    const retainagePct = retainagePercent !== undefined ? Number(retainagePercent) : current.retainagePercent;
    const retainageAmount = Math.round(subtotal * (retainagePct / 100) * 100) / 100;
    const total = Math.round((subtotal - retainageAmount) * 100) / 100;

    const newStatus = status !== undefined ? status : current.status;
    let paidAt = current.paidAt;
    if (newStatus === 'Paid' && !paidAt) {
      paidAt = new Date().toISOString();
    } else if (newStatus !== 'Paid') {
      paidAt = undefined;
    }

    const updatedInvoice: Invoice = {
      ...current,
      ...(invoiceNumber !== undefined && { invoiceNumber }),
      ...(projectId !== undefined && { projectId }),
      ...(clientId !== undefined && { clientId }),
      ...(issueDate !== undefined && { issueDate }),
      ...(dueDate !== undefined && { dueDate }),
      status: newStatus,
      lineItems: finalLineItems,
      subtotal,
      retainagePercent: retainagePct,
      retainageAmount,
      total,
      paidAt,
      ...(notes !== undefined && { notes })
    };

    invoices[index] = updatedInvoice;
    saveInvoices(invoices, userId);
    res.json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice' });
  }
};

export const updateInvoiceStatus = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const invoices = getInvoices(userId);
    const index = invoices.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    invoices[index].status = status;
    if (status === 'Paid') {
      invoices[index].paidAt = new Date().toISOString();
    } else {
      invoices[index].paidAt = undefined;
    }

    saveInvoices(invoices, userId);
    res.json(invoices[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
};

export const deleteInvoice = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'usr_admin_1';
    const { id } = req.params;
    const invoices = getInvoices(userId);
    const index = invoices.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    invoices.splice(index, 1);
    saveInvoices(invoices, userId);
    res.json({ message: 'Invoice deleted successfully', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};
