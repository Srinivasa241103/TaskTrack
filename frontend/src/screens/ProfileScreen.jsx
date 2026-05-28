import React from 'react';
import { Icon } from '../components/Icons.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
export function ProfileScreen({ profile, setProfile, tasks = [], projects = [] }) {
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

        {/* Aside: stats + security */}
        <div className="col gap-16">
          <div className="card">
            <div className="card__head"><span className="h2">At a glance</span></div>
            <div className="card__body col gap-12" style={{ padding: 20 }}>
              <StatRow label="Tasks assigned" value={tasks.filter((t) => t.assignee === profile.id).length} />
              <StatRow label="Tasks completed" value={tasks.filter((t) => t.assignee === profile.id && t.status === 'done').length} />
              <StatRow label="Projects" value={projects.filter((p) => (p.members ?? []).includes(profile.id)).length} />
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

export function ProfileField({ label, value, onChange, type = 'text', placeholder, prefix, icon, min, max }) {
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

export function StatRow({ label, value }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export const PhoneIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 2.5h2.2l1.1 2.8L5.5 6.5a8 8 0 0 0 4 4l1.2-1.3 2.8 1.1v2.2a1 1 0 0 1-1.1 1A11 11 0 0 1 2.5 3.6a1 1 0 0 1 1-1.1z" />
  </svg>
);
