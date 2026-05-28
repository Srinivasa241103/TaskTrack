import React from 'react';
import { Icon } from '../components/Icons.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { Select } from '../components/Select.jsx';
import { StatusBadge } from '../components/Badge.jsx';
import { PriorityIcon } from '../components/PriorityIcon.jsx';

export function TaskModal({ task, tasks, setTasks, projects = [], users = [], currentUser, onClose, isAdmin }) {
  if (!task) return null;

  const findProject = (id) => projects.find((p) => p.id === id);
  const findUser    = (id) => users.find((u) => u.id === id);

  const project       = findProject(task.projectId);
  const assignee      = findUser(task.assignee);
  const projectMembers = (project?.members ?? []).map(findUser).filter(Boolean);

  const update = (patch) =>
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...patch } : t)));

  const onDelete = () => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    onClose();
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
          <div className="task-modal-grid">
            <main>
              <input
                className="field__control field__control--inline"
                style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ink)' }}
                value={task.title}
                onChange={(e) => update({ title: e.target.value })}
              />

              <div className="row gap-8" style={{ margin: '14px 0 22px', flexWrap: 'wrap' }}>
                {task.labels?.map((l) => <Badge key={l} tone="primary" outline>{l}</Badge>)}
                <Button variant="ghost" size="sm" icon={<Icon.Plus />}>Add label</Button>
              </div>

              <div className="field" style={{ marginBottom: 24 }}>
                <label className="field__label">Description</label>
                <textarea
                  className="field__control"
                  defaultValue={task.description || ''}
                  placeholder="Add a description, acceptance criteria, or links…"
                  style={{ minHeight: 120 }}
                />
              </div>

              <div className="h2" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                Activity
              </div>

              <div className="row gap-12" style={{ marginBottom: 18, alignItems: 'flex-start' }}>
                {currentUser && <Avatar user={currentUser} size="md" />}
                <div style={{ flex: 1 }}>
                  <textarea className="field__control" placeholder="Write a comment… (Markdown supported)" style={{ minHeight: 60 }} />
                  <div className="row gap-8" style={{ marginTop: 8 }}>
                    <Button variant="primary" size="sm">Comment</Button>
                    <Button variant="ghost"   size="sm">Cancel</Button>
                  </div>
                </div>
              </div>

              <div className="activity">
                <div className="empty" style={{ padding: '16px 0' }}>
                  <div className="small">No activity yet.</div>
                </div>
              </div>
            </main>

            <aside>
              <div className="field">
                <label className="field__label">Status</label>
                <Select value={task.status} onChange={(v) => update({ status: v })}
                  options={[
                    { value: 'todo',        label: 'To Do' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'done',        label: 'Done' },
                  ]}
                  renderValue={() => <StatusBadge status={task.status} />}
                />
              </div>

              <div className="field">
                <label className="field__label">Assignee</label>
                <Select value={task.assignee} onChange={(v) => update({ assignee: v })}
                  options={projectMembers.map((u) => ({ value: u.id, label: u.name }))}
                  renderValue={() => assignee
                    ? <span className="row gap-8"><Avatar user={assignee} size="sm" /><span style={{ fontSize: 13 }}>{assignee.name}</span></span>
                    : <span style={{ color: 'var(--ink-3)' }}>Unassigned</span>
                  }
                />
              </div>

              <div className="field">
                <label className="field__label">Priority</label>
                <Select value={task.priority} onChange={(v) => update({ priority: v })}
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
              </div>

              {task.due && (
                <div className="field">
                  <label className="field__label">Due date</label>
                  <button className="field__control" style={{ textAlign: 'left', cursor: 'pointer', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon.Cal />
                    <span style={{ fontSize: 13 }}>
                      {new Date(task.due).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </button>
                </div>
              )}

              <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                {task.created_at && <div className="small" style={{ marginBottom: 4 }}>Created {new Date(task.created_at).toLocaleDateString()}</div>}
                {task.updated_at && <div className="small">Updated {new Date(task.updated_at).toLocaleDateString()}</div>}
              </div>

              {isAdmin && (
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
