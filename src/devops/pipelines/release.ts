/**
 * Pipeline: Release and Semantic updates distribution
 */
export const releasePipelineConfig = {
  name: 'Semantic Release & PWA Cache Invalidation',
  targetScopes: ['major', 'minor', 'patch', 'hotfix'],
  githubReleasePublishEnabled: true,
  invalidatePwaCache: true,
  registryUpdate: 'npm'
};
