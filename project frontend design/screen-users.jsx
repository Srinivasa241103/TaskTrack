// User Management (admin).

function UsersScreen() {
  return (
    <div className="page" data-screen-label="User Management">
      <div className="page-header">
        <div>
          <div className="h1">User management</div>
          <div className="page-header__meta">{USERS.length} members · {USERS.filter(u => u.role === 'admin').length} admins</div>
        </div>
        <div className="row gap-8">
          <Button variant="secondary" size="sm" icon={<Icon.Mail />}>Send invites</Button>
          <Button variant="primary" size="sm" icon={<Icon.Plus />}>Invite member</Button>
        </div>
      </div>

      <div className="card">
        <div className="card__head" style={{ gap: 12 }}>
          <div className="topbar__search" style={{ maxWidth: 320, flex: 1, position: 'relative' }}>
            <span className="topbar__search-icon"><Icon.Search /></span>
            <input placeholder="Search by name or email…" style={{ height: 30 }} />
          </div>
          <div className="tabs">
            <button className="tabs__btn tabs__btn--active">All <Badge tone="neutral" outline>{USERS.length}</Badge></button>
            <button className="tabs__btn">Admins <Badge tone="neutral" outline>{USERS.filter(u=>u.role==='admin').length}</Badge></button>
            <button className="tabs__btn">Members</button>
            <button className="tabs__btn">Invited</button>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Member</th>
              <th style={{ width: 220 }}>Email</th>
              <th style={{ width: 130 }}>Role</th>
              <th style={{ width: 130 }}>Projects</th>
              <th style={{ width: 130 }}>Last active</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {USERS.map((u, i) => {
              const projectCount = PROJECTS.filter((p) => p.members.includes(u.id)).length;
              const lastActive = ['Just now', '8m ago', '34m ago', '2h ago', '4h ago', 'Yesterday', '2 days ago', 'Last week'][i];
              return (
                <tr key={u.id}>
                  <td>
                    <div className="row gap-12">
                      <Avatar user={u} size="md" />
                      <div className="col">
                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                        <span className="small">@{u.name.toLowerCase().split(' ').join('')}</span>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ color: 'var(--ink-2)', fontSize: 13 }}>{u.name.toLowerCase().split(' ').join('.')}@plot.dev</span></td>
                  <td>
                    {u.role === 'admin' ? (
                      <Badge tone="primary">Admin</Badge>
                    ) : (
                      <Badge tone="neutral" outline>Member</Badge>
                    )}
                  </td>
                  <td><span className="mono small">{projectCount}</span></td>
                  <td><span className="small">{lastActive}</span></td>
                  <td>
                    <button style={{ background: 'transparent', border: 0, color: 'var(--ink-3)', cursor: 'pointer', padding: 4 }}>
                      <Icon.More />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { UsersScreen });
