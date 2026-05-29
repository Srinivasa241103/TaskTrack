import React from 'react';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { TopBar } from './components/layout/TopBar.jsx';
import { Dashboard } from './screens/Dashboard.jsx';
import { ProjectsDirectory } from './screens/ProjectsDirectory.jsx';
import { MyTasksScreen } from './screens/MyTasksScreen.jsx';
import { ProjectScreen } from './screens/ProjectScreen.jsx';
import { TaskModal } from './screens/TaskModal.jsx';
import { ProfileScreen } from './screens/ProfileScreen.jsx';
import { AuthScreen } from './screens/AuthScreen.jsx';
import { CreateTaskModal } from './screens/CreateTaskModal.jsx';
import { api } from './services/api.js';
import { darken, toSoft } from './utils/colorUtils.js';

const STORAGE_KEY = 'plot_user';
const ACCENT = '#3730E0';

function routeToPath(route) {
  if (route === 'dashboard') return '/dashboard';
  if (route === 'projects') return '/projects';
  if (route === 'tasks') return '/mytasks';
  if (route === 'profile') return '/account';
  if (route.startsWith('project:')) return `/projects/${route.slice(8)}`;
  return '/dashboard';
}

function pathToRoute(pathname) {
  const p = (pathname || '/').replace(/\/+$/, '') || '/';
  if (p === '/' || p === '/dashboard') return 'dashboard';
  if (p === '/projects') return 'projects';
  if (p === '/mytasks') return 'tasks';
  if (p === '/account') return 'profile';
  const m = p.match(/^\/projects\/(.+)$/);
  if (m) return `project:${m[1]}`;
  return 'dashboard';
}

const buildProfile = (user) => ({
  id: user.userId,
  name: user.name,
  initials: user.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() ?? '',
  color: '#6366F1',
  email: user.email,
  role: user.role,
});

function App() {
  const [currentUser, setCurrentUser] = React.useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [route, setRouteState] = React.useState(() => pathToRoute(window.location.pathname));
  const [tasks, setTasks] = React.useState([]);
  const [projects, setProjects] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [dashboard, setDashboard] = React.useState(null);
  const [openTaskId, setOpenTaskId] = React.useState(null);
  const [authMode, setAuthMode] = React.useState('login');
  const [profile, setProfile] = React.useState(null);
  const [showCreateTask, setShowCreateTask] = React.useState(false);

  const setRoute = React.useCallback((next) => {
    setRouteState(next);
    const path = routeToPath(next);
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
  }, []);

  React.useEffect(() => {
    const path = routeToPath(pathToRoute(window.location.pathname));
    if (window.location.pathname !== path) window.history.replaceState({}, '', path);

    const onPop = () => setRouteState(pathToRoute(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  React.useEffect(() => {
    setProfile(currentUser ? buildProfile(currentUser) : null);
  }, [currentUser]);

  React.useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setProjects([]);
      setUsers([]);
      setDashboard(null);
      return;
    }
    Promise.allSettled([
      api.tasks.list(),
      api.projects.list(),
      api.users.list(),
      api.dashboard.get(),
    ]).then(([tasksRes, projectsRes, usersRes, dashboardRes]) => {
      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value?.data?.tasks ?? []);
      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value?.data?.projects ?? []);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value?.data ?? usersRes.value ?? []);
      if (dashboardRes.status === 'fulfilled') setDashboard(dashboardRes.value?.data ?? null);
    });
  }, [currentUser]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', ACCENT);
    root.style.setProperty('--primary-hover', darken(ACCENT, 0.12));
    root.style.setProperty('--primary-soft', toSoft(ACCENT));
  }, []);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setCurrentUser(userData);
    setRoute('dashboard');
  };

  const handleProjectCreated = (project) => setProjects((prev) => [project, ...prev]);

  const handleMemberAdded = (projectId, member) => {
    setProjects((prev) => prev.map((p) =>
      p.id !== projectId ? p : { ...p, members: [...(p.members ?? []), member] }
    ));
  };

  const handleMemberRemoved = (projectId, userId) => {
    setProjects((prev) => prev.map((p) =>
      p.id !== projectId ? p : { ...p, members: (p.members ?? []).filter((m) => m.id !== userId) }
    ));
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
    setRoute('dashboard');
    setAuthMode('login');
  };

  if (!currentUser) {
    return <AuthScreen mode={authMode} setMode={setAuthMode} onLoginSuccess={handleLoginSuccess} />;
  }

  const openTask = (id) => setOpenTaskId(id);
  const closeTask = () => setOpenTaskId(null);
  const currentTask = openTaskId ? tasks.find((x) => x.id === openTaskId) : null;
  const currentUserId = currentUser?.userId;

  let screen = null;
  if (route === 'dashboard')
    screen = <Dashboard dashboard={dashboard} tasks={tasks} setTasks={setTasks} projects={projects} users={users} currentUserId={currentUserId} setRoute={setRoute} openTask={openTask} />;
  else if (route === 'projects')
    screen = <ProjectsDirectory projects={projects} setRoute={setRoute} onProjectCreated={handleProjectCreated} />;
  else if (route === 'tasks')
    screen = <MyTasksScreen tasks={tasks} projects={projects} currentUserId={currentUserId} openTask={openTask} />;
  else if (route === 'profile')
    screen = <ProfileScreen profile={profile} onLogout={handleLogout} />;
  else if (route.startsWith('project:')) {
    const pid = route.slice(8);
    screen = <ProjectScreen projectId={pid} tasks={tasks} setTasks={setTasks} projects={projects} users={users} openTask={openTask} currentUserId={currentUserId} onMemberAdded={(member) => handleMemberAdded(pid, member)} onMemberRemoved={(userId) => handleMemberRemoved(pid, userId)} />;
  }

  return (
    <div className="app" data-density="balanced" data-sidebar="dark">
      <Sidebar route={route} setRoute={setRoute} onLogout={handleLogout} projects={projects} />
      <div className="main">
        <TopBar currentUser={profile} onCreate={() => setShowCreateTask(true)} onProfileClick={() => setRoute('profile')} />
        {screen}
      </div>
      {currentTask && (
        <TaskModal task={currentTask} tasks={tasks} setTasks={setTasks} projects={projects} users={users} currentUser={profile} onClose={closeTask} currentUserId={currentUserId} />
      )}
      {showCreateTask && (
        <CreateTaskModal projects={projects} users={users} setTasks={setTasks} onClose={() => setShowCreateTask(false)} />
      )}
    </div>
  );
}

export default App;
