export const ROLES = {
  CUSTOMER: 'customer',
  AGENT: 'agent',
  ADMIN: 'admin',
};

export const TICKET_STATUS = {
  OPEN: 'Open',
  PENDING_ASSIGNMENT: 'Pending Assignment',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  PENDING_AGENT_REVIEW: 'Pending Agent Review',
  AI_RESOLVED: 'AI Resolved',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  ESCALATED: 'Escalated',
  PENDING_HUMAN_REVIEW: 'Pending Human Review',
  REOPENED: 'Reopened',
};

export const TICKET_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const CATEGORIES = ['Billing', 'Technical', 'Account', 'General'];