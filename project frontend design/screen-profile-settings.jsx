// Profile + Settings screens.

// ── Profile ─────────────────────────────────────────────
function ProfileScreen({ profile, setProfile }) {
  const [draft, setDraft] = React.useState(profile);
  const [saved, setSaved] = React.useState(false);
  React.useEffect(() => setDraft(profile), [profile]);

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);

  const save = () => {
    setProfile(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const cancel = () => setDraft(profile);

  return (
    <div className="page" data-screen-label="Profile">
      <div className="page-header">
        <div>
          <div className="h1">My profile</div>
          <div className="page-header__meta">How you appear across Plot · Member since Jan 2024</div>
        </div>
        <div className="row gap-8">
          {saved && (
            <span className="row gap-4" style={{ color: 'var(--success)', fontSize: 13, fontWeight: 500 }}>
              <Icon.Check /> Saved
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={cancel} style={{ opacity: dirty ? 1 : 0.4, pointerEvents: dirty ? 'auto' : 'none' }}>Discard</Button>
          <Button variant="primary" size="sm" onClick={save} style={{ opacity: dirty ? 1 : 0.5, pointerEvents: dirty ? 'auto' : 'none' }}>Save changes</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div className="col gap-16">
          {/* Avatar + identity */}
          <div className="card">
            <div className="card__head"><span className="h2">Identity</span></div>
            <div className="card__body" style={{ padding: 20 }}>
              <div className="row gap-16" style={{ marginBottom: 24 }}>
                <span
                  className="avatar avatar--lg"
                  style={{ background: draft.color, width: 72, height: 72, fontSize: 24, borderWidth: 3 }}
                >
                  {draft.initials}
                </span>
                <div className="col gap-8">
                  <div className="row gap-8">
                    <Button variant="secondary" size="sm">Upload photo</Button>
                    <Button variant="ghost" size="sm">Remove</Button>
                  </div>
                  <span className="small">PNG or JPG, at least 200×200. Max 2 MB.</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <ProfileField label="Full name" value={draft.name}
                  onChange={(v) => set('name', v)} />
                <ProfileField label="Display handle" value={draft.handle} prefix="@"
                  onChange={(v) => set('handle', v.replace(/[^a-z0-9_]/gi, '').toLowerCase())} />
                <ProfileField label="Age" value={draft.age} type="number" min={13} max={120}
                  onChange={(v) => set('age', Number(v))} />
                <ProfileField label="Role" value={draft.jobTitle}
                  onChange={(v) => set('jobTitle', v)} placeholder="e.g. Product Designer" />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="card">
            <div className="card__head"><span className="h2">Contact</span></div>
            <div className="card__body" style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <ProfileField label="Email" value={draft.email} type="email"
                onChange={(v) => set('email', v)} icon={<Icon.Mail />} />
              <ProfileField label="Phone" value={draft.phone} type="tel"
                onChange={(v) => set('phone', v)} icon={<PhoneIcon />} placeholder="+91 98765 43210" />
              <ProfileField label="Location" value={draft.location}
                onChange={(v) => set('location', v)} />
              <ProfileField label="Timezone" value={draft.timezone}
                onChange={(v) => set('timezone', v)} />
            </div>
          </div>

          {/* Bio */}
          <div className="card">
            <div className="card__head"><span className="h2">About</span></div>
            <div className="card__body" style={{ padding: 20 }}>
              <div className="field">
                <label className="field__label">Bio</label>
                <textarea
                  className="field__control"
                  value={draft.bio || ''}
                  onChange={(e) => set('bio', e.target.value)}
                  placeholder="A short description that appears on your profile."
                  style={{ minHeight: 90 }}
                />
                <span className="small" style={{ marginTop: 4 }}>{(draft.bio || '').length} / 240</span>
              </div>
            </div>
          </div>
        </div>

        {/* Aside: stats + danger zone */}
        <div className="col gap-16">
          <div className="card">
            <div className="card__head"><span className="h2">At a glance</span></div>
            <div className="card__body col gap-12" style={{ padding: 20 }}>
              <StatRow label="Tasks assigned" value={tasksAssignedTo(profile.id).length} />
              <StatRow label="Tasks completed" value={tasksAssignedTo(profile.id).filter(t=>t.status==='done').length} />
              <StatRow label="Projects" value={PROJECTS.filter(p => p.members.includes(profile.id)).length} />
              <StatRow label="Role" value={<Badge tone={profile.role === 'admin' ? 'primary' : 'neutral'} outline={profile.role !== 'admin'}>{profile.role === 'admin' ? 'Admin' : 'Member'}</Badge>} />
            </div>
          </div>

          <div className="card">
            <div className="card__head"><span className="h2">Security</span></div>
            <div className="card__body col gap-10" style={{ padding: 16 }}>
              <Button variant="secondary" size="sm" style={{ width: '100%', justifyContent: 'space-between' }}>
                <span>Change password</span><Icon.Chevron />
              </Button>
              <Button variant="secondary" size="sm" style={{ width: '100%', justifyContent: 'space-between' }}>
                <span>Two-factor authentication</span>
                <Badge tone="success" outline>On</Badge>
              </Button>
              <Button variant="secondary" size="sm" style={{ width: '100%', justifyContent: 'space-between' }}>
                <span>Active sessions</span><span className="small mono">3</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value, onChange, type = 'text', placeholder, prefix, icon, min, max }) {
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      <div style={{ position: 'relative' }}>
        {(prefix || icon) && (
          <span style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--ink-3)', fontSize: 13, pointerEvents: 'none', display: 'flex',
          }}>{prefix || icon}</span>
        )}
        <input
          className="field__control"
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min} max={max}
          style={{ paddingLeft: (prefix || icon) ? 32 : undefined }}
        />
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

const PhoneIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 2.5h2.2l1.1 2.8L5.5 6.5a8 8 0 0 0 4 4l1.2-1.3 2.8 1.1v2.2a1 1 0 0 1-1.1 1A11 11 0 0 1 2.5 3.6a1 1 0 0 1 1-1.1z" />
  </svg>
);

// ── Settings ─────────────────────────────────────────────
function SettingsScreen({ settings, setSettings, profile }) {
  const [tab, setTab] = React.useState('general');
  const tabs = [
    { id: 'general',       label: 'General' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'appearance',    label: 'Appearance' },
    { id: 'workspace',     label: 'Workspace' },
    { id: 'danger',        label: 'Advanced' },
  ];
  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  return (
    <div className="page" data-screen-label="Settings">
      <div className="page-header">
        <div>
          <div className="h1">Settings</div>
          <div className="page-header__meta">Manage your account preferences and workspace defaults</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        <nav className="col gap-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                appearance: 'none', border: 0, background: tab === t.id ? 'var(--primary-soft)' : 'transparent',
                color: tab === t.id ? 'var(--primary)' : 'var(--ink-2)',
                fontWeight: tab === t.id ? 550 : 450,
                padding: '8px 12px', borderRadius: 7, fontSize: 13.5,
                textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="col gap-16">
          {tab === 'general' && <GeneralSettings settings={settings} set={set} profile={profile} />}
          {tab === 'notifications' && <NotificationSettings settings={settings} set={set} />}
          {tab === 'appearance' && <AppearanceSettings settings={settings} set={set} />}
          {tab === 'workspace' && <WorkspaceSettings settings={settings} set={set} />}
          {tab === 'danger' && <DangerSettings />}
        </div>
      </div>
    </div>
  );
}

function SettingCard({ title, description, children }) {
  return (
    <div className="card">
      <div className="card__head" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 4 }}>
        <span className="h2">{title}</span>
        {description && <span className="small">{description}</span>}
      </div>
      <div className="card__body" style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-2)', gap: 16 }}>
      <div className="col" style={{ gap: 2, flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</span>
        {description && <span className="small">{description}</span>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        position: 'relative', width: 36, height: 20, borderRadius: 999, border: 0, padding: 0,
        background: value ? 'var(--primary)' : 'var(--border-strong)',
        cursor: 'pointer', transition: 'background 0.15s',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: value ? 18 : 2, width: 16, height: 16,
        borderRadius: '50%', background: '#fff', transition: 'left 0.15s',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

function GeneralSettings({ settings, set, profile }) {
  return (
    <>
      <SettingCard title="Language & region" description="Used for dates, numbers, and the interface language.">
        <SettingRow label="Language">
          <Select value={settings.language} onChange={(v) => set('language', v)}
            options={[
              { value: 'en-US', label: 'English (US)' },
              { value: 'en-GB', label: 'English (UK)' },
              { value: 'hi-IN', label: 'Hindi' },
              { value: 'es-ES', label: 'Español' },
              { value: 'fr-FR', label: 'Français' },
              { value: 'de-DE', label: 'Deutsch' },
            ]}
          />
        </SettingRow>
        <SettingRow label="Timezone">
          <Select value={settings.timezone} onChange={(v) => set('timezone', v)}
            options={[
              { value: 'Asia/Kolkata',     label: 'IST · Asia/Kolkata' },
              { value: 'America/New_York', label: 'EST · America/New_York' },
              { value: 'Europe/London',    label: 'GMT · Europe/London' },
              { value: 'America/Los_Angeles', label: 'PST · America/Los_Angeles' },
              { value: 'Asia/Singapore',   label: 'SGT · Asia/Singapore' },
            ]}
          />
        </SettingRow>
        <SettingRow label="Date format">
          <Select value={settings.dateFormat} onChange={(v) => set('dateFormat', v)}
            options={[
              { value: 'iso', label: '2026-05-27' },
              { value: 'us',  label: 'May 27, 2026' },
              { value: 'eu',  label: '27 May 2026' },
            ]}
          />
        </SettingRow>
        <SettingRow label="Week starts on" description="The first day shown in calendar views.">
          <Select value={settings.weekStart} onChange={(v) => set('weekStart', v)}
            options={[
              { value: 'sun', label: 'Sunday' },
              { value: 'mon', label: 'Monday' },
              { value: 'sat', label: 'Saturday' },
            ]}
          />
        </SettingRow>
      </SettingCard>

      <SettingCard title="Account" description={`Linked to ${profile.email}`}>
        <SettingRow label="Email address" description={profile.email}>
          <Button variant="secondary" size="sm">Change</Button>
        </SettingRow>
        <SettingRow label="Phone number" description={profile.phone || 'Not set'}>
          <Button variant="secondary" size="sm">Update</Button>
        </SettingRow>
        <SettingRow label="Connected accounts" description="Google · GitHub">
          <Button variant="secondary" size="sm">Manage</Button>
        </SettingRow>
      </SettingCard>
    </>
  );
}

function NotificationSettings({ settings, set }) {
  return (
    <>
      <SettingCard title="Email notifications" description="What we email you about.">
        <SettingRow label="Task assigned to me" description="When someone assigns you a task.">
          <Toggle value={settings.email.assigned} onChange={(v) => set('email', { ...settings.email, assigned: v })} />
        </SettingRow>
        <SettingRow label="Mentions in comments" description="When @your-handle is used.">
          <Toggle value={settings.email.mention} onChange={(v) => set('email', { ...settings.email, mention: v })} />
        </SettingRow>
        <SettingRow label="Status changes" description="When a task you watch changes status.">
          <Toggle value={settings.email.status} onChange={(v) => set('email', { ...settings.email, status: v })} />
        </SettingRow>
        <SettingRow label="Daily digest" description="A summary of overdue and due-today tasks each morning.">
          <Toggle value={settings.email.digest} onChange={(v) => set('email', { ...settings.email, digest: v })} />
        </SettingRow>
        <SettingRow label="Weekly report" description="Project progress every Monday.">
          <Toggle value={settings.email.weekly} onChange={(v) => set('email', { ...settings.email, weekly: v })} />
        </SettingRow>
      </SettingCard>

      <SettingCard title="In-app notifications">
        <SettingRow label="Desktop push" description="Show OS notifications for high-priority events.">
          <Toggle value={settings.push} onChange={(v) => set('push', v)} />
        </SettingRow>
        <SettingRow label="Sound" description="Play a sound when a notification arrives.">
          <Toggle value={settings.sound} onChange={(v) => set('sound', v)} />
        </SettingRow>
        <SettingRow label="Quiet hours" description="No notifications outside of these times.">
          <Select value={settings.quietHours} onChange={(v) => set('quietHours', v)}
            options={[
              { value: 'off',     label: 'Off' },
              { value: '20-08',   label: '8 PM – 8 AM' },
              { value: '22-07',   label: '10 PM – 7 AM' },
              { value: 'weekend', label: 'Weekends only' },
            ]}
          />
        </SettingRow>
      </SettingCard>
    </>
  );
}

function AppearanceSettings({ settings, set }) {
  return (
    <SettingCard title="Display" description="Personalize how Plot looks for you.">
      <SettingRow label="Theme" description="Light, dark, or follow your system.">
        <div className="tabs">
          {['light','system','dark'].map((m) => (
            <button key={m}
              className={`tabs__btn${settings.theme === m ? ' tabs__btn--active' : ''}`}
              onClick={() => set('theme', m)}
              style={{ textTransform: 'capitalize' }}
            >{m}</button>
          ))}
        </div>
      </SettingRow>
      <SettingRow label="Show task IDs" description="Display keys like WEB-12 next to titles in lists.">
        <Toggle value={settings.showKeys} onChange={(v) => set('showKeys', v)} />
      </SettingRow>
      <SettingRow label="Show avatars" description="Hide member avatars for a denser view.">
        <Toggle value={settings.showAvatars} onChange={(v) => set('showAvatars', v)} />
      </SettingRow>
      <SettingRow label="Compact mode" description="Reduces vertical padding across the app.">
        <Toggle value={settings.compact} onChange={(v) => set('compact', v)} />
      </SettingRow>
    </SettingCard>
  );
}

function WorkspaceSettings({ settings, set }) {
  return (
    <>
      <SettingCard title="Workspace" description="Visible to everyone in your workspace.">
        <SettingRow label="Workspace name" description="Used in emails and the app header.">
          <input className="field__control" style={{ width: 220 }}
            value={settings.workspaceName}
            onChange={(e) => set('workspaceName', e.target.value)} />
        </SettingRow>
        <SettingRow label="URL slug" description={`plot.dev/${settings.workspaceSlug}`}>
          <input className="field__control" style={{ width: 220 }}
            value={settings.workspaceSlug}
            onChange={(e) => set('workspaceSlug', e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase())} />
        </SettingRow>
      </SettingCard>

      <SettingCard title="Defaults" description="Applied to new tasks created in this workspace.">
        <SettingRow label="Default priority">
          <Select value={settings.defaultPriority} onChange={(v) => set('defaultPriority', v)}
            options={[
              { value: 'low',    label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high',   label: 'High' },
            ]}
          />
        </SettingRow>
        <SettingRow label="Default due date">
          <Select value={settings.defaultDue} onChange={(v) => set('defaultDue', v)}
            options={[
              { value: 'none',  label: 'No due date' },
              { value: '3d',    label: 'In 3 days' },
              { value: '1w',    label: 'In 1 week' },
              { value: '2w',    label: 'In 2 weeks' },
            ]}
          />
        </SettingRow>
      </SettingCard>
    </>
  );
}

function DangerSettings() {
  return (
    <SettingCard title="Advanced" description="These actions are irreversible.">
      <SettingRow label="Export data" description="Download all your tasks and projects as JSON.">
        <Button variant="secondary" size="sm">Export</Button>
      </SettingRow>
      <SettingRow label="Sign out everywhere" description="Logs you out of all active sessions.">
        <Button variant="secondary" size="sm">Sign out</Button>
      </SettingRow>
      <div style={{ height: 12 }} />
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--danger-soft)', borderRadius: 8, border: '1px solid rgba(199,66,59,0.2)' }}>
        <div className="col" style={{ gap: 2 }}>
          <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--danger)' }}>Delete account</span>
          <span className="small" style={{ color: 'var(--danger)', opacity: 0.85 }}>Permanently delete your profile, comments, and access to projects.</span>
        </div>
        <Button variant="danger" size="sm" icon={<Icon.Trash />}>Delete</Button>
      </div>
    </SettingCard>
  );
}

Object.assign(window, { ProfileScreen, SettingsScreen });
