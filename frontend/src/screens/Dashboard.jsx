import React from 'react';
import { Icon } from '../components/Icons.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { StatusBadge } from '../components/Badge.jsx';
import { PriorityIcon } from '../components/PriorityIcon.jsx';
import { TODAY, formatDue } from '../utils/dateUtils.js';
import { CreateTaskModal } from './CreateTaskModal.jsx';

export function Dashboard({ dashboard = null, tasks = [], setTasks, projects = [], users = [], currentUserId, setRoute, openTask }) {
  const [showCreateTask, setShowCreateTask] = React.useState(false);
  const findUser = (id) => users.find((u) => u.id === id);
  const findProject = (id) => projects.find((p) => p.id === id);

  const me = findUser(currentUserId);
  const mine = tasks.filter((t) => t.assignee === currentUserId);
  const overdue = mine.filter((t) => t.status !== 'done' && t.due && new Date(t.due) < TODAY);
  const priority = mine
    .filter((t) => t.status !== 'done')
    .sort((a, b) => new Date(a.due) - new Date(b.due))
    .slice(0, 6);

  const totalTasks = dashboard?.totalTasks ?? tasks.length;
  const myTasks = dashboard?.myTasks ?? mine.length;
  const overdueCount = dashboard?.overdueTasks ?? overdue.length;
  const byStatus = dashboard?.tasksByStatus ?? {
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };
  const perUserRaw = dashboard?.tasksPerUser ?? Object.entries(
    tasks.reduce((acc, t) => { if (t.assignee) acc[t.assignee] = (acc[t.assignee] || 0) + 1; return acc; }, {})
  ).map(([assigneeId, count]) => ({ assigneeId, count }));
  const perUser = perUserRaw
    .map((row) => ({ ...row, user: findUser(row.assigneeId) }))
    .sort((a, b) => b.count - a.count);

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

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <Metric label="Total tasks" value={totalTasks} sub="Across your projects" />
        <Metric label="Assigned to me" value={myTasks} sub={`${mine.filter((t) => t.status === 'in_progress').length} in progress`} />
        <Metric label="Overdue" value={overdueCount} sub={overdueCount ? 'Needs your attention' : 'All caught up'} tone={overdueCount ? 'danger' : 'success'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
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
                  const p = findProject(t.projectId);
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

          <div className="card">
            <div className="card__head"><span className="h2">Tasks by status</span></div>
            <div className="card__body col gap-12">
              {[
                { key: 'todo', label: 'To Do' },
                { key: 'in_progress', label: 'In Progress' },
                { key: 'done', label: 'Done' },
              ].map(({ key, label }) => {
                const count = byStatus[key] ?? 0;
                const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                return (
                  <div key={key} className="col" style={{ gap: 4 }}>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13 }}>{label}</span>
                      <span className="small mono">{count}</span>
                    </div>
                    <div style={{ height: 3, background: 'var(--surface-sunken)', borderRadius: 99 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card__head"><span className="h2">Tasks per user</span></div>
            <div className="card__body col gap-10">
              {perUser.length === 0 ? (
                <div className="small" style={{ color: 'var(--ink-4)' }}>No assigned tasks yet.</div>
              ) : (
                perUser.map((row) => (
                  <div key={row.assigneeId} className="row gap-8" style={{ justifyContent: 'space-between' }}>
                    <span className="row gap-8" style={{ minWidth: 0 }}>
                      {row.user && <Avatar user={row.user} size="sm" />}
                      <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.user?.name ?? 'Unknown user'}
                      </span>
                    </span>
                    <span className="small mono">{row.count}</span>
                  </div>
                ))
              )}
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
