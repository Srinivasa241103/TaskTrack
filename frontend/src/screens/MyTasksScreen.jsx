import { Badge } from '../components/Badge.jsx';
import { StatusBadge } from '../components/Badge.jsx';
import { PriorityIcon } from '../components/PriorityIcon.jsx';
import { TODAY, formatDue } from '../utils/dateUtils.js';

export function MyTasksScreen({ tasks = [], projects = [], currentUserId, openTask }) {
  const findProject = (id) => projects.find((p) => p.id === id);

  const mine = tasks.filter((t) => t.assignee === currentUserId);
  const groups = [
    { label: 'Overdue',      filter: (t) => t.status !== 'done' && t.due && new Date(t.due) < TODAY },
    { label: 'This week',    filter: (t) => t.status !== 'done' && t.due && new Date(t.due) >= TODAY && (new Date(t.due) - TODAY) < 7 * 86400000 },
    { label: 'Later',        filter: (t) => t.status !== 'done' && (!t.due || (new Date(t.due) - TODAY) >= 7 * 86400000) },
    { label: 'Recently done',filter: (t) => t.status === 'done' },
  ];

  return (
    <div className="page" data-screen-label="My Tasks">
      <div className="page-header">
        <div>
          <div className="h1">My tasks</div>
          <div className="page-header__meta">{mine.length} task{mine.length !== 1 ? 's' : ''} assigned to you</div>
        </div>
      </div>

      <div className="card">
        {mine.length === 0 ? (
          <div className="empty">
            <div className="h2" style={{ marginBottom: 6 }}>No tasks assigned to you</div>
            <div className="small">Tasks assigned to you will appear here.</div>
          </div>
        ) : (
          groups.map((g, gi) => {
            const items = mine.filter(g.filter);
            if (!items.length) return null;
            return (
              <div key={g.label}>
                <div style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'center', gap: 8, borderTop: gi ? '1px solid var(--border-2)' : 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: g.label === 'Overdue' ? 'var(--danger)' : 'var(--ink-3)' }}>
                    {g.label}
                  </span>
                  <Badge tone="neutral" outline>{items.length}</Badge>
                </div>
                <table className="tbl">
                  <tbody>
                    {items.map((t) => {
                      const p   = findProject(t.projectId);
                      const due = formatDue(t.due);
                      return (
                        <tr key={t.id} onClick={() => openTask(t.id)}>
                          <td style={{ width: 92 }}><span className="tbl__id mono">{t.key}</span></td>
                          <td>
                            <div className="row gap-8">
                              <PriorityIcon priority={t.priority} />
                              <span className="tbl__title">{t.title}</span>
                            </div>
                          </td>
                          <td style={{ width: 160 }}>
                            <span className="row gap-8" style={{ fontSize: 13 }}>
                              {p && <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />}
                              {p?.name ?? '—'}
                            </span>
                          </td>
                          <td style={{ width: 120 }}><StatusBadge status={t.status} /></td>
                          <td style={{ width: 110 }}>
                            {due && (
                              <span style={{ color: due.overdue && t.status !== 'done' ? 'var(--danger)' : 'var(--ink-2)', fontWeight: due.overdue && t.status !== 'done' ? 500 : 400, fontSize: 13 }}>
                                {due.label}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
