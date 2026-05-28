import React from 'react';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { TopBar } from './components/layout/TopBar.jsx';
import { useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio } from './components/TweaksPanel.jsx';
import { Dashboard } from './screens/Dashboard.jsx';
import { ProjectsDirectory } from './screens/ProjectsDirectory.jsx';
import { MyTasksScreen } from './screens/MyTasksScreen.jsx';
import { ProjectScreen } from './screens/ProjectScreen.jsx';
import { TaskModal } from './screens/TaskModal.jsx';
import { UsersScreen } from './screens/UsersScreen.jsx';
import { ProfileScreen } from './screens/ProfileScreen.jsx';
import { SettingsScreen } from './screens/SettingsScreen.jsx';
import { AuthScreen } from './screens/AuthScreen.jsx';
import { api } from './services/api.js';
import { darken, toSoft } from './utils/colorUtils.js';

// ── Constants ──────────────────────────────────────────────
const STORAGE_KEY = 'plot_user';

const TWEAK_DEFAULTS = {
  accent: '#3730E0',
  sidebar: 'dark',
  density: 'balanced',
  radius: 'soft',
};

const ACCENT_OPTIONS = [
  '#3730E0',
  '#0F766E',
  '#B45309',
  '#9333EA',
];

const DEFAULT_SETTINGS = {
  language: 'en-US',
  timezone: 'Asia/Kolkata',
  dateFormat: 'us',
  weekStart: 'mon',
  email: { assigned: true, mention: true, status: false, digest: true, weekly: false },
  push: true,
  sound: false,
  quietHours: '22-07',
  theme: 'light',
  showKeys: true,
  showAvatars: true,
  compact: false,
  workspaceName: 'Acme Studio',
  workspaceSlug: 'acme',
  defaultPriority: 'Urgent',
  defaultDue: '1w',
};

// Build a profile object from what the server returns on login/signup
const buildProfile = (user) => ({
  id: user.userId,
  name: user.name,
  handle: user.name?.toLowerCase().replace(/\s+/g, '') ?? '',
  initials: user.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() ?? '',
  color: '#6366F1',
  email: user.email,
  role: user.role,
  jobTitle: '',
  phone: '',
  location: '',
  timezone: 'Asia/Kolkata (GMT+5:30)',
  bio: '',
  age: null,
});

// ── App ────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Restore session from localStorage on mount (user info only — token stays in httpOnly cookie)
  const [currentUser, setCurrentUser] = React.useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [route, setRoute]       = React.useState('dashboard');
  const [tasks, setTasks]       = React.useState([]);
  const [projects, setProjects] = React.useState([]);
  const [users, setUsers]       = React.useState([]);
  const [openTaskId, setOpenTaskId] = React.useState(null);
  const [authMode, setAuthMode] = React.useState('login');
  const [profile, setProfile]   = React.useState(null);
  const [settings, setSettings] = React.useState(DEFAULT_SETTINGS);

  // Sync profile whenever currentUser changes (login / logout)
  React.useEffect(() => {
    setProfile(currentUser ? buildProfile(currentUser) : null);
  }, [currentUser]);

  // Fetch app data from API whenever the user logs in
  React.useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setProjects([]);
      setUsers([]);
      return;
    }
    Promise.allSettled([
      api.tasks.list(),
      api.projects.list(),
      api.users.list(),
    ]).then(([tasksRes, projectsRes, usersRes]) => {
      if (tasksRes.status === 'fulfilled')    setTasks(tasksRes.value?.data?.tasks ?? []);
      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value?.data?.projects ?? []);
      if (usersRes.status === 'fulfilled')    setUsers(usersRes.value?.data ?? usersRes.value ?? []);
    });
  }, [currentUser]);

  // Apply accent / radius CSS vars
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', t.accent);
    root.style.setProperty('--primary-hover', darken(t.accent, 0.12));
    root.style.setProperty('--primary-soft', toSoft(t.accent));
    if (t.radius === 'sharp') {
      root.style.setProperty('--radius-sm', '3px');
      root.style.setProperty('--radius', '4px');
      root.style.setProperty('--radius-lg', '6px');
    } else {
      root.style.setProperty('--radius-sm', '6px');
      root.style.setProperty('--radius', '8px');
      root.style.setProperty('--radius-lg', '12px');
    }
  }, [t.accent, t.radius]);

  // ── Auth handlers ──────────────────────────────────────
  const handleLoginSuccess = (userData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setCurrentUser(userData);
    setRoute('dashboard');
  };

  const handleProjectCreated = (project) => {
    setProjects((prev) => [project, ...prev]);
  };

  const handleMemberAdded = (projectId, member) => {
    setProjects((prev) => prev.map((p) =>
      p.id !== projectId ? p : { ...p, members: [...(p.members ?? []), member] }
    ));
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
    setRoute('dashboard'); // reset so next login lands on dashboard
    setAuthMode('login');
  };

  // ── Protected gate ─────────────────────────────────────
  // If no session, only show the auth screen — no internal route is accessible
  if (!currentUser) {
    return (
      <>
        <AuthScreen mode={authMode} setMode={setAuthMode} onLoginSuccess={handleLoginSuccess} />
        <PlotTweaks t={t} setTweak={setTweak} />
      </>
    );
  }

  // ── Authenticated shell ────────────────────────────────
  const isAdmin = currentUser.role === 'admin';

  const openTask  = (id) => setOpenTaskId(id);
  const closeTask = () => setOpenTaskId(null);
  const currentTask = openTaskId ? tasks.find((x) => x.id === openTaskId) : null;

  const currentUserId = currentUser?.userId;

  let screen = null;
  if (route === 'dashboard')
    screen = <Dashboard tasks={tasks} setTasks={setTasks} projects={projects} users={users} currentUserId={currentUserId} setRoute={setRoute} openTask={openTask} />;
  else if (route === 'projects')
    screen = <ProjectsDirectory projects={projects} setRoute={setRoute} isAdmin={isAdmin} onProjectCreated={handleProjectCreated} />;
  else if (route === 'tasks')
    screen = <MyTasksScreen tasks={tasks} projects={projects} currentUserId={currentUserId} openTask={openTask} />;
  else if (route === 'users')
    screen = <UsersScreen users={users} projects={projects} />;
  else if (route === 'inbox')
    screen = <ComingSoon label="Inbox" />;
  else if (route === 'profile')
    screen = <ProfileScreen profile={profile} setProfile={setProfile} tasks={tasks} projects={projects} />;
  else if (route === 'settings')
    screen = <SettingsScreen settings={settings} setSettings={setSettings} profile={profile} />;
  else if (route.startsWith('project:')) {
    const pid = route.slice(8);
    screen = <ProjectScreen projectId={pid} tasks={tasks} setTasks={setTasks} projects={projects} users={users} openTask={openTask} isAdmin={isAdmin} onMemberAdded={(member) => handleMemberAdded(pid, member)} />;
  }

  return (
    <div className="app" data-density={t.density} data-sidebar={t.sidebar}>
      <Sidebar route={route} setRoute={setRoute} isAdmin={isAdmin} onLogout={handleLogout} projects={projects} />
      <div className="main">
        <TopBar onCreate={() => {}} currentUser={profile} onProfileClick={() => setRoute('profile')} />
        {screen}
      </div>
      {currentTask && (
        <TaskModal task={currentTask} tasks={tasks} setTasks={setTasks} projects={projects} users={users} currentUser={profile} onClose={closeTask} isAdmin={isAdmin} />
      )}
      <PlotTweaks t={t} setTweak={setTweak} />
    </div>
  );
}

// ── ComingSoon placeholder ─────────────────────────────────
function ComingSoon({ label }) {
  return (
    <div className="page">
      <div className="page-header">
        <div className="h1">{label}</div>
      </div>
      <div className="card">
        <div className="empty">
          <div className="h2" style={{ marginBottom: 6 }}>{label} is coming soon</div>
          <div className="small">This screen is part of the next iteration.</div>
        </div>
      </div>
    </div>
  );
}

// ── Tweaks panel ───────────────────────────────────────────
function PlotTweaks({ t, setTweak }) {
  return (
    <TweaksPanel title="Plot · Tweaks">
      <TweakSection label="Theme" />
      <TweakColor label="Accent" value={t.accent} options={ACCENT_OPTIONS}
                  onChange={(v) => setTweak('accent', v)} />
      <TweakRadio label="Sidebar" value={t.sidebar}
                  options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]}
                  onChange={(v) => setTweak('sidebar', v)} />
      <TweakRadio label="Radius" value={t.radius}
                  options={[{ value: 'soft', label: 'Soft' }, { value: 'sharp', label: 'Sharp' }]}
                  onChange={(v) => setTweak('radius', v)} />
      <TweakSection label="Layout" />
      <TweakRadio label="Density" value={t.density}
                  options={[{ value: 'dense', label: 'Dense' }, { value: 'balanced', label: 'Mid' }, { value: 'spacious', label: 'Airy' }]}
                  onChange={(v) => setTweak('density', v)} />
    </TweaksPanel>
  );
}

export default App;
