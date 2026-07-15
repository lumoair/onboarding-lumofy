# Lumofy Employee Onboarding Management MVP Spec

## Objective

Build a centralized onboarding control center inside Lumofy so HR, managers, IT, buddies, and employees can coordinate pre-start setup, Day 1, Week 1, and 30/60/90-day onboarding from one workflow.

This MVP should answer five questions at any time:

1. Is the employee ready to start?
2. What remains incomplete?
3. Who is responsible for it?
4. Is the employee progressing as expected?
5. Has onboarding prepared the employee to work independently?

## MVP Scope

The first release includes:

- Onboarding templates
- Onboarding plan creation from template
- Pre-start checklist
- Day 1 schedule
- Week 1 tasks
- 30/60/90-day goals
- Task ownership and due dates
- HR dashboard
- Manager onboarding view
- Employee onboarding view
- Notifications and reminders
- Audit logging
- Basic onboarding reporting

Out of scope for MVP:

- Calendar event creation in Google Calendar, Outlook, or Teams
- AI-generated tasks or goals
- Advanced analytics
- Automated course provisioning
- Full probation workflow transfer

## Primary Navigation

- Admin Portal -> People -> Onboarding
- Manager Portal -> Team -> Onboarding
- Talent Portal -> My Onboarding

## User Roles

### HR Admin

- Create, edit, archive, and duplicate onboarding templates
- Start onboarding plans
- Assign manager and onboarding buddy
- Review generated tasks, goals, schedule, and access items
- Send reminders
- Close or cancel onboarding plans

### Manager

- Review onboarding plans for direct reports
- Add role-specific tasks and first-project tasks
- Define and update 30/60/90-day goals
- Complete manager check-ins
- Confirm onboarding completion readiness

### Onboarding Buddy

- View only tasks assigned to them
- Complete buddy check-ins
- Add notes and flag concerns

### IT / Operations

- View assigned access and equipment tasks
- Update preparation and delivery statuses
- Report access issues

### Employee

- View personal onboarding journey
- Complete assigned tasks
- Confirm policy acknowledgements
- View Day 1 schedule, tools, contacts, and goals
- Raise blockers and questions

## Lifecycle and Status Model

### Plan Statuses

- `draft`
- `preparing`
- `ready_for_day_1`
- `in_progress`
- `delayed`
- `awaiting_manager_confirmation`
- `completed`
- `cancelled`

### Task Statuses

- `not_started`
- `in_progress`
- `blocked`
- `completed`
- `cancelled`

### Access Statuses

- `not_required`
- `not_requested`
- `requested`
- `in_progress`
- `created`
- `shared_with_employee`
- `tested`
- `access_issue`
- `completed`

### Goal Statuses

- `not_started`
- `in_progress`
- `at_risk`
- `completed`

## Ownership Rules

Supported owner roles:

- `hr`
- `manager`
- `employee`
- `buddy`
- `it`
- `operations`

Rules:

- Every required task must have one owner role and one due date.
- HR can reassign owners at plan level.
- Employees can complete only employee-owned tasks.
- Buddies can act only on buddy-owned tasks.
- Managers can act on plans for direct reports and tasks/goals they own.
- IT and Operations can act only on assigned access or equipment items unless they also have HR permissions.

## Core Workflows

### 1. Create Template

HR creates reusable onboarding templates with:

- Default tasks
- Relative due dates
- Default owner roles
- Day 1 schedule items
- Access requirements
- Equipment requirements
- Reading assignments
- 30/60/90-day suggested goals
- Check-in schedule

### 2. Create Onboarding Plan

HR:

1. Selects employee
2. Selects template
3. Confirms manager and buddy
4. Reviews generated tasks and due dates
5. Adjusts role-specific items
6. Publishes the plan

Plan publishing should:

- Materialize template tasks into plan tasks
- Resolve relative dates against start date
- Create schedule items, goals, access items, and check-ins
- Send plan-created notifications
- Write an audit log entry

### 3. Execute Onboarding

Owners complete tasks across phases:

- Pre-start
- Day 1
- Week 1
- Day 30
- Day 60
- Day 90

System behavior:

- Recalculate progress automatically
- Flag overdue required tasks
- Escalate critical pre-start blockers
- Show plan readiness on the dashboard

### 4. Close Onboarding

Closure requires:

- All required critical tasks completed or explicitly waived by HR
- Manager completion confirmation submitted
- Employee acknowledgement submitted
- Final audit log entry written

## Dashboard Requirements

### Admin Dashboard

Summary cards:

- Employees currently onboarding
- Starting this week
- Not ready for Day 1
- Overdue tasks
- Awaiting manager action
- Completing onboarding this month

Filters:

- Employee
- Department
- Manager
- Plan status
- Start date range
- Task owner
- Delayed only

Table columns:

- Employee
- Role
- Start date
- Manager
- Progress
- Overdue
- Status
- Next action

Quick actions:

- View plan
- Edit plan
- Send reminder
- Reassign owner
- Duplicate plan
- Mark completed
- Cancel onboarding

### Manager Dashboard

- Upcoming starters
- Direct reports in onboarding
- Overdue manager tasks
- Upcoming check-ins
- Goals awaiting update
- Plans awaiting confirmation

### Employee View

- Welcome message
- Completion progress
- Today’s tasks
- Upcoming activities
- Day 1 schedule
- Key contacts
- Required reading
- Tools and access status
- Assigned equipment
- 30/60/90-day goals
- Check-ins
- Blocker reporting

## Individual Plan Tabs

- Overview
- Tasks
- Day 1
- Tools and Access
- Equipment
- 30/60/90 Goals
- Check-Ins
- Documents
- Activity Timeline

## Derived Readiness Logic

### Ready for Day 1

Plan can move to `ready_for_day_1` when all critical pre-start tasks are complete:

- Work account linked
- Email created
- Required access requested or completed
- Equipment prepared
- Manager assigned
- Buddy assigned
- Day 1 schedule populated

### Delayed

Plan moves to `delayed` when either condition is true:

- Any required task is overdue
- A critical pre-start item remains incomplete within one day of start date

### Awaiting Manager Confirmation

Plan moves to `awaiting_manager_confirmation` when:

- Required tasks and goals are complete
- Employee acknowledgement is complete
- Manager has not yet submitted final confirmation

## Notifications and Reminder Rules

Trigger notifications for:

- Plan published
- Task assigned
- Task due soon
- Task overdue
- Day 1 tomorrow
- Check-in due
- Access issue reported
- Goal review due
- Plan ready for completion

Default reminder schedule:

- 5 days before start date
- 2 days before start date
- Morning of Day 1
- 1 day before task deadline
- Daily while a required task is overdue
- 3 days before milestone review

Escalations:

- 1 day overdue -> notify owner
- 3 days overdue -> notify owner and manager
- Critical pre-start incomplete one day before start -> notify HR and manager
- Access or laptop incomplete on Day 1 -> mark plan at risk

## Reporting Requirements

MVP reports:

- Employees currently onboarding
- Average onboarding completion time
- On-time completion rate
- Overdue tasks by owner
- Day 1 readiness rate
- Access readiness rate
- Equipment readiness rate
- Manager completion rate
- Onboarding completion by department

## Security and RLS Requirements

- Employees can view only their own onboarding plans and related records.
- Employees can update only employee-owned tasks and their reflections/acknowledgements.
- Managers can view plans for direct reports only.
- Managers can update manager-owned tasks, manager feedback, and manager check-ins for direct reports.
- Buddies can view and update only tasks assigned to them.
- HR Admins can manage all onboarding data.
- Super Admins have full access.
- IT / Operations can view and update only assigned access/equipment items unless granted broader role permissions.

## API / Service Boundaries

Required integrations:

- Employee Directory
- Employee Profile
- Account Linking
- Assets
- Probation
- Departments
- Job Titles
- Notifications
- Audit Logs
- Reports

Recommended service boundaries:

- `onboarding_templates`
- `onboarding_plans`
- `onboarding_tasks`
- `onboarding_schedule`
- `onboarding_goals`
- `onboarding_checkins`
- `onboarding_access`
- `onboarding_documents`
- `onboarding_audit`

## Definition of Done

The feature is done when:

- HR can create reusable templates
- HR can generate plans from templates
- Every task has owner and deadline
- Managers can manage goals and check-ins
- Employees can view and complete assigned tasks
- IT can manage access and equipment tasks
- Progress updates automatically
- Required overdue tasks are highlighted
- Notifications work
- Important actions are audit logged
- RLS protects role-specific access
- Plans can be completed and reported
- Desktop and mobile usage both work
