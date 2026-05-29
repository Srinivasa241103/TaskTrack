import React from 'react';
import { Icon } from '../components/Icons.jsx';
import { AvatarStack } from '../components/Avatar.jsx';
import { Button } from '../components/Button.jsx';
import { api } from '../services/api.js';

const PROJECT_COLORS = [
  { hex: '#3730E0', label: 'Indigo' },
  { hex: '#0EA5A8', label: 'Teal' },
  { hex: '#1F9D5C', label: 'Green' },
  { hex: '#B97309', label: 'Amber' },
  { hex: '#C7423B', label: 'Red' },
  { hex: '#9333EA', label: 'Purple' },
];

function CreateProjectModal({ onClose, onCreated }) {
  const [name, setName] = React.useState('');
  const [key, setKey] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [color, setColor] = React.useState(PROJECT_COLORS[0].hex);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleNameChange = (val) => {
    setName(val);
    const derived = val.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setKey(derived);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.projects.create({ name, key, description, color });
      onCreated(res.data.project);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <div className="h2" style={{ fontWeight: 600, fontSize: 15 }}>New project</div>
          <button className="modal__close" onClick={onClose}><Icon.Close /></button>
        </div>

        <div className="modal__body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 20 }}>
            <div className="field">
              <label className="field__label">Project name *</label>
              <input
                className="field__control"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Website Relaunch"
                required
              />
            </div>

            <div className="field">
              <label className="field__label">Key *</label>
              <input
                className="field__control"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                placeholder="WEB"
                required
              />
              <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4 }}>
                2–10 uppercase letters/numbers · used as task prefix (e.g. WEB-12)
              </div>
            </div>

            <div className="field">
              <label className="field__label">Color</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.label}
                    onClick={() => setColor(c.hex)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: c.hex,
                      border: color === c.hex ? `3px solid ${c.hex}` : '3px solid transparent',
                      outline: color === c.hex ? '2px solid var(--border-strong)' : '2px solid transparent',
                      cursor: 'pointer',
                      padding: 0,
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="field">
              <label className="field__label">Description</label>
              <textarea
                className="field__control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What is this project about?"
                style={{ resize: 'vertical' }}
              />
            </div>

            {error && (
              <div style={{
                padding: '10px 12px',
                background: 'var(--danger-soft)',
                border: '1px solid rgba(199,66,59,0.25)',
                borderRadius: 7,
                color: 'var(--danger)',
                fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Creating…' : 'Create project'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function ProjectsDirectory({ projects = [], setRoute, onProjectCreated }) {
  const [showCreate, setShowCreate] = React.useState(false);

  const handleCreated = (project) => {
    onProjectCreated(project);
    setShowCreate(false);
  };

  return (
    <div className="page" data-screen-label="Projects">
      <div className="page-header">
        <div>
          <div className="h1">Projects</div>
          <div className="page-header__meta">
            {projects.length} active project{projects.length !== 1 ? 's' : ''} across your workspace
          </div>
        </div>
        <div className="row gap-8">
          <Button variant="primary" size="sm" icon={<Icon.Plus />} onClick={() => setShowCreate(true)}>
            New project
          </Button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="h2" style={{ marginBottom: 6 }}>No projects yet</div>
            <div className="small">Projects you create or join will appear here.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {projects.map((p) => {
            const total = p.progress?.total ?? 0;
            const doneCount = p.progress?.done ?? 0;
            const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
            const members = (p.members ?? []).map((m) => ({ ...m, color: m.avatarColor ?? m.color }));
            const ownerName = p.ownerName ?? (p.members ?? []).find((m) => m.id === p.ownerId)?.name;
            return (
              <div key={p.id} className="project-card" onClick={() => setRoute(`project:${p.id}`)}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span style={{ borderRadius: 6, background: p.color, color: '#fff', display: 'inline-flex', alignItems: 'center', padding: '4px 10px', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                    {p.key}
                  </span>
                </div>
                <div className="col gap-4">
                  <div className="project-card__title">{p.name}</div>
                  <div className="project-card__desc">{p.description}</div>
                </div>
                <div className="project-card__progress">
                  <div className="project-card__progress-text">
                    <span>{pct}% complete</span>
                    <span className="mono">{doneCount}/{total}</span>
                  </div>
                  <div className="project-card__progress-bar">
                    <div className="project-card__progress-fill" style={{ width: `${pct}%`, background: p.color }} />
                  </div>
                </div>
                <div className="project-card__foot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <AvatarStack users={members} />
                  {ownerName && (
                    <span className="small" style={{ color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Owner · {ownerName}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
