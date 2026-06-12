export type {
  Role,
  CandidateStatus,
  ApprovalStep,
  ApprovalStatus,
  InterviewMode,
  FeedbackRecommendation,
  Profile,
  SalaryBand,
  Candidate,
  CvReview,
  Interview,
  InterviewPanel,
  InterviewFeedback,
  Offer,
  OfferApproval,
  OfferResponse,
  Notification,
  AuditEvent,
  EmailConfig,
  OnboardingHandoff,
} from '@prisma/client';

import type { Prisma } from '@prisma/client';

export interface CandidateWithRelations {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  nationality: string | null;
  currentLocation: string | null;
  currentTitle: string | null;
  currentEmployer: string | null;
  yearsExperience: number | null;
  linkedinUrl: string | null;
  source: string | null;
  appliedRoleTitle: string;
  salaryBandId: string | null;
  expectedSalary: number | null;
  currency: string;
  cvFilePath: string | null;
  cvExtractedData: string | null;
  status: import('@prisma/client').CandidateStatus;
  assignedHrId: string | null;
  submittedById: string | null;
  notes: string | null;
  tags: string;
  createdAt: Date;
  updatedAt: Date;
  salaryBand?: import('@prisma/client').SalaryBand | null;
  assignedHR?: import('@prisma/client').Profile | null;
  submittedBy?: import('@prisma/client').Profile | null;
  cvReviews?: import('@prisma/client').CvReview[];
  interviews?: import('@prisma/client').Interview[];
  offer?: import('@prisma/client').Offer | null;
}

import type { Interview, InterviewPanel, InterviewFeedback, Candidate, Offer, OfferApproval, OfferResponse, SalaryBand, Profile as PrismaProfile } from '@prisma/client';

export type InterviewWithRelations = Interview & {
  panel?: (InterviewPanel & { panelist: PrismaProfile })[];
  feedback?: (InterviewFeedback & { panelist: PrismaProfile })[];
  candidate?: Candidate;
};

export type OfferWithRelations = Offer & {
  approvals?: (OfferApproval & { approver?: PrismaProfile | null })[];
  response?: OfferResponse | null;
  candidate?: Candidate;
  salaryBand?: SalaryBand | null;
};

export interface CvExtractedData {
  extractedName?: string;
  extractedEmail?: string;
  extractedPhone?: string;
  linkedinUrl?: string;
  summary?: string;
  skills?: string[];
  education?: { institution: string; degree: string; year?: string }[];
  experience?: { company: string; title: string; duration: string; description?: string }[];
  certifications?: string[];
  languages?: string[];
  rawText?: string;
}

export type ActionResult<T = null> = { data: T; error: null } | { data: null; error: null } | { data: null; error: string };

export interface DashboardStats {
  totalCandidates: number;
  activeThisWeek: number;
  pendingReviews: number;
  pendingApprovals: number;
  interviewsThisWeek: number;
  hired: number;
  stageCounts: number[];
}
