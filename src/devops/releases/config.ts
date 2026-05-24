/**
 * Releases specific parameters and configurations
 */
export const releasesConfig = {
  semanticVersioningStrategy: 'conventional-commits',
  changelogGenerators: ['github-releases-api'],
  approvalsRequired: 2,
  allowPreReleases: true,
  pwaAssetsPurgeFrequencyDays: 30
};
