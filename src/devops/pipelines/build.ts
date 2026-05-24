/**
 * Pipeline: Build and compilation steps configuration
 */
export const buildPipelineConfig = {
  name: 'TypeScript Compiler Verification',
  command: 'tsc --noEmit --skipLibCheck',
  timeoutMs: 120000,
  requiredFiles: ['src/main.tsx', 'src/App.tsx', 'src/devops/types/index.ts']
};
