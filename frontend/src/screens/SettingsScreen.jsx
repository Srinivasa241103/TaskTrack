import React from 'react';
import { Button } from '../components/Button.jsx';
import { Select } from '../components/Select.jsx';
import { Icon } from '../components/Icons.jsx';

export function SettingsScreen({ settings, setSettings, profile }) {
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
          {tab === 'general'       && <GeneralSettings settings={settings} set={set} profile={profile} />}
          {tab === 'notifications' && <NotificationSettings settings={settings} set={set} />}
          {tab === 'appearance'    && <AppearanceSettings settings={settings} set={set} />}
          {tab === 'workspace'     && <WorkspaceSettings settings={settings} set={set} />}
          {tab === 'danger'        && <DangerSettings />}
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

export function Toggle({ value, onChange }) {
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
              { value: 'Asia/Kolkata',        label: 'IST · Asia/Kolkata' },
              { value: 'America/New_York',     label: 'EST · America/New_York' },
              { value: 'Europe/London',        label: 'GMT · Europe/London' },
              { value: 'America/Los_Angeles',  label: 'PST · America/Los_Angeles' },
              { value: 'Asia/Singapore',       label: 'SGT · Asia/Singapore' },
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
              { value: 'Required', label: 'Required' },
              { value: 'Urgent',   label: 'Urgent' },
              { value: 'Critical', label: 'Critical' },
            ]}
          />
        </SettingRow>
        <SettingRow label="Default due date">
          <Select value={settings.defaultDue} onChange={(v) => set('defaultDue', v)}
            options={[
              { value: 'none', label: 'No due date' },
              { value: '3d',   label: 'In 3 days' },
              { value: '1w',   label: 'In 1 week' },
              { value: '2w',   label: 'In 2 weeks' },
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
