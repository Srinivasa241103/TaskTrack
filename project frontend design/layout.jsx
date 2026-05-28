// Layout shell: Sidebar + Topbar.

function Sidebar({ route, setRoute, isAdmin }) {
  const NavItem = ({ id, icon, label, badge, group, onClick }) => {
    const active = route === id || (group && route.startsWith(group));
    return (
      <button
        className={`sidebar__item${active ? ' sidebar__item--active' : ''}`}
        onClick={() => (onClick ? onClick() : setRoute(id))}
      >
        {icon}
        <span>{label}</span>
        {badge != null && <span className="sidebar__badge">{badge}</span>}
      </button>
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__brand-mark" />
        <span>Plot</span>
      </div>

      <div className="sidebar__section">
        <NavItem id="dashboard" icon={<Icon.Dashboard />} label="Dashboard" />
        <NavItem id="projects"  icon={<Icon.Projects />}  label="Projects" group="project" />
        <NavItem id="tasks"     icon={<Icon.Tasks />}     label="My Tasks" badge={5} />
        <NavItem id="inbox"     icon={<Icon.Inbox />}     label="Inbox"    badge={2} />
      </div>

      {isAdmin && (
        <div className="sidebar__section">
          <div className="sidebar__section-label">Admin</div>
          <NavItem id="users" icon={<Icon.Users />} label="User Management" />
        </div>
      )}

      <div className="sidebar__section">
        <div className="sidebar__section-label">Projects</div>
        {PROJECTS.slice(0, 4).map((p) => (
          <button
            key={p.id}
            className={`sidebar__item${route === `project:${p.id}` ? ' sidebar__item--active' : ''}`}
            onClick={() => setRoute(`project:${p.id}`)}
          >
            <span
              style={{
                width: 10, height: 10, borderRadius: 3, background: p.color, flexShrink: 0,
              }}
            />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
          </button>
        ))}
      </div>

      <div className="sidebar__bottom">
        <NavItem id="settings" icon={<Icon.Settings />} label="Settings" />
        <NavItem id="logout" icon={<Icon.Logout />} label="Logout" onClick={() => setRoute('login')} />
      </div>
    </aside>
  );
}

function TopBar({ onCreate, currentUser, onProfileClick }) {
  return (
    <header className="topbar">
      <div className="topbar__search">
        <span className="topbar__search-icon"><Icon.Search /></span>
        <input placeholder="Search tasks, projects, people…" />
        <span className="topbar__kbd">⌘K</span>
      </div>
      <div className="topbar__spacer" />
      <Button variant="ghost" size="sm" icon={<Icon.Inbox />} />
      <Button variant="primary" size="sm" icon={<Icon.Plus />} onClick={onCreate}>Create</Button>
      <div style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 6px' }} />
      <button
        onClick={onProfileClick}
        title="My profile"
        style={{ appearance: 'none', border: 0, background: 'transparent', padding: 0, cursor: 'pointer', borderRadius: '50%' }}
      >
        <Avatar user={currentUser} size="md" />
      </button>
    </header>
  );
}

Object.assign(window, { Sidebar, TopBar });
