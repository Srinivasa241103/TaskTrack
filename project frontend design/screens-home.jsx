// Dashboard, Projects Directory, My Tasks.

function Dashboard({ tasks, setRoute, openTask }) {
  const me = findUser(CURRENT_USER_ID);
  const mine = tasks.filter((t) => t.assignee === CURRENT_USER_ID);
  const done = mine.filter((t) => t.status === 'done');
  const overdue = mine.filter((t) => t.status !== 'done' && t.due && new Date(t.due) < TODAY);
  const priority = mine
    .filter((t) => t.status !== 'done')
    .sort((a, b) => new Date(a.due) - new Date(b.due))
    .slice(0, 6);

  const hour = TODAY.getHours();
  const greeting = hour < 5 ? 'Up late' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page" data-screen-label="Dashboard">
      <div className="page-header">
        <div>
          <div className="h1">{greeting}, {me.name.split(' ')[0]}</div>
          <div className="page-header__meta">Wednesday, May 27 · {mine.length} open across {new Set(mine.map(t=>t.projectId)).size} projects</div>
        </div>
        <div className="row gap-8">
          <Button variant="secondary" size="sm" icon={<Icon.Cal />}>This week</Button>
          <Button variant="primary" size="sm" icon={<Icon.Plus />}>New task</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <Metric label="Assigned to me" value={mine.length} sub={`${mine.filter(t=>t.status==='in_progress').length} in progress`} />
        <Metric label="Completed this month" value={done.length} sub="+3 from last month" tone="success" />
        <Metric label="Overdue" value={overdue.length} sub={overdue.length ? 'Needs your attention' : 'All caught up'} tone={overdue.length ? 'danger' : 'success'} />
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
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                        {p.name}
                      </span>
                    </td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>
                      <span style={{ color: due.overdue ? 'var(--danger)' : 'var(--ink-2)', fontWeight: due.overdue ? 500 : 400, fontSize: 13 }}>
                        {due.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="col gap-16">
          <div className="card">
            <div className="card__head">
              <span className="h2">Active projects</span>
              <Button variant="ghost" size="sm" onClick={() => setRoute('projects')}>All <Icon.Chevron /></Button>
            </div>
            <div className="card__body col gap-12">
              {PROJECTS.slice(0, 4).map((p) => {
                const pct = Math.round((p.progress.done / p.progress.total) * 100);
                return (
                  <div key={p.id} className="row gap-12" style={{ cursor: 'pointer' }} onClick={() => setRoute(`project:${p.id}`)}>
                    <span style={{ width: 28, height: 28, borderRadius: 6, background: p.color, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      {p.key}
                    </span>
                    <div className="grow col" style={{ gap: 4 }}>
                      <div className="row" style={{ justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                        <span className="small mono">{p.progress.done}/{p.progress.total}</span>
                      </div>
                      <div style={{ height: 3, background: 'var(--surface-sunken)', borderRadius: 99 }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: p.color, borderRadius: 99 }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card__head">
              <span className="h2">Recent activity</span>
            </div>
            <div className="card__body activity">
              <ActivityItem userId="u6" when="2h ago" text="commented on WEB-12" />
              <ActivityItem userId="u3" when="5h ago" text="moved MOB-04 to In Progress" />
              <ActivityItem userId="u4" when="yesterday" text="closed WEB-37" />
              <ActivityItem userId="u8" when="yesterday" text="created OPS-07" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, sub, tone }) {
  return (
    <div className="metric">
      <div className="metric__label">{label}</div>
      <div className="metric__value" style={tone === 'danger' ? { color: 'var(--danger)' } : null}>{value}</div>
      <div className={`metric__sub${tone === 'danger' ? ' metric__sub--danger' : ''}${tone === 'success' ? ' metric__sub--success' : ''}`}>{sub}</div>
    </div>
  );
}

function ActivityItem({ userId, when, text }) {
  const u = findUser(userId);
  return (
    <div className="activity__item">
      <Avatar user={u} size="sm" />
      <div style={{ flex: 1 }}>
        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{u.name.split(' ')[0]} </span>
        {text}
        <time>{when}</time>
      </div>
    </div>
  );
}

// ── Projects Directory ─────────────────────────────────
function ProjectsDirectory({ setRoute, isAdmin }) {
  return (
    <div className="page" data-screen-label="Projects">
      <div className="page-header">
        <div>
          <div className="h1">Projects</div>
          <div className="page-header__meta">{PROJECTS.length} active projects across your workspace</div>
        </div>
        <div className="row gap-8">
          <Button variant="secondary" size="sm" icon={<Icon.Filter />}>Filter</Button>
          <div className="tabs">
            <button className="tabs__btn tabs__btn--active"><Icon.Board /> Grid</button>
            <button className="tabs__btn"><Icon.List /> List</button>
          </div>
          {isAdmin && <Button variant="primary" size="sm" icon={<Icon.Plus />}>New project</Button>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {PROJECTS.map((p) => {
          const pct = Math.round((p.progress.done / p.progress.total) * 100);
          const members = p.members.map(findUser);
          return (
            <div key={p.id} className="project-card" onClick={() => setRoute(`project:${p.id}`)}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: p.color, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {p.key}
                </span>
                <button onClick={(e)=>e.stopPropagation()} style={{ background: 'transparent', border: 0, color: 'var(--ink-3)', cursor: 'pointer', padding: 4 }}>
                  <Icon.More />
                </button>
              </div>
              <div className="col gap-4">
                <div className="project-card__title">{p.name}</div>
                <div className="project-card__desc">{p.description}</div>
              </div>
              <div className="project-card__progress">
                <div className="project-card__progress-text">
                  <span>{pct}% complete</span>
                  <span className="mono">{p.progress.done}/{p.progress.total}</span>
                </div>
                <div className="project-card__progress-bar">
                  <div className="project-card__progress-fill" style={{ width: `${pct}%`, background: p.color }} />
                </div>
              </div>
              <div className="project-card__foot">
                <AvatarStack users={members} />
                <span className="small">Updated {Math.floor(Math.random() * 6) + 1}h ago</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── My Tasks (simple list) ────────────────────────────
function MyTasksScreen({ tasks, openTask }) {
  const mine = tasks.filter((t) => t.assignee === CURRENT_USER_ID);
  const groups = [
    { label: 'Overdue',   filter: (t) => t.status !== 'done' && new Date(t.due) < TODAY },
    { label: 'This week', filter: (t) => t.status !== 'done' && new Date(t.due) >= TODAY && (new Date(t.due) - TODAY) < 7 * 86400000 },
    { label: 'Later',     filter: (t) => t.status !== 'done' && (new Date(t.due) - TODAY) >= 7 * 86400000 },
    { label: 'Recently done', filter: (t) => t.status === 'done' },
  ];

  return (
    <div className="page" data-screen-label="My Tasks">
      <div className="page-header">
        <div>
          <div className="h1">My tasks</div>
          <div className="page-header__meta">{mine.length} tasks assigned to you</div>
        </div>
        <div className="row gap-8">
          <Button variant="secondary" size="sm" icon={<Icon.Filter />}>Filter</Button>
          <Button variant="primary" size="sm" icon={<Icon.Plus />}>Create</Button>
        </div>
      </div>

      <div className="card">
        {groups.map((g, gi) => {
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
                    const p = findProject(t.projectId);
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
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                            {p.name}
                          </span>
                        </td>
                        <td style={{ width: 120 }}><StatusBadge status={t.status} /></td>
                        <td style={{ width: 110 }}>
                          <span style={{ color: due.overdue && t.status !== 'done' ? 'var(--danger)' : 'var(--ink-2)', fontWeight: due.overdue && t.status !== 'done' ? 500 : 400, fontSize: 13 }}>
                            {due.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, ProjectsDirectory, MyTasksScreen });
