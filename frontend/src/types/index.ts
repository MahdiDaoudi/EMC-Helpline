// Domain Enums matching backend Prisma schema
export type Sex = "MALE" | "FEMALE";
export type AgeGroup =
  | "CHILD_5_12"
  | "TEEN_13_17"
  | "YOUNG_ADULT_18_25"
  | "ADULT_26_PLUS";
export type Priority = "NORMAL" | "HIGH" | "URGENT";
export type SignalementStatus =
  | "PENDING"
  | "VALIDATED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "CLOSED";
export type PlatformReportStatus =
  | "PENDING"
  | "SENT"
  | "PROCESSING"
  | "CLOSED"
  | "REJECTED";
export type ValidationType = "TECHNICIAN" | "ADMIN";
export type ValidationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ContentType =
  | "VIDEO"
  | "IMAGE"
  | "PROFILE"
  | "POST"
  | "COMMENT"
  | "PAGE";
export type AssignmentStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED";
export type RoleName =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "TECHNICIAN"
  | "ORGANIZATION_USER";
export type Titulaire = "MOI_MEME" | "AUTRE_PERSONNE";
export type AccompanimentType = "SUP" | "PSY" | "JUR";
export type OrganizationCategory = "JURIDIQUE" | "PSYCHIQUE";

// Domain Entities
export interface Role {
  id: number;
  name: RoleName;
  description: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string | null;
  isActive: boolean;
  isLocked: boolean;
  lastLogin?: string | null;
  roleId: number;
  role: Role;
  organizationId?: number | null;
  organization?: Organization | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Victim {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  telephone?: string | null;
  sex: Sex;
  ageGroup: AgeGroup;
  city?: string | null;
  isAnonymous: boolean;
  referenceNumber: string;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    signalement: number;
  };
}

export interface CyberViolence {
  id: number;
  name: string;
}

export interface Platform {
  id: number;
  name: string;
  email: string;
  icon?: string;
  createdAt: string;
}

export interface PlatformReport {
  signalementId: number;
  platformId: number;
  status: PlatformReportStatus;
  emailSubject: string;
  emailBody: string;
  emailTo?: string | null;
  selectedScreenshotUrls?: string[] | null;
  createdAt: string;
  closedAt?: string | null;
  platform?: Platform;
  signalement?: Signalement;
}

export interface Organization {
  id: number;
  nickname: string;
  name: string;
  category: OrganizationCategory;
  email: string;
  website?: string | null;
  description: string;
  createdAt: string;
  userCount?: number;
}

export interface Validate {
  signalementId: number;
  userId: number;
  type: ValidationType;
  status: ValidationStatus;
  reason: string;
  createdAt: string;
  user?: User;
}

export interface AssignedTo {
  signalementId: number;
  organizationId: number;
  type: AccompanimentType;
  status: AssignmentStatus;
  reason?: string | null;
  createdAt: string;
  processedAt?: string | null;
  closedAt?: string | null;
  organization?: Organization;
}

export interface Screenshot {
  id: number;
  imageUrl: string;
  createdAt: string;
}

export interface ReportedItem {
  id: number;
  description?: string | null;
  contentUrl: string;
  type: ContentType;
  signalementId: number;
  platformId: number;
  platform?: Platform;
  screenshots?: Screenshot[];
  createdAt: string;
}

export interface Signalement {
  id: number;
  reference?: string;
  description?: string | null;
  status: SignalementStatus;
  priority: Priority;
  issuer: string;
  titulaire?: Titulaire | null;
  accompaniments?: { id: number; type: AccompanimentType; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
  otherCyberViolence?: string | null;
  victimId: number;
  victim?: Victim;
  cyberViolenceId?: number | null;
  cyberViolence?: CyberViolence;
  platforms?: PlatformReport[];
  validate?: Validate[];
  assignedTo?: AssignedTo[];
  reportedItems?: ReportedItem[];
}

export interface SignalementsListResponse {
  items: Signalement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard Specific Types
export interface DashboardStats {
  totalSignalements: number;
  pendingSignalements: number;
  resolvedSignalements: number;
  highPriorityCases: number;
  totalOrganizations: number;
  totalVictims: number;
  topPlatforms?: Array<{
    id: number;
    name: string;
    icon?: string | null;
    count: number;
  }>;
  trends: {
    total: number;
    pending: number;
    resolved: number;
    highPriority: number;
  };
}

export interface TimeSeriesData {
  date: string;
  total: number;
  validated: number;
  inProgress: number;
  pending: number;
  rejected: number;
}

export interface RecentActivityItem {
  id: string;
  type:
    | "CREATED"
    | "ASSIGNED"
    | "VALIDATED"
    | "PLATFORM_REPORT"
    | "STATUS_CHANGE";
  title: string;
  description: string;
  timestamp: string;
  entityId: number;
  status?: string;
  user?: {
    name: string;
    avatar?: string;
  };
}
