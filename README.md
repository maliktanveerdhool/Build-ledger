# BuildLedger - Construction Accounting & Billing SaaS MVP

**BuildLedger** is a full-stack SaaS MVP for construction accounting, job costing, progress billing, and retainage management.

---

## Stack & Architecture

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, React Router v6, Axios, react-hook-form, zod, date-fns, Recharts, Lucide React, Sonner.
- **Backend**: Node.js, Express, TypeScript, `fs` module for atomic JSON storage.
- **Data Persistence**: Stored entirely in JSON files under `/data` (no SQL/MongoDB database or localStorage).

---

## Database & Data Storage (`/data`)

All data is dynamic, fully persistent, and fetched via RESTful API endpoints.
The backend checks for the existence of the `/data` directory on initial boot and populates realistic initial construction seed data (5 clients, 8 projects, 15 invoices, 25 expenses):

- `data/clients.json`: Client profiles (commercial & residential developers).
- `data/projects.json`: Construction projects, contract values, dates, and locations.
- `data/invoices.json`: Progress billing invoices with retainage % and schedule of values line items.
- `data/expenses.json`: Categorized job site costs (Labor, Materials, Equipment, Subcontractor, Other).
- `data/settings.json`: Company profile, tax ID, and invoice auto-numbering prefixes.

---

## API Routes (`/api`)

### Clients
- `GET    /api/clients` - List all clients
- `GET    /api/clients/:id` - Client details
- `POST   /api/clients` - Create new client
- `PUT    /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Projects & Job Costing
- `GET    /api/projects` - List projects with brief job costing summaries
- `GET    /api/projects/:id` - Detailed job costing (Contract Value, Actual Expenses, Retainage, Net Profit, Category Breakdown)
- `POST   /api/projects` - Create project
- `PUT    /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Progress Invoices
- `GET    /api/invoices` - List invoices
- `GET    /api/invoices/:id` - Invoice detail & schedule of values
- `POST   /api/invoices` - Create progress invoice (calculates retainage & updates sequence #)
- `PUT    /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `PATCH  /api/invoices/:id/status` - Update invoice status (e.g., Mark as Paid)

### Expenses
- `GET    /api/expenses` - List expenses
- `GET    /api/expenses/:id` - Expense detail
- `POST   /api/expenses` - Log job site expense
- `PUT    /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Settings & Dashboard
- `GET    /api/settings` - Company settings
- `PUT    /api/settings` - Update company settings
- `POST   /api/settings/reset` - Reset JSON files to initial seed data
- `GET    /api/dashboard` - Executive KPI metrics & monthly financial charts

---

## How to Run

### Development
```bash
npm run dev
```
Starts Express backend server integrated with Vite SPA middleware on port 3000 (`http://localhost:3000`).

### Production Build & Launch
```bash
npm run build
npm start
```
Bundles React static assets into `dist/` and compiles Express server into CommonJS (`dist/server.cjs`).
