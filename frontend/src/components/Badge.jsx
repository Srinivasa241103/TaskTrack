export const STATUS_TONE = { todo: 'neutral', in_progress: 'warning', done: 'success' };
export const STATUS_LABEL = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };

export function Badge({ tone = 'neutral', children, dot = false, outline = false }) {
  const cls = outline ? 'badge badge--outline' : `badge${tone === 'neutral' ? '' : ' badge--' + tone}`;
  return (
    <span className={cls}>
      {dot && <span className="badge__dot" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  return <Badge tone={STATUS_TONE[status]} dot>{STATUS_LABEL[status]}</Badge>;
}
