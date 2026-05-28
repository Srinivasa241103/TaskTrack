// Main App — routes, state, tweaks panel.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#3730E0",
  "sidebar": "dark",
  "density": "balanced",
  "role": "admin",
  "radius": "soft"
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = [
  '#3730E0', // deep indigo (default)
  '#0F766E', // forest teal
  '#B45309', // burnt amber
  '#9333EA', // royal violet
];

const DEFAULT_PROFILE = {
  id: CURRENT_USER_ID,
  name: 'Aanya Mehta',
  handle: 'aanyamehta',
  initials: 'AM',
  color: '#6366F1',
  age: 28,
  jobTitle: 'Product Designer',
  email: 'aanya.mehta@plot.dev',
  phone: '+91 98765 43210',
  location: 'Bengaluru, India',
  timezone: 'Asia/Kolkata (GMT+5:30)',
  bio: 'Designer on the Plot core team. Lately thinking about onboarding, ticket density, and how to make Kanban boards not feel like spreadsheets.',
  role: 'admin',
};

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
  defaultPriority: 'medium',
  defaultDue: '1w',
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState('login');
  const [tasks, setTasks] = React.useState(TASKS);
  const [openTaskId, setOpenTaskId] = React.useState(null);
  const [authMode, setAuthMode] = React.useState('login');
  const [profile, setProfile] = React.useState(DEFAULT_PROFILE);
  const [settings, setSettings] = React.useState(DEFAULT_SETTINGS);

  const isAdmin = t.role === 'admin';

  // Map accent to primary color variables.
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

  const openTask = (id) => setOpenTaskId(id);
  const closeTask = () => setOpenTaskId(null);
  const currentTask = openTaskId ? tasks.find((x) => x.id === openTaskId) : null;

  // Login screen is full-bleed, no shell.
  if (route === 'login') {
    return (
      <>
        <AuthScreen mode={authMode} setMode={setAuthMode} onSubmit={() => setRoute('dashboard')} />
        <PlotTweaks t={t} setTweak={setTweak} />
      </>
    );
  }

  let screen = null;
  if (route === 'dashboard') screen = <Dashboard tasks={tasks} setRoute={setRoute} openTask={openTask} />;
  else if (route === 'projects') screen = <ProjectsDirectory setRoute={setRoute} isAdmin={isAdmin} />;
  else if (route === 'tasks') screen = <MyTasksScreen tasks={tasks} openTask={openTask} />;
  else if (route === 'users') screen = <UsersScreen />;
  else if (route === 'inbox') screen = <ComingSoon label="Inbox" />;
  else if (route === 'profile') screen = <ProfileScreen profile={profile} setProfile={setProfile} />;
  else if (route === 'settings') screen = <SettingsScreen settings={settings} setSettings={setSettings} profile={profile} />;
  else if (route.startsWith('project:')) {
    const pid = route.slice(8);
    screen = <ProjectScreen projectId={pid} tasks={tasks} setTasks={setTasks} openTask={openTask} isAdmin={isAdmin} />;
  }

  return (
    <div className="app" data-density={t.density} data-sidebar={t.sidebar}>
      <Sidebar route={route} setRoute={setRoute} isAdmin={isAdmin} />
      <div className="main">
        <TopBar onCreate={() => {}} currentUser={profile} onProfileClick={() => setRoute('profile')} />
        {screen}
      </div>
      {currentTask && (
        <TaskModal task={currentTask} tasks={tasks} setTasks={setTasks} onClose={closeTask} isAdmin={isAdmin} />
      )}
      <PlotTweaks t={t} setTweak={setTweak} />
    </div>
  );
}

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

function PlotTweaks({ t, setTweak }) {
  return (
    <TweaksPanel title="Plot · Tweaks">
      <TweakSection label="Theme" />
      <TweakColor label="Accent" value={t.accent} options={ACCENT_OPTIONS}
                  onChange={(v) => setTweak('accent', v)} />
      <TweakRadio label="Sidebar" value={t.sidebar}
                  options={[{value:'dark',label:'Dark'},{value:'light',label:'Light'}]}
                  onChange={(v) => setTweak('sidebar', v)} />
      <TweakRadio label="Radius" value={t.radius}
                  options={[{value:'soft',label:'Soft'},{value:'sharp',label:'Sharp'}]}
                  onChange={(v) => setTweak('radius', v)} />

      <TweakSection label="Layout" />
      <TweakRadio label="Density" value={t.density}
                  options={[{value:'dense',label:'Dense'},{value:'balanced',label:'Mid'},{value:'spacious',label:'Airy'}]}
                  onChange={(v) => setTweak('density', v)} />

      <TweakSection label="Demo" />
      <TweakRadio label="Role" value={t.role}
                  options={[{value:'admin',label:'Admin'},{value:'member',label:'Member'}]}
                  onChange={(v) => setTweak('role', v)} />
    </TweaksPanel>
  );
}

// ── Color helpers ──────────────────────────────────────
function darken(hex, amt) {
  const { r, g, b } = parseHex(hex);
  const f = 1 - amt;
  return rgbToHex(Math.round(r * f), Math.round(g * f), Math.round(b * f));
}
function toSoft(hex) {
  const { r, g, b } = parseHex(hex);
  // mix toward white
  const mix = (c) => Math.round(c + (255 - c) * 0.92);
  return rgbToHex(mix(r), mix(g), mix(b));
}
function parseHex(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c+c).join('') : h, 16);
  return { r: (n>>16)&255, g: (n>>8)&255, b: n&255 };
}
function rgbToHex(r,g,b) {
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
