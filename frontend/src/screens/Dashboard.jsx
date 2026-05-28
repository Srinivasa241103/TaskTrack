import React from 'react';
import { Icon } from '../components/Icons.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { StatusBadge } from '../components/Badge.jsx';
import { PriorityIcon } from '../components/PriorityIcon.jsx';
import { TODAY, formatDue } from '../utils/dateUtils.js';
import { CreateTaskModal } from './CreateTaskModal.jsx';

export function Dashboard({ tasks = [], setTasks, projects = [], users = [], currentUserId, setRoute, openTask }) {
  const [showCreateTask, setShowCreateTask] = React.useState(false);
  const findUser    = (id) => users.find((u) => u.id === id);
  const findProject = (id) => projects.find((p) => p.id === id);

  const me    = findUser(currentUserId);
  const mine  = tasks.filter((t) => t.assignee === currentUserId);
  const done  = mine.filter((t) => t.status === 'done');
  const overdue = mine.filter((t) => t.status !== 'done' && t.due && new Date(t.due) < TODAY);
  const priority = mine
    .filter((t) => t.status !== 'done')
    .sort((a, b) => new Date(a.due) - new Date(b.due))
    .slice(0, 6);

  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Up late' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = me?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="page" data-screen-label="Dashboard">
      <div className="page-header">
        <div>
          <div className="h1">{greeting}, {firstName}</div>
          <div className="page-header__meta">
            {mine.length} open task{mine.length !== 1 ? 's' : ''} across {new Set(mine.map((t) => t.projectId)).size} project{new Set(mine.map((t) => t.projectId)).size !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="row gap-8">
          <Button variant="secondary" size="sm" icon={<Icon.Cal />}>This week</Button>
          <Button variant="primary"   size="sm" icon={<Icon.Plus />} onClick={() => setShowCreateTask(true)}>New task</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <Metric label="Assigned to me"        value={mine.length}    sub={`${mine.filter((t) => t.status === 'in_progress').length} in progress`} />
        <Metric label="Completed this month"  value={done.length}    sub="Completed tasks" tone="success" />
        <Metric label="Overdue"               value={overdue.length} sub={overdue.length ? 'Needs your attention' : 'All caught up'} tone={overdue.length ? 'danger' : 'success'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        {/* Priority tasks table */}
        <div className="card">
          <div className="card__head">
            <div className="row gap-8">
              <span className="h2">My priority tasks</span>
              <Badge tone="neutral" outline>{priority.length}</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setRoute('tasks')}>View all <Icon.Chevron /></Button>
          </div>

          {priority.length === 0 ? (
            <div className="empty"><div className="small">No open tasks assigned to you.</div></div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 92 }}>Key</th>
                  <th>Title</th>
                  <th style={{ width: 140 }}>Project</th>
                  <th style={{ width: 120 }}>Status</th>
                  <th style={{ width: 110 }}>Due</th>
                </tr>
              </thead>
              <tbody>
                {priority.map((t) => {
                  const p   = findProject(t.projectId);
                  const due = formatDue(t.due);
                  return (
                    <tr key={t.id} onClick={() => openTask(t.id)}>
                      <td><span className="tbl__id mono">{t.key}</span></td>
                      <td>
                        <div className="row gap-8">
                          <PriorityIcon priority={t.priority} />
                          <span className="tbl__title">{t.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className="row gap-8" style={{ fontSize: 13 }}>
                          {p && <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />}
                          {p?.name ?? '—'}
                        </span>
                      </td>
                      <td><StatusBadge status={t.status} /></td>
                      <td>
                        {due && (
                          <span style={{ color: due.overdue ? 'var(--danger)' : 'var(--ink-2)', fontWeight: due.overdue ? 500 : 400, fontSize: 13 }}>
                            {due.label}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="col gap-16">
          {/* Active projects */}
          <div className="card">
            <div className="card__head">
              <span className="h2">Active projects</span>
              <Button variant="ghost" size="sm" onClick={() => setRoute('projects')}>All <Icon.Chevron /></Button>
            </div>
            <div className="card__body col gap-12">
              {projects.length === 0 ? (
                <div className="small" style={{ color: 'var(--ink-4)' }}>No projects yet.</div>
              ) : (
                projects.slice(0, 4).map((p) => {
                  const total = p.progress?.total ?? 0;
                  const doneCount = p.progress?.done ?? 0;
                  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
                  return (
                    <div key={p.id} className="row gap-12" style={{ cursor: 'pointer' }} onClick={() => setRoute(`project:${p.id}`)}>
                      <span style={{ width: 28, height: 28, borderRadius: 6, background: p.color, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        {p.key}
                      </span>
                      <div className="grow col" style={{ gap: 4 }}>
                        <div className="row" style={{ justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                          <span className="small mono">{doneCount}/{total}</span>
                        </div>
                        <div style={{ height: 3, background: 'var(--surface-sunken)', borderRadius: 99 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: p.color, borderRadius: 99 }} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent activity */}
          <div className="card">
            <div className="card__head"><span className="h2">Recent activity</span></div>
            <div className="card__body">
              <div className="empty"><div className="small">Activity will appear here.</div></div>
            </div>
          </div>
        </div>
      </div>

      {showCreateTask && (
        <CreateTaskModal
          projects={projects}
          users={users}
          setTasks={setTasks}
          onClose={() => setShowCreateTask(false)}
        />
      )}
    </div>
  );
}

export function Metric({ label, value, sub, tone }) {
  return (
    <div className="metric">
      <div className="metric__label">{label}</div>
      <div className="metric__value" style={tone === 'danger' ? { color: 'var(--danger)' } : undefined}>{value}</div>
      <div className={`metric__sub${tone === 'danger' ? ' metric__sub--danger' : ''}${tone === 'success' ? ' metric__sub--success' : ''}`}>{sub}</div>
    </div>
  );
}
