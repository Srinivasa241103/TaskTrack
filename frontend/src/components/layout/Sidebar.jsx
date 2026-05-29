import { Icon } from '../Icons.jsx';

export function Sidebar({ route, setRoute, onLogout, projects = [] }) {
  const NavItem = ({ id, icon, label, group, onClick }) => {
    const active = route === id || (group && route.startsWith(group));
    return (
      <button
        className={`sidebar__item${active ? ' sidebar__item--active' : ''}`}
        onClick={() => (onClick ? onClick() : setRoute(id))}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__brand-mark" />
        <span>TaskTrack</span>
      </div>

      <div className="sidebar__section">
        <NavItem id="dashboard" icon={<Icon.Dashboard />} label="Dashboard" />
        <NavItem id="projects"  icon={<Icon.Projects />}  label="Projects" group="project" />
        <NavItem id="tasks"     icon={<Icon.Tasks />}     label="My Tasks" />
      </div>

      {projects.length > 0 && (
        <div className="sidebar__section">
          <div className="sidebar__section-label">Projects</div>
          {projects.slice(0, 6).map((p) => (
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
        <NavItem id="profile" icon={<Icon.Users />}  label="Account" />
        <NavItem id="logout"  icon={<Icon.Logout />} label="Logout" onClick={onLogout} />
      </div>
    </aside>
  );
}
