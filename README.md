# Lightweight HRIS System

A modern, web-based Human Resource Information System (HRIS)

**Live Demo**: [https://echelon-take-home-beta.vercel.app](https://echelon-take-home-beta.vercel.app)

**Development Time**: ~8 hours

---

## Features Implemented

### Core Features

- **Employee Directory** ✅
  - Store and display employee records (Name, Title, Department, Manager, Contact, Hire Date, Salary, Status)
  - Advanced search and filter capabilities
  - Sortable columns and pagination
  - Detailed employee profiles with reporting relationships

- **Team Directory** ✅ *(Stretch Goal)*
  - Display team records with hierarchy (Name, Members, Lead, Parent Team)
  - Search and filter teams and sub-teams
  - Assign employees to teams

- **Search Page** ✅
  - Unified search across employees and teams
  - Real-time search with relevance scoring
  - Type-ahead suggestions
  - Filter by entity type (employees/teams/all)

- **Organizational Chart** ✅
  - Auto-generated from reporting relationships
  - Interactive expand/collapse functionality
  - Click nodes to view employee details
  - Pan and zoom controls
  - Minimap for navigation
  - **Note**: Due to time constraints, used ReactFlow library for visualization. As a result:
    - Drag-and-drop editing not implemented *(Stretch Goal not completed)*
    - Export as PDF/PNG not available (only CSV export supported)

- **Editing & Management** ✅
  - Add/edit/delete employees
  - Bulk import from CSV/Excel with validation (test files provided: `test-import-employee.csv` and `test-import-employee.xlsx`)
  - Change history tracking with audit logs
  - Team member management
  - **RBAC** ✅ *(Stretch Goal)*: Role-based access control without authentication system

- **Data Export** ✅
  - Export employee directory to CSV, Excel, PDF
  - Export team directory to CSV, Excel, PDF
  - Export org chart to CSV (hierarchical format)
  - Customizable export filters (respects current view filters)
  - **Note**: Org chart PDF/PNG export not available due to library constraints

---

## Technical Requirements

### Data Models & Schema

**Design Philosophy**: The schema separates concerns into distinct models while maintaining flexibility for both hierarchical and matrix organizational structures. All tables use UUID primary keys for distributed scalability and auto-updating timestamps for audit trails.

#### **1. `users` - Authentication & RBAC**
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'hr', 'manager', 'employee')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Indexes**: `email`, `role`
**Purpose**: Authentication layer separate from employee data
**Why**: Enables flexible access control; employees can exist without user accounts (contractors, former employees) and users can exist without being employees (service accounts)

#### **2. `employees` - Core HR Data**
```sql
CREATE TABLE employees (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    first_name   VARCHAR(100) NOT NULL,
    last_name    VARCHAR(100) NOT NULL,
    email        VARCHAR(255) UNIQUE NOT NULL,
    title        VARCHAR(150) NOT NULL,
    department   VARCHAR(100) NOT NULL,
    manager_id   UUID REFERENCES employees(id) ON DELETE SET NULL,  -- Self-referential
    phone        VARCHAR(20),
    hire_date    DATE NOT NULL,
    salary       DECIMAL(12, 2),
    status       VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Indexes**: `manager_id`, `department`, `status`, `user_id`, `email`
**Purpose**: Single source of truth for employee information
**Why**: Self-referential `manager_id` enables unlimited-depth org charts; `ON DELETE SET NULL` preserves data integrity when managers leave

#### **3. `teams` - Matrix Organization**
```sql
CREATE TABLE teams (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    parent_team_id  UUID REFERENCES teams(id) ON DELETE SET NULL,  -- Self-referential
    team_lead_id    UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Indexes**: `parent_team_id`, `team_lead_id`
**Purpose**: Hierarchical team structure supporting parent/sub-teams
**Why**: Allows teams to have sub-teams (e.g., Engineering → Backend → API Team) while maintaining flexibility

#### **4. `team_members` - Many-to-Many Junction**
```sql
CREATE TABLE team_members (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id      UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    employee_id  UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    joined_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, employee_id)
);
```
**Indexes**: `team_id`, `employee_id`
**Constraints**: Unique constraint prevents duplicate memberships
**Purpose**: Enables employees to belong to multiple teams simultaneously
**Why**: Reflects real-world matrix organizations where people report to one manager but work across multiple teams

#### **5. `audit_logs` - Change Tracking**
```sql
CREATE TABLE audit_logs (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    entity_type  VARCHAR(50) NOT NULL,           -- 'employee', 'team', etc.
    entity_id    UUID NOT NULL,                  -- ID of modified entity
    action       VARCHAR(20) NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    changes      JSONB,                          -- Before/after state
    ip_address   VARCHAR(45),
    timestamp    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Indexes**: `(entity_type, entity_id)`, `user_id`, `timestamp DESC`
**Purpose**: Complete audit trail of all system changes
**Why**: Generic design (entity_type + entity_id) tracks any model without schema changes; JSONB stores flexible before/after state; composite index enables efficient "show all changes to employee X" queries

---

### Tech Stack

**Frontend**
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS v4
- Radix UI Components
- ReactFlow (Org Chart)
- Shadcn/ui (Component Library)

**Backend**
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Neon Serverless)

**Deployment**
- Platform: Vercel
- Database: Neon (PostgreSQL Free Tier)
- Live URL: [https://echelon-take-home-beta.vercel.app](https://echelon-take-home-beta.vercel.app)

---

## Role-Based Access Control (RBAC)

The system implements a demo RBAC system with four roles. Switch between roles using the account switcher in the sidebar.

### Demo Accounts

#### **Admin (Sarah Chen - CEO)**
Full system access with all permissions:
- ✅ View all employees and teams
- ✅ Create, edit, and delete employees
- ✅ Import employees (CSV/Excel)
- ✅ Export data (CSV/Excel/PDF)
- ✅ View salary information
- ✅ Edit employees in any department
- ✅ Manage teams and team members
- ✅ View audit logs

#### **HR (Emily Watson - CPO)**
Comprehensive employee management:
- ✅ View all employees and teams
- ✅ Create and edit all employees
- ✅ Import employees (CSV/Excel)
- ✅ Export data (CSV/Excel/PDF)
- ✅ View salary information
- ❌ Delete employees
- ❌ Create/edit teams

#### **Manager (Michael Rodriguez - CTO)**
Department-level access:
- ✅ View all employees and teams
- ✅ Edit employees in their own department only
- ✅ View salary information (read-only)
- ❌ Create or delete employees
- ❌ Import employees
- ❌ Export data
- ❌ Edit employees in other departments
- ❌ Manage teams

#### **Employee (David Kim - CFO)**
Read-only access:
- ✅ View all employees and teams
- ✅ View org chart
- ✅ Search employees and teams
- ❌ Edit any data
- ❌ Export data
- ❌ View salary information
- ❌ Import employees
- ❌ Manage teams

---

## Project Structure

```
echelon-take-home/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   ├── employees/            # Employee pages
│   ├── teams/                # Team pages
│   ├── org-chart/            # Org chart page
│   └── search/               # Search page
├── components/               # React components
│   ├── ui/                   # Base UI components (Shadcn)
│   ├── org-chart/            # Org chart components
│   ├── employee-detail-modal.tsx
│   ├── team-detail-modal.tsx
│   ├── account-switcher.tsx
│   └── ...
├── contexts/                 # React contexts
│   └── RoleContext.tsx       # RBAC context
├── lib/                      # Utility functions
│   ├── prisma.ts             # Prisma client
│   ├── permissions.ts        # RBAC logic
│   ├── export-utils.ts       # Export functions
│   └── ...
├── prisma/                   # Database schema
│   └── schema.prisma
└── public/                   # Static assets
```