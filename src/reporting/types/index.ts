/**
 * DDSulf Advanced Document Reporting, Exports & Formatting Types
 */

export type ReportCategory = 'financial' | 'operational' | 'executive' | 'analytics';

export type ExportFormat = 'pdf' | 'csv' | 'xls';

export type ReportStatus = 'generating' | 'ready' | 'failed' | 'idle';

export interface ReportTemplate {
  id: string;
  name: string;
  category: ReportCategory;
  description: string;
  logoIncluded: boolean;
  accentColor: string; // e.g., "#0f172a"
  layoutType: 'grid' | 'linear' | 'executive_summary';
}

export interface ReportSnapshot {
  id: string;
  templateId: string;
  title: string;
  createdByName: string;
  createdAt: number;
  category: ReportCategory;
  sizeBytes: number;
  downloadUrl?: string; // Cacheable links
  metadata?: Record<string, any>;
}

export interface ExportJob {
  id: string;
  title: string;
  format: ExportFormat;
  progressPercentage: number;
  status: ReportStatus;
  failedReason?: string;
  downloadUrl?: string;
  startedAt: number;
  completedAt?: number;
}

export interface ReportingMetrics {
  totalDocsExported: number;
  averageGenerationMs: number;
  mostFrequentCategory: ReportCategory;
  lastSyncTimestamp: number;
}
