import { Icon } from '../Icons.jsx';

export function Sidebar({ route, setRoute, isAdmin, onLogout, projects = [] }) {
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
        <NavItem id="tasks"     icon={<Icon.Tasks />}     label="My Tasks" />
        <NavItem id="inbox"     icon={<Icon.Inbox />}     label="Inbox" />
      </div>

      {isAdmin && (
        <div className="sidebar__section">
          <div className="sidebar__section-label">Admin</div>
          <NavItem id="users" icon={<Icon.Users />} label="User Management" />
        </div>
      )}

      {projects.length > 0 && (
        <div className="sidebar__section">
          <div className="sidebar__section-label">Projects</div>
          {projects.slice(0, 4).map((p) => (
            <button
              key={p.id}
              className={`sidebar__item${route === `project:${p.id}` ? ' sidebar__item--active' : ''}`}
              onClick={() => setRoute(`project:${p.id}`)}
            >
              <span style={{ width: 10, height: 10, borderRadius: 3, background: p.color, flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="sidebar__bottom">
        <NavItem id="settings" icon={<Icon.Settings />} label="Settings" />
        <NavItem id="logout"   icon={<Icon.Logout />}   label="Logout" onClick={onLogout} />
      </div>
    </aside>
  );
}
