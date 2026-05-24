/**
 * Types and interfaces for the DDSulf Knowledge Management system
 */

export type DocumentCategory = 'regulatory' | 'operational' | 'chemical' | 'safety' | 'commercial';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

export interface KnowledgeArticle {
  id: string;
  tenantId: string;
  title: string;
  content: string; // Markdown supported
  category: DocumentCategory;
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: number;
  updatedAt: number;
  viewCount: number;
  likes: number;
  isPublished: boolean;
  version: number;
  relatedArticleIds?: string[];
  relatedProcedureIds?: string[];
}

export interface SecurityEquipments {
  hasMask: boolean;
  hasGloves: boolean;
  hasGoggles: boolean;
  hasBoots: boolean;
  hasApron: boolean;
  extraArmorText?: string;
}

export interface ProcedureStep {
  id: string;
  sequence: number;
  title: string;
  description: string;
  isRequired: boolean;
  requiresPhotoProof?: boolean;
  chemicalAdjustmentRequired?: boolean;
  estimatedDurationSeconds?: number;
}

export interface Procedure {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  category: DocumentCategory;
  version: number;
  steps: ProcedureStep[];
  requiredEPIs: SecurityEquipments;
  targetPests: string[];
  allowedChemicalIds: string[];
  recommendedChemicalVolume: string; // e.g. "45 L per hundred sq meters"
  createdBy: string;
  createdByName: string;
  createdAt: number;
  updatedAt: number;
  isPublished: boolean;
  averageExecutionTimeSeconds?: number;
  viewCount: number;
}

export interface LearningStep {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  type: 'article' | 'procedure' | 'quiz' | 'external_link';
  targetId: string; // referencing KnowledgeArticle or Procedure
  isCompleted?: boolean;
}

export interface TrainingQuiz {
  questionId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

export interface LearningPath {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  category: 'onboarding' | 'safety' | 'chemical_handling' | 'high_impact_pest';
  steps: LearningStep[];
  quizzes?: TrainingQuiz[];
  rewardXP: number;
  isPublished: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface UserLearningProgress {
  id: string;
  userId: string;
  userName: string;
  tenantId: string;
  pathId: string;
  completedStepIds: string[];
  quizScores: Record<string, number>; // quizId -> score (0-100)
  isCompleted: boolean;
  startedAt: number;
  completedAt?: number;
  totalXPPremium: number;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  type: 'article' | 'procedure';
  version: number;
  changesSummary: string;
  authorId: string;
  authorName: string;
  timestamp: number;
  diffPatch?: string; // Storing simple textual delta
  contentBackup: string; // Full string backup representation
}

export interface DocApproval {
  id: string;
  tenantId: string;
  documentId: string;
  documentType: 'article' | 'procedure';
  proposedTitle: string;
  proposedContentJSON: string; // serialized edit
  authorId: string;
  authorName: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: number;
  feedback?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: number;
}

export interface KnowledgeAnalytics {
  id: string;
  tenantId: string;
  documentId: string; // article or procedure ID
  type: 'article' | 'procedure';
  viewsCount: number;
  averageDurationSeconds: number;
  activeExecutionsCount: number; 
  failedStepsCount: number;
  lastAccessedAt: number;
}

export interface ProcedureExecutionLog {
  id: string;
  procedureId: string;
  procedureTitle: string;
  technicianId: string;
  technicianName: string;
  tenantId: string;
  startedAt: number;
  completedAt?: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  completedStepIds: string[];
  stepPhotos: Record<string, string>; // stepId -> dataURI / photoMock
  chemicalVolumeUsed: number;
  chemicalAdherenceConfirmed: boolean;
  durationSeconds: number;
  notes?: string;
}

export interface GovernanceConfig {
  requireDoubleApprovalForCriticalChemicals: boolean;
  minimumReviewPeriodDays: number;
  allowOfflineExecution: boolean;
  defaultOnboardingTrackIds: string[];
  mandatedEPICloseouts: boolean;
}
