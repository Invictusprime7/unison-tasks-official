/** Shared development-time provenance gate for intake and the registration CLI. */
export function validateSourceProvenance(record) {
  const issues = [];
  if (!record.sourceId?.trim()) issues.push('sourceId is required');
  if (!record.name?.trim()) issues.push('name is required');
  if (!record.sourceUrl?.trim()) issues.push('sourceUrl is required for 21st provenance');
  if (!record.license?.trim()) issues.push('license must be reviewed and recorded');
  const review = record.licenseReview;
  if (review?.status !== 'verified') {
    issues.push('license review must be explicitly verified before source certification');
  } else {
    if (!review.license?.trim() || review.license !== record.license) issues.push('verified license must match the recorded license');
    if (!review.source?.trim()) issues.push('license review evidence source is required');
    if (!review.verifiedAt || !Number.isFinite(Date.parse(review.verifiedAt))) issues.push('license review verification date is required');
  }
  return issues;
}
