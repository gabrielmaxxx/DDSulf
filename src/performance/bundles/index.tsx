/**
 * DDSulf Resilient Bundle Splitting and Dynamic Imports Gate
 */

import React, { Component, ComponentType, lazy, Suspense } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  retryAttempts: number;
}

/**
 * Recovers bundle load errors (e.g. net::ERR_FILE_NOT_FOUND when static hashes change post-deploy)
 */
class ChunkRetryErrorBoundary extends Component<{ children: React.ReactNode; fallback?: React.ReactNode }, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false, retryAttempts: 0 };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: any) {
    if (this.state.retryAttempts < 2 && error.toString().includes('ChunkLoadError')) {
      this.setState(prev => ({ retryAttempts: prev.retryAttempts + 1, hasError: false }));
      
      // Clear cache and reload browser to get latest index asset manifests (PWA recovery tactic)
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-6 text-center border-2 border-dashed border-red-200 bg-red-50/25 rounded-3xl space-y-2">
            <p className="text-xs font-bold uppercase text-red-800 tracking-wider">Erro ao carregar módulo dinâmico</p>
            <p className="text-[11px] text-gray-500 font-semibold">O módulo de visualização falhou. Tente atualizar a aba para sincronizar.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-[10px] bg-red-600 font-bold text-white uppercase tracking-wider py-1.5 px-3 rounded-lg"
            >
              Recarregar Módulo
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * Safe, lazy, asynchronous code-splitting factory container with integrated Error Boundaries
 */
export function lazyImportWithHardening<T extends ComponentType<any>>(
    factory: () => Promise<{ default: T }>,
    spinner: React.ReactNode = (
      <div className="flex justify-center items-center p-12">
        <span className="size-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    )
) {
  const LazyComponent = lazy(factory);

  return function SafelyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <ChunkRetryErrorBoundary>
        <Suspense fallback={spinner}>
          <LazyComponent {...props} />
        </Suspense>
      </ChunkRetryErrorBoundary>
    );
  };
}
