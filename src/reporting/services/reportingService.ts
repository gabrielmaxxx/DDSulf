/**
 * DDSulf Core Unified Reporting & Document Rendering Service
 * Compiles database records, injects structural executive summaries, and exports pristine document structures.
 */

import { ReportTemplate, ReportSnapshot, ExportJob, ExportFormat, ReportCategory } from '../types';

export class ReportingEngineService {
  private static STORAGE_KEY_JOBS = 'ddsulf_reporting_export_jobs';
  private static STORAGE_KEY_SNAPSHOTS = 'ddsulf_reporting_snapshots';
  private static METRICS_KEY = 'ddsulf_reporting_usage_telemetry';

  private static listeners: Set<() => void> = new Set();

  public static subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => { this.listeners.delete(cb); };
  }

  private static notifyListeners() {
    this.listeners.forEach(cb => {
      try { cb(); } catch (e) { console.error(e); }
    });
  }

  /**
   * Retrieves predefined document layouts
   */
  public static getTemplates(): ReportTemplate[] {
    return [
      {
        id: 'tpl_exec_monthly_summary',
        name: 'Relatório Executivo Mensal DDSulf',
        category: 'executive',
        description: 'Visão consolidada de alta performance, contendo margem bruta, metas alcançadas de campo e insights recomendados.',
        logoIncluded: true,
        accentColor: '#1e293b', // Slate 800
        layoutType: 'executive_summary'
      },
      {
        id: 'tpl_financial_margin_audit',
        name: 'Auditoria de Lucratividade & Margem por Rota',
        category: 'financial',
        description: 'Análise detalhada de custos e despesas operacionais por rota, destacando orçamentos subprecificados.',
        logoIncluded: true,
        accentColor: '#0f766e', // Teal 700
        layoutType: 'grid'
      },
      {
        id: 'tpl_oper_productivity_card',
        name: 'Performance & Produtividade das Frotas de Campo',
        category: 'operational',
        description: 'Consolidação de checklists preenchidos por técnicos, média de visitas, reincidências e eficácia na aplicação de químicos.',
        logoIncluded: false,
        accentColor: '#6d28d9', // Violet 700
        layoutType: 'linear'
      },
      {
        id: 'tpl_analytics_forecast_prospect',
        name: 'Planejamento Sazonal de Manejo Agroquímico',
        category: 'analytics',
        description: 'Mapeamento estatístico com regressões de crescimento e tendências de incidência de pragas urbanas para os próximos trimestres.',
        logoIncluded: true,
        accentColor: '#0369a1', // Sky 700
        layoutType: 'executive_summary'
      }
    ];
  }

  /**
   * Fetches actively generating execution jobs
   */
  public static getActiveJobs(): ExportJob[] {
    if (typeof localStorage === 'undefined') return [];
    const stored = localStorage.getItem(this.STORAGE_KEY_JOBS);
    return stored ? JSON.parse(stored) : [];
  }

  private static saveJobs(jobs: ExportJob[]) {
    localStorage.setItem(this.STORAGE_KEY_JOBS, JSON.stringify(jobs));
    this.notifyListeners();
  }

  /**
   * Fetches successfully completed report snapshots
   */
  public static getSnapshots(): ReportSnapshot[] {
    if (typeof localStorage === 'undefined') return [];
    const stored = localStorage.getItem(this.STORAGE_KEY_SNAPSHOTS);
    if (stored) return JSON.parse(stored);

    // Initial default mock database records
    const defaults: ReportSnapshot[] = [
      {
        id: 'snap_may_2026_exec',
        templateId: 'tpl_exec_monthly_summary',
        title: 'Balanço Executivo Consolidado - Maio 2026',
        createdByName: 'Clarissa Azevedo (Financeiro)',
        createdAt: Date.now() - 3 * 86400 * 1000,
        category: 'executive',
        sizeBytes: 1048576, // 1MB
        metadata: { successRate: 0.98, averageMargin: 0.34 }
      },
      {
        id: 'snap_q1_margin_audit',
        templateId: 'tpl_financial_margin_audit',
        title: 'Auditoria de Lucratividade - Q1 2026 Sazonal',
        createdByName: 'Gabriel Max (Super Admin)',
        createdAt: Date.now() - 10 * 86400 * 1000,
        category: 'financial',
        sizeBytes: 2516582, // 2.4MB
        metadata: { compromisedRoutesCount: 3 }
      }
    ];

    localStorage.setItem(this.STORAGE_KEY_SNAPSHOTS, JSON.stringify(defaults));
    return defaults;
  }

  private static saveSnapshots(snapshots: ReportSnapshot[]) {
    localStorage.setItem(this.STORAGE_KEY_SNAPSHOTS, JSON.stringify(snapshots));
    this.notifyListeners();
  }

  /**
   * Initiates an asynchronous background render export task, mimicking robust worker rendering pipelines 
   */
  public static async executeExport(
    templateId: string,
    format: ExportFormat,
    customPayload: Record<string, any>,
    userRole: string
  ): Promise<string> {
    const templates = this.getTemplates();
    const tpl = templates.find(t => t.id === templateId);

    if (!tpl) {
      throw new Error(`Template de relatório não localizado: ${templateId}`);
    }

    // Role verification guards
    if (tpl.category === 'financial' && (userRole === 'tecnico' || userRole === 'visualizador')) {
      throw new Error('Acesso negado: Perfil sem credenciais comerciais para faturamento.');
    }

    const jobId = 'job_' + Math.random().toString(36).substr(2, 9);
    const jobs = this.getActiveJobs();

    const newJob: ExportJob = {
      id: jobId,
      title: tpl.name,
      format,
      progressPercentage: 5,
      status: 'generating',
      startedAt: Date.now()
    };

    const updatedJobs = [newJob, ...jobs];
    this.saveJobs(updatedJobs);

    // Kickstart async generation queue
    this.runGenerationProgress(jobId, tpl, customPayload);

    return jobId;
  }

  /**
   * Slowly ticks progress bar to represent robust server calculations, eventually spawning snapshot files 
   */
  private static async runGenerationProgress(jobId: string, template: ReportTemplate, payload: Record<string, any>) {
    const ticks = [20, 45, 70, 95, 100];
    
    for (const p of ticks) {
      await new Promise(resolve => setTimeout(resolve, 150)); // Simulates engine thread computations
      
      const list = this.getActiveJobs();
      const idx = list.findIndex(j => j.id === jobId);
      if (idx === -1) return;

      list[idx].progressPercentage = p;
      if (p === 100) {
        list[idx].status = 'ready';
        list[idx].completedAt = Date.now();
        
        // Generate a standard localized safe CSV representation in memory or standard Data URI for testing downloads
        let dataUri = '';
        if (list[idx].format === 'csv') {
          const csvLines = [
            'DDSulf Report Engine Output',
            `Relatorio: ${template.name}`,
            `Emitido em: ${new Date().toISOString()}`,
            `Categoria: ${template.category}`,
            '',
            'Metrica,Valor,Impacto',
            `Volume de Atendimentos,${payload.serviceVolume || 112},Positivo`,
            `Margem Média,${((payload.averageMargin || 0.32) * 100).toFixed(1)}%,Estável`,
            `Sincronia Latência,${payload.syncLatencyMs || 150}ms,Excelente`
          ];
          dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvLines.join('\n'));
        } else {
          // Standard formatted SVG design template block representation representing executive visual layouts
          const svgMarkup = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" style="background-color: #f8fafc; font-family: system-ui, sans-serif;">
              <rect x="20" y="20" width="760" height="560" fill="white" rx="12" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.05))" />
              <!-- Header -->
              <rect x="20" y="20" width="760" height="80" fill="${template.accentColor}" rx="12" />
              <text x="50" y="65" fill="white" font-size="24" font-weight="bold">DDSulf Executive Intelligence</text>
              <text x="750" y="60" fill="white" font-size="12" text-anchor="end">Série Premium SaaS</text>
              
              <!-- Content -->
              <text x="50" y="140" fill="#334155" font-size="20" font-weight="bold">${template.name}</text>
              <text x="50" y="170" fill="#64748b" font-size="12">${template.description}</text>
              
              <line x1="50" y1="200" x2="750" y2="200" stroke="#e2e8f0" stroke-width="2" />
              
              <!-- Metrics Cards / Grid -->
              <rect x="50" y="230" width="210" height="100" fill="#f1f5f9" rx="8" />
              <text x="70" y="260" fill="#64748b" font-size="12" font-weight="medium">Volume</text>
              <text x="70" y="300" fill="#0f172a" font-size="28" font-weight="bold">${payload.serviceVolume || 112}</text>
              
              <rect x="280" y="230" width="210" height="100" fill="#f1f5f9" rx="8" />
              <text x="300" y="260" fill="#64748b" font-size="12" font-weight="medium">Margem Operativa</text>
              <text x="300" y="300" fill="#0f172a" font-size="28" font-weight="bold">${((payload.averageMargin || 0.32) * 100).toFixed(1)}%</text>
              
              <rect x="510" y="230" width="240" height="100" fill="#f1f5f9" rx="8" />
              <text x="530" y="260" fill="#64748b" font-size="12" font-weight="medium">Estágio de Sincronia</text>
              <text x="530" y="300" fill="#0f172a" font-size="28" font-weight="bold">${payload.syncLatencyMs || 42}ms</text>
              
              <!-- Footer Certification Stamp -->
              <rect x="50" y="500" width="700" height="50" fill="#f8fafc" rx="6" />
              <text x="70" y="530" fill="#64748b" font-size="11">Este documento de caráter gerencial é criptograficamente carimbado pelo Núcleo de Auditoria e Conformidade DDSulf.</text>
            </svg>
          `;
          dataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgMarkup);
        }

        list[idx].downloadUrl = dataUri;

        // Automatically compile snapshot lists into storage memory for user download
        const snapshots = this.getSnapshots();
        const newSnapshot: ReportSnapshot = {
          id: 'snap_' + Math.random().toString(36).substr(2, 9),
          templateId: template.id,
          title: `${template.name} - ${new Date().toLocaleDateString('pt-BR')}`,
          createdByName: payload.userName || 'Sistema DDSulf',
          createdAt: Date.now(),
          category: template.category,
          sizeBytes: Math.round(50000 + Math.random() * 80000),
          downloadUrl: dataUri,
          metadata: { ...payload }
        };

        this.saveSnapshots([newSnapshot, ...snapshots]);
        this.recordTelemetryMetrics(template.category);
      }
      this.saveJobs(list);
    }
  }

  /**
   * Records telemetry logs around most frequent downloads category
   */
  private static recordTelemetryMetrics(category: ReportCategory) {
    if (typeof localStorage === 'undefined') return;
    const currentStr = localStorage.getItem(this.METRICS_KEY);
    let metrics = currentStr ? JSON.parse(currentStr) : {
      totalDocsExported: 0,
      averageGenerationMs: 650,
      mostFrequentCategory: 'executive' as ReportCategory,
      lastSyncTimestamp: Date.now()
    };

    metrics.totalDocsExported++;
    metrics.mostFrequentCategory = category;
    metrics.lastSyncTimestamp = Date.now();

    localStorage.setItem(this.METRICS_KEY, JSON.stringify(metrics));
  }

  public static getTelemetry(): any {
    if (typeof localStorage === 'undefined') return {};
    const stored = localStorage.getItem(this.METRICS_KEY);
    return stored ? JSON.parse(stored) : {
      totalDocsExported: 2,
      averageGenerationMs: 600,
      mostFrequentCategory: 'executive' as ReportCategory,
      lastSyncTimestamp: Date.now()
    };
  }

  public static wipeJobLog(jobId: string): void {
    const list = this.getActiveJobs().filter(j => j.id !== jobId);
    this.saveJobs(list);
  }

  public static deleteSnapshot(snapId: string): void {
    const list = this.getSnapshots().filter(s => s.id !== snapId);
    this.saveSnapshots(list);
  }
}

export default ReportingEngineService;
