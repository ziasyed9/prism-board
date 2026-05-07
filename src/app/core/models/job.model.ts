// src/app/core/models/job.model.ts

export type JobStatus =
  | 'wishlist'
  | 'applied'
  | 'phone_screen'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

// Same concept — only these exact values are valid job sources
export type JobSource =
  | 'linkedin'
  | 'indeed'
  | 'company_website'
  | 'referral'
  | 'glassdoor'
  | 'other';

// ─────────────────────────────────────────────────────────────────────────────
// The Job interface defines the exact shape of every job object in the app.
export interface Job {
  id: string;               // unique identifier, generated with uuid
  company: string;          // e.g. "Google"
  role: string;             // e.g. "Frontend Engineer"
  status: JobStatus;        // must be one of the union values above
  source: JobSource;        // where you found the job
  appliedDate: string;      // ISO format: "2024-01-15" — easy to sort and compare
  lastUpdated: string;      // ISO format: when you last changed the status
  salary?: {                // ? means optional — not all jobs show salary
    min: number;
    max: number;
    currency: string;       // e.g. "USD"
  };
  location?: string;        // e.g. "New York, NY"
  remote: boolean;          // true = remote, false = on-site
  notes?: string;           // your personal notes about this application
  url?: string;             // link to the job posting
  contactName?: string;     // recruiter or hiring manager name
  contactEmail?: string;
  daysInPipeline?: number;  // computed (calculated), not stored directly
}


export interface JobFilters {
  status: JobStatus | 'all';
  source: JobSource | 'all';
  remote: boolean | 'all';
  searchQuery: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}


export const JOB_STATUS_CONFIG: Record<JobStatus, {
  label: string;   // human-readable label shown in the UI
  color: string;   // hex color used in charts and badges
  order: number;   // sort order for displaying the pipeline left-to-right
}> = {
  wishlist:     { label: 'Wishlist',     color: '#8b949e', order: 0 },
  applied:      { label: 'Applied',      color: '#38bdf8', order: 1 },
  phone_screen: { label: 'Phone Screen', color: '#a371f7', order: 2 },
  interview:    { label: 'Interview',    color: '#d29922', order: 3 },
  offer:        { label: 'Offer',        color: '#3fb950', order: 4 },
  rejected:     { label: 'Rejected',     color: '#f85149', order: 5 },
  withdrawn:    { label: 'Withdrawn',    color: '#484f58', order: 6 },
};

export const JOB_SOURCE_CONFIG: Record<JobSource, {
  label: string;
  icon: string;   // Material icon name
}> = {
  linkedin:        { label: 'LinkedIn',        icon: 'work' },
  indeed:          { label: 'Indeed',          icon: 'search' },
  company_website: { label: 'Company Website', icon: 'language' },
  referral:        { label: 'Referral',        icon: 'people' },
  glassdoor:       { label: 'Glassdoor',       icon: 'door_front' },
  other:           { label: 'Other',           icon: 'more_horiz' },
};