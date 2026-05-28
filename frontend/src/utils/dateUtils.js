export const TODAY = new Date('2026-05-27');

export function formatDue(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const diffDays = Math.round((d - TODAY) / 86400000);
  const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  let label = monthDay;
  if (diffDays === 0) label = 'Today';
  else if (diffDays === 1) label = 'Tomorrow';
  else if (diffDays === -1) label = 'Yesterday';
  else if (diffDays > 1 && diffDays <= 7) label = `In ${diffDays}d`;
  else if (diffDays < -1 && diffDays >= -7) label = `${-diffDays}d ago`;
  return { label, diffDays, overdue: diffDays < 0 };
}
