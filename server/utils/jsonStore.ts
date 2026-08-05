import fs from 'fs';
import path from 'path';
import { Client, Project, Invoice, Expense, Settings, User, ChangeOrder, ProjectMilestone } from '../../src/types';

export interface UserRecord extends User {
  passwordHash: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');

const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const INVOICES_FILE = path.join(DATA_DIR, 'invoices.json');
const EXPENSES_FILE = path.join(DATA_DIR, 'expenses.json');
const CHANGE_ORDERS_FILE = path.join(DATA_DIR, 'change_orders.json');
const MILESTONES_FILE = path.join(DATA_DIR, 'milestones.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure directory exists
export function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Helper to read JSON file
export function readJson<T>(filePath: string, fallback: T): T {
  try {
    ensureDataDir();
    if (!fs.existsSync(filePath)) {
      writeJson(filePath, fallback);
      return fallback;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    if (!content.trim()) {
      writeJson(filePath, fallback);
      return fallback;
    }
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return fallback;
  }
}

// Helper to write JSON file
export function writeJson<T>(filePath: string, data: T): void {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    throw error;
  }
}

// User-Scoped Entity Accessors
export const getClients = (userId?: string): Client[] => {
  const all = readJson<Client[]>(CLIENTS_FILE, []);
  const targetId = userId || 'usr_admin_1';
  return all.filter(c => (c.userId || 'usr_admin_1') === targetId);
};

export const saveClients = (clients: Client[], userId?: string) => {
  const targetId = userId || 'usr_admin_1';
  const all = readJson<Client[]>(CLIENTS_FILE, []);
  const otherUsersClients = all.filter(c => (c.userId || 'usr_admin_1') !== targetId);
  const tagged = clients.map(c => ({ ...c, userId: targetId }));
  writeJson(CLIENTS_FILE, [...otherUsersClients, ...tagged]);
};

export const getProjects = (userId?: string): Project[] => {
  const all = readJson<Project[]>(PROJECTS_FILE, []);
  const targetId = userId || 'usr_admin_1';
  return all.filter(p => (p.userId || 'usr_admin_1') === targetId);
};

export const saveProjects = (projects: Project[], userId?: string) => {
  const targetId = userId || 'usr_admin_1';
  const all = readJson<Project[]>(PROJECTS_FILE, []);
  const otherUsersProjects = all.filter(p => (p.userId || 'usr_admin_1') !== targetId);
  const tagged = projects.map(p => ({ ...p, userId: targetId }));
  writeJson(PROJECTS_FILE, [...otherUsersProjects, ...tagged]);
};

export const getInvoices = (userId?: string): Invoice[] => {
  const all = readJson<Invoice[]>(INVOICES_FILE, []);
  const targetId = userId || 'usr_admin_1';
  return all.filter(i => (i.userId || 'usr_admin_1') === targetId);
};

export const saveInvoices = (invoices: Invoice[], userId?: string) => {
  const targetId = userId || 'usr_admin_1';
  const all = readJson<Invoice[]>(INVOICES_FILE, []);
  const otherUsersInvoices = all.filter(i => (i.userId || 'usr_admin_1') !== targetId);
  const tagged = invoices.map(i => ({ ...i, userId: targetId }));
  writeJson(INVOICES_FILE, [...otherUsersInvoices, ...tagged]);
};

export const getExpenses = (userId?: string): Expense[] => {
  const all = readJson<Expense[]>(EXPENSES_FILE, []);
  const targetId = userId || 'usr_admin_1';
  return all.filter(e => (e.userId || 'usr_admin_1') === targetId);
};

export const saveExpenses = (expenses: Expense[], userId?: string) => {
  const targetId = userId || 'usr_admin_1';
  const all = readJson<Expense[]>(EXPENSES_FILE, []);
  const otherUsersExpenses = all.filter(e => (e.userId || 'usr_admin_1') !== targetId);
  const tagged = expenses.map(e => ({ ...e, userId: targetId }));
  writeJson(EXPENSES_FILE, [...otherUsersExpenses, ...tagged]);
};

export const getChangeOrders = (userId?: string): ChangeOrder[] => {
  const all = readJson<ChangeOrder[]>(CHANGE_ORDERS_FILE, []);
  const targetId = userId || 'usr_admin_1';
  return all.filter(c => (c.userId || 'usr_admin_1') === targetId);
};

export const saveChangeOrders = (changeOrders: ChangeOrder[], userId?: string) => {
  const targetId = userId || 'usr_admin_1';
  const all = readJson<ChangeOrder[]>(CHANGE_ORDERS_FILE, []);
  const otherUsersCOs = all.filter(c => (c.userId || 'usr_admin_1') !== targetId);
  const tagged = changeOrders.map(c => ({ ...c, userId: targetId }));
  writeJson(CHANGE_ORDERS_FILE, [...otherUsersCOs, ...tagged]);
};

export const getMilestones = (userId?: string): ProjectMilestone[] => {
  const all = readJson<ProjectMilestone[]>(MILESTONES_FILE, []);
  const targetId = userId || 'usr_admin_1';
  return all.filter(m => (m.userId || 'usr_admin_1') === targetId);
};

export const saveMilestones = (milestones: ProjectMilestone[], userId?: string) => {
  const targetId = userId || 'usr_admin_1';
  const all = readJson<ProjectMilestone[]>(MILESTONES_FILE, []);
  const otherUsersMs = all.filter(m => (m.userId || 'usr_admin_1') !== targetId);
  const tagged = milestones.map(m => ({ ...m, userId: targetId }));
  writeJson(MILESTONES_FILE, [...otherUsersMs, ...tagged]);
};

export const getSettings = (userId?: string): Settings => {
  const targetId = userId || 'usr_admin_1';
  try {
    const raw = readJson<any>(SETTINGS_FILE, defaultSettings);
    if (Array.isArray(raw)) {
      const found = raw.find((s: Settings) => (s.userId || 'usr_admin_1') === targetId);
      if (found) return found;
    } else if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      if (targetId === 'usr_admin_1') return { ...raw, userId: 'usr_admin_1' };
    }
  } catch (err) {
    // fallback
  }

  if (targetId === 'usr_admin_1') {
    return { ...defaultSettings, userId: 'usr_admin_1' };
  }

  // Clean empty default settings for new registered users
  return {
    userId: targetId,
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "",
    taxId: "",
    invoicePrefix: "INV-",
    nextInvoiceNumber: 1001,
    currency: "$"
  };
};

export const saveSettings = (settings: Settings, userId?: string) => {
  const targetId = userId || settings.userId || 'usr_admin_1';
  let all: Settings[] = [];
  const raw = readJson<any>(SETTINGS_FILE, defaultSettings);
  if (Array.isArray(raw)) {
    all = raw;
  } else if (raw && typeof raw === 'object') {
    all = [{ ...raw, userId: 'usr_admin_1' }];
  }

  const others = all.filter(s => (s.userId || 'usr_admin_1') !== targetId);
  const updated = { ...settings, userId: targetId };
  writeJson(SETTINGS_FILE, [...others, updated]);
};

export const getUsers = (): UserRecord[] => readJson<UserRecord[]>(USERS_FILE, []);
export const saveUsers = (users: UserRecord[]) => writeJson(USERS_FILE, users);

const defaultSettings: Settings = {
  userId: "usr_admin_1",
  companyName: "BuildLedger Construction Services Inc.",
  companyAddress: "100 Builders Way, Suite 400, Chicago, IL 60601",
  companyPhone: "(312) 555-0199",
  companyEmail: "billing@buildledger.com",
  taxId: "36-9876543",
  invoicePrefix: "INV-2026-",
  nextInvoiceNumber: 1016,
  currency: "$"
};

export function seedUserData(userId: string) {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  const companyName = user?.company || `${user?.name || 'Registered User'} Construction LLC`;

  const userClients: Client[] = [
    {
      id: `cli_${userId}_1`,
      userId,
      name: "Elena Rostova",
      company: "Apex Urban Ventures",
      email: "elena@apexurban.com",
      phone: "(312) 555-0811",
      address: "850 N Lake Shore Dr, Chicago, IL 60611",
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: `cli_${userId}_2`,
      userId,
      name: "Marcus Vance",
      company: "Biscayne Bay Holdings",
      email: "mvance@biscayne.com",
      phone: "(312) 555-0922",
      address: "1200 Dockside Way, Suite 400, Chicago, IL 60605",
      createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString()
    }
  ];

  const userProjects: Project[] = [
    {
      id: `proj_${userId}_1`,
      userId,
      name: "Skyline Tower Renovation",
      clientId: `cli_${userId}_1`,
      location: "740 Grand Ave, Suite 12, Chicago, IL",
      startDate: "2026-02-01",
      endDate: "2026-08-30",
      contractValue: 450000,
      status: "Active",
      description: "Interior commercial fit-out and architectural curtain wall upgrade.",
      createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: `proj_${userId}_2`,
      userId,
      name: "Riverfront Commercial Plaza",
      clientId: `cli_${userId}_2`,
      location: "1200 Dockside Way, Chicago, IL",
      startDate: "2026-03-10",
      endDate: "2026-11-15",
      contractValue: 820000,
      status: "Active",
      description: "Structural concrete slab pour and MEP rough-in for multi-tenant retail plaza.",
      createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: `proj_${userId}_3`,
      userId,
      name: "Oakridge Medical Center Phase 1",
      clientId: `cli_${userId}_1`,
      location: "450 Health Blvd, Chicago, IL",
      startDate: "2026-01-05",
      endDate: "2026-04-20",
      contractValue: 290000,
      status: "Completed",
      description: "Cleanroom medical facility partitioning and specialized HVAC installation.",
      createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString()
    }
  ];

  const userInvoices: Invoice[] = [
    {
      id: `inv_${userId}_1`,
      userId,
      invoiceNumber: "INV-USER-101",
      projectId: `proj_${userId}_1`,
      clientId: `cli_${userId}_1`,
      issueDate: "2026-02-15",
      dueDate: "2026-03-15",
      status: "Paid",
      lineItems: [
        { description: "Initial Mobilization & Demolition", quantity: 1, unitPrice: 45000, amount: 45000 }
      ],
      subtotal: 45000,
      retainagePercent: 10,
      retainageAmount: 4500,
      total: 40500,
      paidAt: "2026-03-10T14:00:00.000Z",
      createdAt: "2026-02-15T10:00:00.000Z"
    },
    {
      id: `inv_${userId}_2`,
      userId,
      invoiceNumber: "INV-USER-102",
      projectId: `proj_${userId}_2`,
      clientId: `cli_${userId}_2`,
      issueDate: "2026-03-20",
      dueDate: "2026-04-20",
      status: "Sent",
      lineItems: [
        { description: "Concrete Foundation & Sub-grade Work", quantity: 1, unitPrice: 120000, amount: 120000 }
      ],
      subtotal: 120000,
      retainagePercent: 10,
      retainageAmount: 12000,
      total: 108000,
      createdAt: "2026-03-20T09:30:00.000Z"
    },
    {
      id: `inv_${userId}_3`,
      userId,
      invoiceNumber: "INV-USER-103",
      projectId: `proj_${userId}_3`,
      clientId: `cli_${userId}_1`,
      issueDate: "2026-01-20",
      dueDate: "2026-02-20",
      status: "Paid",
      lineItems: [
        { description: "HVAC Cleanroom Installation Complete", quantity: 1, unitPrice: 85000, amount: 85000 }
      ],
      subtotal: 85000,
      retainagePercent: 10,
      retainageAmount: 8500,
      total: 76500,
      paidAt: "2026-02-18T11:20:00.000Z",
      createdAt: "2026-01-20T11:00:00.000Z"
    }
  ];

  const userExpenses: Expense[] = [
    {
      id: `exp_${userId}_1`,
      userId,
      projectId: `proj_${userId}_1`,
      date: "2026-02-10",
      description: "Structural Steel Beams & Hardware",
      category: "Materials",
      amount: 18500,
      vendor: "Midwest Steel Fabricators",
      lienWaiverStatus: "Collected",
      createdAt: "2026-02-10T09:00:00.000Z"
    },
    {
      id: `exp_${userId}_2`,
      userId,
      projectId: `proj_${userId}_2`,
      date: "2026-03-15",
      description: "Architectural Drafting & Engineering Fee",
      category: "Subcontractor",
      amount: 6200,
      vendor: "Vance Design Group",
      lienWaiverStatus: "Pending",
      createdAt: "2026-03-15T14:30:00.000Z"
    },
    {
      id: `exp_${userId}_3`,
      userId,
      projectId: `proj_${userId}_3`,
      date: "2026-01-15",
      description: "Concrete Foundation Pump Rental",
      category: "Equipment",
      amount: 34000,
      vendor: "United Rentals Corp",
      lienWaiverStatus: "Collected",
      createdAt: "2026-01-15T08:00:00.000Z"
    }
  ];

  const userChangeOrders: ChangeOrder[] = [
    {
      id: `co_${userId}_1`,
      userId,
      projectId: `proj_${userId}_1`,
      changeOrderNumber: "CO-001",
      title: "Executive Conference Room Glass Partition Upgrade",
      description: "Owner requested double-pane acoustic glass walls with smart dimming.",
      amount: 28500,
      status: "Approved",
      date: "2026-02-20",
      createdAt: "2026-02-20T10:00:00.000Z"
    },
    {
      id: `co_${userId}_2`,
      userId,
      projectId: `proj_${userId}_2`,
      changeOrderNumber: "CO-001",
      title: "Sub-grade Soil Stabilization & Geotechnical Reinforcement",
      description: "Unforeseen clay layer required additional lime treatment and helical piers.",
      amount: 42000,
      status: "Approved",
      date: "2026-03-18",
      createdAt: "2026-03-18T11:30:00.000Z"
    },
    {
      id: `co_${userId}_3`,
      userId,
      projectId: `proj_${userId}_1`,
      changeOrderNumber: "CO-002",
      title: "Additional EV Charging Infrastructure in Basement Parking",
      description: "Installation of 4 extra 50A commercial charging stations.",
      amount: 15000,
      status: "Pending",
      date: "2026-03-25",
      createdAt: "2026-03-25T14:00:00.000Z"
    }
  ];

  const userMilestones: ProjectMilestone[] = [
    {
      id: `ms_${userId}_1`,
      userId,
      projectId: `proj_${userId}_1`,
      title: "Architectural Demolition & Mobilization",
      targetDate: "2026-02-15",
      completionPercent: 100,
      status: "Completed",
      notes: "Site cleared and initial safety containment passed inspection.",
      createdAt: "2026-02-01T08:00:00.000Z"
    },
    {
      id: `ms_${userId}_2`,
      userId,
      projectId: `proj_${userId}_1`,
      title: "Framing & MEP Rough-In",
      targetDate: "2026-04-30",
      completionPercent: 65,
      status: "In Progress",
      notes: "Electrical conduit running ahead of schedule.",
      createdAt: "2026-02-15T08:00:00.000Z"
    },
    {
      id: `ms_${userId}_3`,
      userId,
      projectId: `proj_${userId}_2`,
      title: "Concrete Slab Pour & Curing",
      targetDate: "2026-04-10",
      completionPercent: 80,
      status: "In Progress",
      notes: "Main slab pour complete; curing test results pending.",
      createdAt: "2026-03-10T08:00:00.000Z"
    }
  ];

  saveClients(userClients, userId);
  saveProjects(userProjects, userId);
  saveInvoices(userInvoices, userId);
  saveExpenses(userExpenses, userId);
  saveChangeOrders(userChangeOrders, userId);
  saveMilestones(userMilestones, userId);

  const userSettings: Settings = {
    userId,
    companyName: companyName,
    companyAddress: "500 Tower Blvd, Suite 1200, Chicago, IL 60611",
    companyPhone: "(312) 555-0844",
    companyEmail: user?.email || "billing@apexcommercial.com",
    taxId: "84-1234567",
    invoicePrefix: "INV-USER-",
    nextInvoiceNumber: 104,
    currency: "$"
  };
  saveSettings(userSettings, userId);
}

export function clearUserData(userId: string) {
  saveClients([], userId);
  saveProjects([], userId);
  saveInvoices([], userId);
  saveExpenses([], userId);
  saveChangeOrders([], userId);
  saveMilestones([], userId);

  const emptySettings: Settings = {
    userId,
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "",
    taxId: "",
    invoicePrefix: "INV-",
    nextInvoiceNumber: 1001,
    currency: "$"
  };
  saveSettings(emptySettings, userId);
}

// Initial Seed Function
export function seedInitialData(force = false) {
  ensureDataDir();

  const usersExist = fs.existsSync(USERS_FILE) && fs.readFileSync(USERS_FILE, 'utf-8').trim().length > 10;
  const initialUsers: UserRecord[] = [
    {
      id: "usr_admin_1",
      name: "System Administrator",
      email: "admin@buildledger.com",
      passwordHash: "admin123",
      role: "admin",
      company: "BuildLedger Construction Services Inc.",
      createdAt: "2026-01-01T00:00:00.000Z"
    },
    {
      id: "usr_user_1",
      name: "John Apex",
      email: "john@apexdev.com",
      passwordHash: "user123",
      role: "user",
      company: "Apex Commercial Developers",
      clientId: "cli_1",
      createdAt: "2026-01-10T09:00:00.000Z"
    },
    {
      id: "usr_user_2",
      name: "Sarah Summit",
      email: "sarah@summitres.com",
      passwordHash: "user123",
      role: "user",
      company: "Summit Residential Group",
      clientId: "cli_2",
      createdAt: "2026-01-15T10:30:00.000Z"
    }
  ];

  if (!usersExist || force) {
    writeJson(USERS_FILE, initialUsers);
  }

  const clientsExist = fs.existsSync(CLIENTS_FILE) && fs.readFileSync(CLIENTS_FILE, 'utf-8').trim().length > 10;

  if (clientsExist && !force) {
    return;
  }

  console.log("Seeding realistic construction data to JSON store...");

  const initialClients: Client[] = [
    {
      id: "cli_1",
      name: "John Apex",
      company: "Apex Commercial Developers",
      email: "john@apexdev.com",
      phone: "(312) 555-0101",
      address: "500 N Michigan Ave, Chicago, IL 60611",
      createdAt: "2026-01-10T09:00:00.000Z"
    },
    {
      id: "cli_2",
      name: "Sarah Summit",
      company: "Summit Residential Group",
      email: "sarah@summitres.com",
      phone: "(312) 555-0102",
      address: "1200 S Lake Shore Dr, Chicago, IL 60605",
      createdAt: "2026-01-15T10:30:00.000Z"
    },
    {
      id: "cli_3",
      name: "David Metro",
      company: "Metro Infrastructure Partners",
      email: "dmetro@metropowers.com",
      phone: "(312) 555-0103",
      address: "750 W Fulton Market, Chicago, IL 60607",
      createdAt: "2026-02-01T14:15:00.000Z"
    },
    {
      id: "cli_4",
      name: "Emily Chen",
      company: "Blueprint Properties",
      email: "echen@blueprintprop.com",
      phone: "(312) 555-0104",
      address: "333 N Green St, Chicago, IL 60607",
      createdAt: "2026-02-12T11:00:00.000Z"
    },
    {
      id: "cli_5",
      name: "Marcus Vance",
      company: "Urban Living Solutions",
      email: "mvance@urbanliving.com",
      phone: "(312) 555-0105",
      address: "100 E Grand Ave, Chicago, IL 60611",
      createdAt: "2026-03-01T08:45:00.000Z"
    }
  ];

  const initialProjects: Project[] = [
    {
      id: "proj_1",
      name: "Oakridge Commercial Center",
      clientId: "cli_1",
      location: "450 E Grand Ave, Chicago, IL",
      startDate: "2026-01-15",
      endDate: "2026-09-30",
      contractValue: 1450000,
      status: "Active",
      description: "Construction of a 3-story steel frame commercial retail & office plaza with underground parking.",
      createdAt: "2026-01-15T10:00:00.000Z"
    },
    {
      id: "proj_2",
      name: "Riverside Luxury Apartments",
      clientId: "cli_2",
      location: "880 S Wells St, Chicago, IL",
      startDate: "2026-02-01",
      endDate: "2026-12-15",
      contractValue: 2800000,
      status: "Active",
      description: "Ground-up multi-family residential building with 48 premium units and rooftop terrace.",
      createdAt: "2026-02-01T11:30:00.000Z"
    },
    {
      id: "proj_3",
      name: "Downtown Transit Hub Expansion",
      clientId: "cli_3",
      location: "200 S Canal St, Chicago, IL",
      startDate: "2026-02-10",
      endDate: "2027-03-31",
      contractValue: 3200000,
      status: "Active",
      description: "Heavy civil foundation work, passenger platform expansion, and structural reinforcement.",
      createdAt: "2026-02-10T15:00:00.000Z"
    },
    {
      id: "proj_4",
      name: "Westside Industrial Park",
      clientId: "cli_4",
      location: "1500 S Western Ave, Chicago, IL",
      startDate: "2026-03-01",
      endDate: "2026-10-15",
      contractValue: 980000,
      status: "Active",
      description: "Tilt-up concrete warehouse facility with high bay loading docks and office mezzanine.",
      createdAt: "2026-03-01T09:20:00.000Z"
    },
    {
      id: "proj_5",
      name: "Highland Park Modern Villa",
      clientId: "cli_2",
      location: "720 Elm Place, Highland Park, IL",
      startDate: "2026-03-15",
      endDate: "2026-11-30",
      contractValue: 750000,
      status: "Active",
      description: "Custom luxury architectural residence with architectural concrete, timber framing, and glass facade.",
      createdAt: "2026-03-15T14:00:00.000Z"
    },
    {
      id: "proj_6",
      name: "Harbor View Heights Plaza",
      clientId: "cli_5",
      location: "300 S Lake Shore Dr, Chicago, IL",
      startDate: "2025-08-01",
      endDate: "2026-04-30",
      contractValue: 1200000,
      status: "Completed",
      description: "Complete exterior plaza renovation including pavers, retaining walls, lighting, and water feature.",
      createdAt: "2025-08-01T08:00:00.000Z"
    },
    {
      id: "proj_7",
      name: "Cedar Ridge Townhomes",
      clientId: "cli_2",
      location: "1400 W Armitage Ave, Chicago, IL",
      startDate: "2025-09-01",
      endDate: "2026-05-15",
      contractValue: 850000,
      status: "Completed",
      description: "6-unit wood frame townhome development with attached garages.",
      createdAt: "2025-09-01T09:30:00.000Z"
    },
    {
      id: "proj_8",
      name: "Apex Corporate Tower Renovation",
      clientId: "cli_1",
      location: "100 N LaSalle St, Chicago, IL",
      startDate: "2026-04-01",
      endDate: "2026-11-15",
      contractValue: 1900000,
      status: "On Hold",
      description: "Interior core and shell modernization for 5 floors of corporate office space.",
      createdAt: "2026-04-01T13:00:00.000Z"
    }
  ];

  const initialInvoices: Invoice[] = [
    {
      id: "inv_1001",
      invoiceNumber: "INV-2026-1001",
      projectId: "proj_1",
      clientId: "cli_1",
      issueDate: "2026-02-01",
      dueDate: "2026-03-03",
      status: "Paid",
      lineItems: [
        { description: "Phase 1 - Demolition and Excavation Mobilization", quantity: 1, unitPrice: 120000, amount: 120000 },
        { description: "Site Utilities & Deep Foundation Piling", quantity: 1, unitPrice: 180000, amount: 180000 }
      ],
      subtotal: 300000,
      retainagePercent: 10,
      retainageAmount: 30000,
      total: 270000,
      notes: "Payment received via wire transfer.",
      paidAt: "2026-02-28T14:20:00.000Z",
      createdAt: "2026-02-01T10:00:00.000Z"
    },
    {
      id: "inv_1002",
      invoiceNumber: "INV-2026-1002",
      projectId: "proj_1",
      clientId: "cli_1",
      issueDate: "2026-03-01",
      dueDate: "2026-03-31",
      status: "Paid",
      lineItems: [
        { description: "Phase 2 - Concrete Foundation Slab & Footings", quantity: 1, unitPrice: 250000, amount: 250000 },
        { description: "Structural Steel Erection - Level 1", quantity: 1, unitPrice: 150000, amount: 150000 }
      ],
      subtotal: 400000,
      retainagePercent: 10,
      retainageAmount: 40000,
      total: 360000,
      notes: "Progress Draw #2",
      paidAt: "2026-03-25T11:15:00.000Z",
      createdAt: "2026-03-01T11:00:00.000Z"
    },
    {
      id: "inv_1003",
      invoiceNumber: "INV-2026-1003",
      projectId: "proj_2",
      clientId: "cli_2",
      issueDate: "2026-02-15",
      dueDate: "2026-03-17",
      status: "Paid",
      lineItems: [
        { description: "Site Preparation & Foundation Earthwork", quantity: 1, unitPrice: 350000, amount: 350000 },
        { description: "Underground Plumbing Rough-In", quantity: 1, unitPrice: 100000, amount: 100000 }
      ],
      subtotal: 450000,
      retainagePercent: 10,
      retainageAmount: 45000,
      total: 405000,
      notes: "Draw #1 Approved by Lender",
      paidAt: "2026-03-10T16:00:00.000Z",
      createdAt: "2026-02-15T09:30:00.000Z"
    },
    {
      id: "inv_1004",
      invoiceNumber: "INV-2026-1004",
      projectId: "proj_2",
      clientId: "cli_2",
      issueDate: "2026-03-20",
      dueDate: "2026-04-19",
      status: "Paid",
      lineItems: [
        { description: "Post-Tension Slab Pour - Floors 1 & 2", quantity: 1, unitPrice: 500000, amount: 500000 },
        { description: "Masonry Stairwell Shafts", quantity: 1, unitPrice: 120000, amount: 120000 }
      ],
      subtotal: 620000,
      retainagePercent: 10,
      retainageAmount: 62000,
      total: 558000,
      notes: "Progress Draw #2",
      paidAt: "2026-04-12T10:45:00.000Z",
      createdAt: "2026-03-20T14:00:00.000Z"
    },
    {
      id: "inv_1005",
      invoiceNumber: "INV-2026-1005",
      projectId: "proj_3",
      clientId: "cli_3",
      issueDate: "2026-03-05",
      dueDate: "2026-04-04",
      status: "Paid",
      lineItems: [
        { description: "Phase 1 - Heavy Caisson Drilling & Shoring Wall", quantity: 1, unitPrice: 600000, amount: 600000 }
      ],
      subtotal: 600000,
      retainagePercent: 5,
      retainageAmount: 30000,
      total: 570000,
      paidAt: "2026-03-30T15:30:00.000Z",
      createdAt: "2026-03-05T08:30:00.000Z"
    },
    {
      id: "inv_1006",
      invoiceNumber: "INV-2026-1006",
      projectId: "proj_3",
      clientId: "cli_3",
      issueDate: "2026-04-05",
      dueDate: "2026-05-05",
      status: "Overdue",
      lineItems: [
        { description: "Phase 2 - Track Bed Concrete & Underpinning", quantity: 1, unitPrice: 550000, amount: 550000 },
        { description: "Structural Deck Fabrication", quantity: 1, unitPrice: 250000, amount: 250000 }
      ],
      subtotal: 800000,
      retainagePercent: 5,
      retainageAmount: 40000,
      total: 760000,
      notes: "Followed up with Accounts Payable on 2026-05-15. Pending municipal approval signoff.",
      createdAt: "2026-04-05T09:00:00.000Z"
    },
    {
      id: "inv_1007",
      invoiceNumber: "INV-2026-1007",
      projectId: "proj_4",
      clientId: "cli_4",
      issueDate: "2026-04-01",
      dueDate: "2026-05-01",
      status: "Paid",
      lineItems: [
        { description: "Site Grading & Pad Preparation", quantity: 1, unitPrice: 150000, amount: 150000 },
        { description: "Tilt-Up Wall Panel Casting", quantity: 1, unitPrice: 180000, amount: 180000 }
      ],
      subtotal: 330000,
      retainagePercent: 10,
      retainageAmount: 33000,
      total: 297000,
      paidAt: "2026-04-28T09:10:00.000Z",
      createdAt: "2026-04-01T10:30:00.000Z"
    },
    {
      id: "inv_1008",
      invoiceNumber: "INV-2026-1008",
      projectId: "proj_4",
      clientId: "cli_4",
      issueDate: "2026-05-01",
      dueDate: "2026-05-31",
      status: "Sent",
      lineItems: [
        { description: "Panel Erection & Steel Roof Joists", quantity: 1, unitPrice: 220000, amount: 220000 },
        { description: "Slab-on-Grade Concrete Pour", quantity: 1, unitPrice: 140000, amount: 140000 }
      ],
      subtotal: 360000,
      retainagePercent: 10,
      retainageAmount: 36000,
      total: 324000,
      notes: "Invoice sent to billing@blueprintprop.com",
      createdAt: "2026-05-01T11:00:00.000Z"
    },
    {
      id: "inv_1009",
      invoiceNumber: "INV-2026-1009",
      projectId: "proj_5",
      clientId: "cli_2",
      issueDate: "2026-04-15",
      dueDate: "2026-05-15",
      status: "Paid",
      lineItems: [
        { description: "Architectural Excavation & Retaining Walls", quantity: 1, unitPrice: 120000, amount: 120000 },
        { description: "Custom Concrete Basemat", quantity: 1, unitPrice: 90000, amount: 90000 }
      ],
      subtotal: 210000,
      retainagePercent: 10,
      retainageAmount: 21000,
      total: 189000,
      paidAt: "2026-05-10T12:00:00.000Z",
      createdAt: "2026-04-15T14:30:00.000Z"
    },
    {
      id: "inv_1010",
      invoiceNumber: "INV-2026-1010",
      projectId: "proj_5",
      clientId: "cli_2",
      issueDate: "2026-05-15",
      dueDate: "2026-06-14",
      status: "Sent",
      lineItems: [
        { description: "Timber Superstructure Framing", quantity: 1, unitPrice: 180000, amount: 180000 },
        { description: "Roof Truss Installation & Decking", quantity: 1, unitPrice: 70000, amount: 70000 }
      ],
      subtotal: 250000,
      retainagePercent: 10,
      retainageAmount: 25000,
      total: 225000,
      createdAt: "2026-05-15T15:00:00.000Z"
    },
    {
      id: "inv_1011",
      invoiceNumber: "INV-2026-1011",
      projectId: "proj_6",
      clientId: "cli_5",
      issueDate: "2026-04-01",
      dueDate: "2026-04-30",
      status: "Paid",
      lineItems: [
        { description: "Final Retainage Release & Closeout", quantity: 1, unitPrice: 120000, amount: 120000 }
      ],
      subtotal: 120000,
      retainagePercent: 0,
      retainageAmount: 0,
      total: 120000,
      paidAt: "2026-04-25T16:45:00.000Z",
      createdAt: "2026-04-01T09:00:00.000Z"
    },
    {
      id: "inv_1012",
      invoiceNumber: "INV-2026-1012",
      projectId: "proj_7",
      clientId: "cli_2",
      issueDate: "2026-05-01",
      dueDate: "2026-05-31",
      status: "Paid",
      lineItems: [
        { description: "Townhomes Final Inspection & Certificate of Occupancy Billing", quantity: 1, unitPrice: 180000, amount: 180000 }
      ],
      subtotal: 180000,
      retainagePercent: 0,
      retainageAmount: 0,
      total: 180000,
      paidAt: "2026-05-20T10:15:00.000Z",
      createdAt: "2026-05-01T09:30:00.000Z"
    },
    {
      id: "inv_1013",
      invoiceNumber: "INV-2026-1013",
      projectId: "proj_1",
      clientId: "cli_1",
      issueDate: "2026-05-20",
      dueDate: "2026-06-19",
      status: "Sent",
      lineItems: [
        { description: "Structural Steel Frame Completion - Floor 3 & Roof", quantity: 1, unitPrice: 280000, amount: 280000 },
        { description: "Exterior Curtain Wall Framing", quantity: 1, unitPrice: 140000, amount: 140000 }
      ],
      subtotal: 420000,
      retainagePercent: 10,
      retainageAmount: 42000,
      total: 378000,
      createdAt: "2026-05-20T11:00:00.000Z"
    },
    {
      id: "inv_1014",
      invoiceNumber: "INV-2026-1014",
      projectId: "proj_2",
      clientId: "cli_2",
      issueDate: "2026-06-01",
      dueDate: "2026-07-01",
      status: "Sent",
      lineItems: [
        { description: "Framing & Sheathing - Floors 1-4", quantity: 1, unitPrice: 420000, amount: 420000 },
        { description: "MEP Rough-in Subcontractor Mobilization", quantity: 1, unitPrice: 180000, amount: 180000 }
      ],
      subtotal: 600000,
      retainagePercent: 10,
      retainageAmount: 60000,
      total: 540000,
      createdAt: "2026-06-01T08:30:00.000Z"
    },
    {
      id: "inv_1015",
      invoiceNumber: "INV-2026-1015",
      projectId: "proj_8",
      clientId: "cli_1",
      issueDate: "2026-06-05",
      dueDate: "2026-07-05",
      status: "Draft",
      lineItems: [
        { description: "Mobilization & Engineering Survey Deposit", quantity: 1, unitPrice: 95000, amount: 95000 }
      ],
      subtotal: 95000,
      retainagePercent: 10,
      retainageAmount: 9500,
      total: 85500,
      notes: "Draft prepared, awaiting owner sign-off on change order #1.",
      createdAt: "2026-06-05T13:00:00.000Z"
    }
  ];

  const initialExpenses: Expense[] = [
    // Oakridge Commercial Center (proj_1)
    { id: "exp_1", projectId: "proj_1", date: "2026-01-20", description: "Heavy Excavator & Bulldozer Rental", category: "Equipment", amount: 28500, vendor: "CAT Rental Store", createdAt: "2026-01-20T10:00:00.000Z" },
    { id: "exp_2", projectId: "proj_1", date: "2026-01-28", description: "Site Excavation & Hauling Labor", category: "Labor", amount: 45000, vendor: "Midwest Skilled Trades", createdAt: "2026-01-28T11:00:00.000Z" },
    { id: "exp_3", projectId: "proj_1", date: "2026-02-10", description: "Ready-Mix Concrete Foundation Batch", category: "Materials", amount: 82000, vendor: "Prairie Material Concrete", createdAt: "2026-02-10T14:00:00.000Z" },
    { id: "exp_4", projectId: "proj_1", date: "2026-02-25", description: "Rebar & Structural Steel Beams", category: "Materials", amount: 115000, vendor: "Nucor Steel Supply", createdAt: "2026-02-25T09:00:00.000Z" },
    { id: "exp_5", projectId: "proj_1", date: "2026-03-12", description: "Steel Fabrication & Erection Labor", category: "Subcontractor", amount: 98000, vendor: "Ironclad Steel Erection Co.", createdAt: "2026-03-12T15:30:00.000Z" },
    { id: "exp_6", projectId: "proj_1", date: "2026-04-18", description: "Site Security & Surveying Services", category: "Other", amount: 12500, vendor: "Apex Security & Surveying", createdAt: "2026-04-18T08:00:00.000Z" },

    // Riverside Luxury Apartments (proj_2)
    { id: "exp_7", projectId: "proj_2", date: "2026-02-05", description: "Tower Crane Delivery & Setup", category: "Equipment", amount: 55000, vendor: "Lampson Crane Services", createdAt: "2026-02-05T08:30:00.000Z" },
    { id: "exp_8", projectId: "proj_2", date: "2026-02-18", description: "Underground Plumbing Subcontractor", category: "Subcontractor", amount: 78000, vendor: "Apex Plumbing Solutions", createdAt: "2026-02-18T10:00:00.000Z" },
    { id: "exp_9", projectId: "proj_2", date: "2026-03-05", description: "Concrete Formwork & Shoring Lumber", category: "Materials", amount: 135000, vendor: "Universal Forest Products", createdAt: "2026-03-05T13:00:00.000Z" },
    { id: "exp_10", projectId: "proj_2", date: "2026-03-22", description: "Concrete Pumping Labor & Equipment", category: "Labor", amount: 89000, vendor: "Central Concrete Pumping", createdAt: "2026-03-22T16:00:00.000Z" },
    { id: "exp_11", projectId: "proj_2", date: "2026-04-10", description: "Structural Framing Timber & Hardware", category: "Materials", amount: 165000, vendor: "Lumbermen Supply Co.", createdAt: "2026-04-10T11:00:00.000Z" },
    { id: "exp_12", projectId: "proj_2", date: "2026-05-02", description: "Electrical Rough-In Progress Deposit", category: "Subcontractor", amount: 110000, vendor: "Volt Electric Subcontractors", createdAt: "2026-05-02T09:45:00.000Z" },

    // Downtown Transit Hub (proj_3)
    { id: "exp_13", projectId: "proj_3", date: "2026-02-15", description: "Heavy Caisson Rig Rental", category: "Equipment", amount: 92000, vendor: "Geotechnical Rigging Corp", createdAt: "2026-02-15T09:00:00.000Z" },
    { id: "exp_14", projectId: "proj_3", date: "2026-03-01", description: "High-Strength Structural Steel Pillars", category: "Materials", amount: 240000, vendor: "ArcelorMittal Steel", createdAt: "2026-03-01T14:00:00.000Z" },
    { id: "exp_15", projectId: "proj_3", date: "2026-03-20", description: "Underpinning & Shoring Union Crew Labor", category: "Labor", amount: 185000, vendor: "Local 150 Operators Union", createdAt: "2026-03-20T10:00:00.000Z" },
    { id: "exp_16", projectId: "proj_3", date: "2026-04-12", description: "Track Bed Concrete Batching", category: "Materials", amount: 142000, vendor: "Ozinga Ready Mix Concrete", createdAt: "2026-04-12T13:15:00.000Z" },

    // Westside Industrial Park (proj_4)
    { id: "exp_17", projectId: "proj_4", date: "2026-03-08", description: "Site Grading & Laser Leveling", category: "Equipment", amount: 32000, vendor: "Precision Earthworks", createdAt: "2026-03-08T08:00:00.000Z" },
    { id: "exp_18", projectId: "proj_4", date: "2026-03-25", description: "Tilt-Up Wall Concrete & Curing Agents", category: "Materials", amount: 98000, vendor: "Meadow Burke Construction Supplies", createdAt: "2026-03-25T11:30:00.000Z" },
    { id: "exp_19", projectId: "proj_4", date: "2026-04-15", description: "Crane Panel Erection Subcontractor", category: "Subcontractor", amount: 76000, vendor: "Midwest Rigging & Crane", createdAt: "2026-04-15T15:00:00.000Z" },
    { id: "exp_20", projectId: "proj_4", date: "2026-05-10", description: "Steel Roof Joists & Metal Decking", category: "Materials", amount: 105000, vendor: "Vulcraft Steel Joists", createdAt: "2026-05-10T10:20:00.000Z" },

    // Highland Park Modern Villa (proj_5)
    { id: "exp_21", projectId: "proj_5", date: "2026-03-20", description: "Architectural Concrete Formwork", category: "Materials", amount: 48000, vendor: "Doka Formwork Systems", createdAt: "2026-03-20T09:00:00.000Z" },
    { id: "exp_22", projectId: "proj_5", date: "2026-04-05", description: "Custom Glulam Timber Beams", category: "Materials", amount: 84000, vendor: "TimberLab Engineered Wood", createdAt: "2026-04-05T14:00:00.000Z" },
    { id: "exp_23", projectId: "proj_5", date: "2026-04-22", description: "Master Carpentry Crew Labor", category: "Labor", amount: 62000, vendor: "Artisan Craft Builders", createdAt: "2026-04-22T11:00:00.000Z" },

    // Harbor View Heights Plaza (proj_6)
    { id: "exp_24", projectId: "proj_6", date: "2026-03-10", description: "Granite Pavers & Retaining Wall Blocks", category: "Materials", amount: 78000, vendor: "Unilock Hardscape Products", createdAt: "2026-03-10T16:00:00.000Z" },

    // Cedar Ridge Townhomes (proj_7)
    { id: "exp_25", projectId: "proj_7", date: "2026-04-02", description: "Final Landscaping & Asphalt Paving", category: "Subcontractor", amount: 54000, vendor: "Greenery Paving & Asphalt", createdAt: "2026-04-02T10:00:00.000Z" }
  ];

  writeJson(CLIENTS_FILE, initialClients);
  writeJson(PROJECTS_FILE, initialProjects);
  writeJson(INVOICES_FILE, initialInvoices);
  writeJson(EXPENSES_FILE, initialExpenses);
  writeJson(SETTINGS_FILE, defaultSettings);

  console.log("Seeding complete! 5 clients, 8 projects, 15 invoices, 25 expenses created.");
}
