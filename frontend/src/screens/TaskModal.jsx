import React from 'react';
import { Icon } from '../components/Icons.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { Button } from '../components/Button.jsx';
import { Select } from '../components/Select.jsx';
import { StatusBadge } from '../components/Badge.jsx';
import { PriorityIcon } from '../components/PriorityIcon.jsx';
import { api } from '../services/api.js';

const toDateInputValue = (d) => {
  if (!d) return '';
  const s = typeof d === 'string' ? d : new Date(d).toISOString();
  return s.slice(0, 10);
};

const STATUS_OPTIONS = [
  { value: 'todo',        label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done',        label: 'Done' },
];
const STATUS_ORDER = { todo: 0, in_progress: 1, done: 2 };

export function TaskModal({ task, setTasks, projects = [], users = [], onClose, currentUserId }) {
  const findProject = (id) => projects.find((p) => p.id === id);
  const findUser    = (id) => users.find((u) => u.id === id);

  const [title, setTitle]             = React.useState(task?.title ?? '');
  const [description, setDescription] = React.useState(task?.description ?? '');
  const [error, setError]             = React.useState('');

  if (!task) return null;

  const project        = findProject(task.projectId);
  const assignee       = findUser(task.assignee);
  const projectMembers = (project?.members ?? []).map((m) => findUser(m.id)).filter(Boolean);

  const isAdmin = currentUserId === project?.ownerId;
  const canEdit = isAdmin || currentUserId === task.assignee;
  const canDelete = isAdmin;

  const persist = async (patch) => {
    const snapshot = task;
    setError('');
    setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, ...patch } : t)));
    try {
      const res = await api.tasks.update(task.id, patch);
      const updated = res.data?.task;
      if (updated) setTasks((ts) => ts.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      setError(err.message);
      setTasks((ts) => ts.map((t) => (t.id === task.id ? snapshot : t)));
    }
  };

  const persistTitle = () => {
    const next = title.trim();
    if (next && next !== task.title) persist({ title: next });
  };
  const persistDescription = () => {
    if (description !== (task.description ?? '')) persist({ description });
  };

  const onDelete = async () => {
    setError('');
    try {
      await api.tasks.delete(task.id);
      setTasks((ts) => ts.filter((t) => t.id !== task.id));
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          {project && (
            <span style={{ width: 22, height: 22, borderRadius: 5, background: project.color, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {project.key}
            </span>
          )}
          <span className="mono small" style={{ color: 'var(--ink-3)' }}>{task.key}</span>
          <span style={{ color: 'var(--ink-4)' }}>·</span>
          <span className="small">{project?.name ?? '—'}</span>
          <button className="modal__close" onClick={onClose}><Icon.Close /></button>
        </div>

        <div className="modal__body">
          {error && (
            <div style={{ marginBottom: 14, padding: '8px 12px', background: 'var(--danger-soft)', border: '1px solid rgba(199,66,59,0.25)', borderRadius: 7, color: 'var(--danger)', fontSize: 13 }}>
              {error}
            </div>
          )}
          {!canEdit && (
            <div style={{ marginBottom: 14, fontSize: 12.5, color: 'var(--ink-3)' }}>
              You can only update tasks assigned to you. This task is read-only.
            </div>
          )}

          <div className="task-modal-grid">
            <main>
              <input
                className="field__control field__control--inline"
                style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ink)' }}
                value={title}
                disabled={!canEdit}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={persistTitle}
              />

              <div className="field" style={{ marginTop: 18 }}>
                <label className="field__label">Description</label>
                <textarea
                  className="field__control"
                  value={description}
                  disabled={!canEdit}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={persistDescription}
                  placeholder="Add a description…"
                  style={{ minHeight: 140 }}
                />
              </div>
            </main>

            <aside>
              <div className="field">
                <label className="field__label">Status</label>
                {canEdit ? (
                  <Select value={task.status} onChange={(v) => persist({ status: v })}
                    options={STATUS_OPTIONS.filter((o) => STATUS_ORDER[o.value] >= STATUS_ORDER[task.status])}
                    renderValue={() => <StatusBadge status={task.status} />}
                  />
                ) : <StatusBadge status={task.status} />}
              </div>

              <div className="field">
                <label className="field__label">Assignee</label>
                {canEdit ? (
                  <Select value={task.assignee} onChange={(v) => persist({ assignee: v || null })}
                    options={[
                      { value: '', label: 'Unassigned' },
                      ...projectMembers.map((u) => ({ value: u.id, label: u.name })),
                    ]}
                    renderValue={() => assignee
                      ? <span className="row gap-8"><Avatar user={assignee} size="sm" /><span style={{ fontSize: 13 }}>{assignee.name}</span></span>
                      : <span style={{ color: 'var(--ink-3)' }}>Unassigned</span>
                    }
                  />
                ) : (
                  assignee
                    ? <span className="row gap-8"><Avatar user={assignee} size="sm" /><span style={{ fontSize: 13 }}>{assignee.name}</span></span>
                    : <span style={{ color: 'var(--ink-3)', fontSize: 13 }}>Unassigned</span>
                )}
              </div>

              <div className="field">
                <label className="field__label">Priority</label>
                {canEdit ? (
                  <Select value={task.priority} onChange={(v) => persist({ priority: v })}
                    options={[
                      { value: 'Critical', label: 'Critical' },
                      { value: 'Urgent',   label: 'Urgent' },
                      { value: 'Required', label: 'Required' },
                    ]}
                    renderValue={() => (
                      <span className="row gap-8" style={{ textTransform: 'capitalize' }}>
                        <PriorityIcon priority={task.priority} />{task.priority}
                      </span>
                    )}
                  />
                ) : (
                  <span className="row gap-8" style={{ textTransform: 'capitalize', fontSize: 13 }}>
                    <PriorityIcon priority={task.priority} />{task.priority}
                  </span>
                )}
              </div>

              <div className="field">
                <label className="field__label">Due date</label>
                {isAdmin ? (
                  <input
                    type="date"
                    className="field__control"
                    value={toDateInputValue(task.due)}
                    onChange={(e) => persist({ due: e.target.value || null })}
                  />
                ) : task.due ? (
                  <div className="row gap-8" style={{ fontSize: 13 }}>
                    <Icon.Cal />
                    {new Date(task.due).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                ) : (
                  <span style={{ color: 'var(--ink-3)', fontSize: 13 }}>No due date</span>
                )}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                {task.createdAt && <div className="small" style={{ marginBottom: 4 }}>Created {new Date(task.createdAt).toLocaleDateString()}</div>}
                {task.updatedAt && <div className="small">Updated {new Date(task.updatedAt).toLocaleDateString()}</div>}
              </div>

              {canDelete && (
                <Button variant="danger" size="sm" icon={<Icon.Trash />} onClick={onDelete} style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}>
                  Delete task
                </Button>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
