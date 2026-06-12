export const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  cv_submitted:           { label: 'CV Submitted',        color: '#94a3b8', bg: 'rgba(148,163,184,0.1)',  border: 'rgba(148,163,184,0.25)' },
  cv_review:              { label: 'CV Review',           color: '#60a5fa', bg: 'rgba(59,130,246,0.1)',   border: 'rgba(59,130,246,0.25)' },
  cv_shortlisted:         { label: 'Shortlisted',         color: '#c084fc', bg: 'rgba(168,85,247,0.1)',   border: 'rgba(168,85,247,0.25)' },
  cv_rejected:            { label: 'CV Rejected',         color: '#f87171', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.25)' },
  interview_scheduled:    { label: 'Interview Scheduled', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.25)' },
  interview_complete:     { label: 'Interview Complete',  color: '#fb923c', bg: 'rgba(249,115,22,0.1)',   border: 'rgba(249,115,22,0.25)' },
  interview_rejected:     { label: 'Not Selected',        color: '#f87171', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.25)' },
  offer_drafted:          { label: 'Offer Drafted',       color: '#38bdf8', bg: 'rgba(14,165,233,0.1)',   border: 'rgba(14,165,233,0.25)' },
  offer_pending_approval: { label: 'Pending Approval',    color: '#fbbf24', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.25)' },
  offer_approved:         { label: 'Offer Approved',      color: '#4ade80', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.25)' },
  offer_sent:             { label: 'Offer Sent',          color: '#4ade80', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.25)' },
  offer_accepted:         { label: 'Offer Accepted',      color: '#22c55e', bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.4)' },
  offer_declined:         { label: 'Offer Declined',      color: '#f87171', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.25)' },
  offer_countered:        { label: 'Counter Offer',       color: '#fbbf24', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)' },
  hired:                  { label: 'Hired ✓',             color: '#22c55e', bg: 'rgba(34,197,94,0.18)',   border: 'rgba(34,197,94,0.45)' },
  withdrawn:              { label: 'Withdrawn',           color: '#64748b', bg: 'rgba(100,116,139,0.1)',  border: 'rgba(100,116,139,0.25)' },
};

export const EASE = {
  out:        [0.25, 0.46, 0.45, 0.94] as const,
  outExpo:    [0.19, 1,    0.22, 1]    as const,
  outBack:    [0.34, 1.56, 0.64, 1]   as const,
  inOut:      [0.76, 0,    0.24, 1]   as const,
  spring:     { type: 'spring', stiffness: 300, damping: 30 } as const,
  springSmooth: { type: 'spring', stiffness: 120, damping: 24 } as const,
};

export const DURATION = {
  fast:    0.2,
  normal:  0.35,
  slow:    0.6,
  slower:  0.9,
};

export const DEMO_USERS = {
  master:      { email: 'admin@avenir.com',         password: 'Demo@2024', role: 'Master Admin',        icon: '👑' },
  hr_admin:    { email: 'hr@avenir.com',            password: 'Demo@2024', role: 'HR Manager',          icon: '🧑‍💼' },
  svp:         { email: 'dept@avenir.com',          password: 'Demo@2024', role: 'Dept Head',           icon: '🏢' },
  team_manager:{ email: 'officer@avenir.com',       password: 'Demo@2024', role: 'HR Officer',          icon: '📋' },
  team_lead:   { email: 'recruiter@avenir.com',     password: 'Demo@2024', role: 'Recruiter',           icon: '⚙️' },
  interviewer: { email: 'interviewer@avenir.com',   password: 'Demo@2024', role: 'Interviewer',         icon: '🎯' },
  finance:     { email: 'finance@avenir.com',       password: 'Demo@2024', role: 'Finance Approver',    icon: '💰' },
};

export const NAV_ITEMS = [
  { href: '/dashboard',   label: 'Dashboard',   icon: 'LayoutDashboard' },
  { href: '/candidates',  label: 'Candidates',  icon: 'Users' },
  { href: '/interviews',  label: 'Interviews',  icon: 'Calendar' },
  { href: '/approvals',   label: 'Approvals',   icon: 'CheckSquare' },
  { href: '/reports',     label: 'Reports',     icon: 'BarChart3' },
  { href: '/audit',       label: 'Audit Log',   icon: 'FileText' },
  { href: '/settings',    label: 'Settings',    icon: 'Settings' },
];

export const PIPELINE_STAGES = [
  'CV In', 'Review', 'Shortlisted', 'Interview', 'Feedback', 'Offer', 'Approved', 'Hired'
];
