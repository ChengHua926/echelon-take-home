HRIS Database Schema - First Principles Explanation
🎯 The Core Problem We're Solving
Question: How do we represent an organization's structure in a database?
Answer: We need to track:

Who works here? (Employees)
Who reports to whom? (Reporting relationships)
Who can access the system? (Authentication)
What teams exist? (Team structure)
What changed and when? (Audit trail)


📊 The Five Tables (From Simplest to Most Complex)
1. USERS - The Authentication Layer
Purpose: Control who can LOG IN to the HRIS system
Why separate from employees?

Not every employee needs system access (e.g., contractors, interns)
Not every user might be an employee (e.g., external auditors - future proofing)
Security principle: Separate concerns

Key Fields:

email + password_hash = Login credentials
role = What they can do (admin, hr, manager, employee)

Real-world example:

Sarah Chen (CEO) has a user account with role="admin"
A warehouse worker might not have a user account at all
An external consultant might have role="viewer" but no employee record


2. EMPLOYEES - The HR Data
Purpose: Store EVERYONE in the company, regardless of system access
Why this is the most important table:

This is the org chart data
Every employee must be here, even if they don't use the system
Contains all HR info (salary, hire date, title, etc.)

The Magic Field: manager_id
sqlmanager_id UUID REFERENCES employees(id)
This is a self-referential foreign key - it points to ANOTHER employee!
How it works:
Sarah Chen: manager_id = NULL (she's the CEO, no boss)
Michael Rodriguez: manager_id = Sarah's ID (he reports to Sarah)
Alex Thompson: manager_id = Michael's ID (he reports to Michael)
James Wilson: manager_id = Alex's ID (he reports to Alex)
This single field creates the ENTIRE org chart tree structure!
Key Design Decisions:

user_id is OPTIONAL (nullable) - employees don't need login access
status field for soft deletes (never truly delete employees for audit purposes)
salary is here (sensitive data, RBAC will control who sees it)


3. AUDIT_LOGS - The Time Machine
Purpose: Track every change made in the system
Why we need this:

Compliance (who changed salaries?)
Debugging (why is this employee's data wrong?)
Security (detect unauthorized changes)

The JSONB Magic:
json{
  "title": {
    "old": "Software Engineer",
    "new": "Senior Software Engineer"
  },
  "salary": {
    "old": 130000,
    "new": 160000
  }
}
JSONB lets us store flexible change data without creating complex schemas.
Key Fields:

entity_type + entity_id = What was changed? (polymorphic - can point to any table)
action = create/update/delete
changes = What exactly changed?
user_id = Who made the change?


4. TEAMS - The Matrix Organization (Stretch Feature)
Purpose: Group employees into teams (which may be different from reporting structure)
Why teams are different from departments:

Department (in employees table) = Fixed organizational structure

Example: "Engineering", "Sales", "HR"


Teams = Flexible, project-based, can cross departments

Example: "Mobile App Team" might include designers (Marketing) + engineers (Engineering)



Self-Referential Team Hierarchy:
sqlparent_team_id UUID REFERENCES teams(id)
Example:
Engineering (parent_team_id = NULL)
  ├── Frontend Team (parent_team_id = Engineering ID)
  ├── Backend Team (parent_team_id = Engineering ID)
  └── DevOps Team (parent_team_id = Engineering ID)
The team_lead_id:

Points to an employee who "owns" the team
Different from manager_id (team lead ≠ reporting manager)


5. TEAM_MEMBERS - The Many-to-Many Bridge
Purpose: Connect employees to teams (employees can be on multiple teams)
Why we need a separate table:

One-to-Many would fail: Can't store multiple teams in employees table
Many-to-Many requires a junction table

How it works:
Alex Thompson is on:
- Frontend Team (via team_members)
- Mobile App Team (via team_members)

Frontend Team has members:
- Alex Thompson (via team_members)
- James Wilson (via team_members)
- Sophia Anderson (via team_members)
The UNIQUE constraint:
sqlUNIQUE(team_id, employee_id)
Prevents adding the same person to the same team twice.

🔗 Relationships Visualized
The Flow of Data
LOGIN FLOW:
User enters email + password
  ↓
USERS table: Verify credentials
  ↓
Check 'role' field
  ↓
Load linked EMPLOYEES record (via user_id)
  ↓
Show appropriate UI based on role


ORG CHART FLOW:
Start with CEO (manager_id = NULL)
  ↓
Find all employees where manager_id = CEO's ID
  ↓
For each of those, find their direct reports
  ↓
Recursively build tree (this is a recursive CTE query)


TEAM DIRECTORY FLOW:
User searches for "Frontend Team"
  ↓
TEAMS table: Find team record
  ↓
TEAM_MEMBERS: Find all members
  ↓
Join with EMPLOYEES to get full details

🎨 Key Design Patterns Explained
1. Self-Referential Relationships
What it is: A table that references itself
Used for:

employees.manager_id → employees.id (org chart)
teams.parent_team_id → teams.id (team hierarchy)

Why it's powerful: Represents infinite-depth trees with a single foreign key
2. Soft Deletes
What it is: Never actually DELETE rows, just mark them inactive
Used for:

employees.status = 'terminated' instead of DELETE FROM employees

Why: Maintain referential integrity, audit history, and prevent data loss
3. Polymorphic Relationships
What it is: A relationship that can point to multiple table types
Used for:

audit_logs tracks changes to employees, teams, users, etc.
entity_type + entity_id combo identifies what changed

4. JSONB for Flexibility
What it is: Store structured JSON data in a column
Used for:

audit_logs.changes - each change has different fields
No need to create complex schemas for every possible change type

5. Indexes for Performance
Why we added indexes:
sqlCREATE INDEX idx_employees_manager ON employees(manager_id);
Without this index:

Building org chart would require FULL TABLE SCAN (slow!)
With index: Database can quickly find "all employees where manager_id = X"