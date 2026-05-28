import { Icon } from '../components/Icons.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';

export function UsersScreen({ users = [], projects = [] }) {
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="page" data-screen-label="User Management">
      <div className="page-header">
        <div>
          <div className="h1">User management</div>
          <div className="page-header__meta">{users.length} member{users.length !== 1 ? 's' : ''} · {adminCount} admin{adminCount !== 1 ? 's' : ''}</div>
        </div>
        <div className="row gap-8">
          <Button variant="secondary" size="sm" icon={<Icon.Mail />}>Send invites</Button>
          <Button variant="primary"   size="sm" icon={<Icon.Plus />}>Invite member</Button>
        </div>
      </div>

      <div className="card">
        <div className="card__head" style={{ gap: 12 }}>
          <div className="topbar__search" style={{ maxWidth: 320, flex: 1, position: 'relative' }}>
            <span className="topbar__search-icon"><Icon.Search /></span>
            <input placeholder="Search by name or email…" style={{ height: 30 }} />
          </div>
          <div className="tabs">
            <button className="tabs__btn tabs__btn--active">All <Badge tone="neutral" outline>{users.length}</Badge></button>
            <button className="tabs__btn">Admins <Badge tone="neutral" outline>{adminCount}</Badge></button>
            <button className="tabs__btn">Members</button>
            <button className="tabs__btn">Invited</button>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="empty">
            <div className="h2" style={{ marginBottom: 6 }}>No members yet</div>
            <div className="small">Invite your team to get started.</div>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Member</th>
                <th style={{ width: 220 }}>Email</th>
                <th style={{ width: 130 }}>Role</th>
                <th style={{ width: 130 }}>Projects</th>
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const projectCount = projects.filter((p) => (p.members ?? []).includes(u.id)).length;
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="row gap-12">
                        <Avatar user={u} size="md" />
                        <div className="col">
                          <span style={{ fontWeight: 500 }}>{u.name}</span>
                          <span className="small">@{u.name?.toLowerCase().replace(/\s+/g, '') ?? ''}</span>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ color: 'var(--ink-2)', fontSize: 13 }}>{u.email ?? '—'}</span></td>
                    <td>
                      {u.role === 'admin'
                        ? <Badge tone="primary">Admin</Badge>
                        : <Badge tone="neutral" outline>Member</Badge>}
                    </td>
                    <td><span className="mono small">{projectCount}</span></td>
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
        )}
      </div>
    </div>
  );
}
