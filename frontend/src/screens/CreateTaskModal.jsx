import React from 'react';
import { Icon } from '../components/Icons.jsx';
import { Button } from '../components/Button.jsx';
import { Select } from '../components/Select.jsx';
import { api } from '../services/api.js';

export function CreateTaskModal({ projects = [], users = [], projectId: initialProjectId, setTasks, onClose }) {
  const [title, setTitle]               = React.useState('');
  const [description, setDescription]   = React.useState('');
  const [projectId, setProjectId]       = React.useState(initialProjectId || projects[0]?.id || '');
  const [assignee, setAssignee]         = React.useState('');
  const [priority, setPriority]         = React.useState('Urgent');
  const [due, setDue]                   = React.useState('');
  const [labels, setLabels]             = React.useState('');
  const [error, setError]               = React.useState('');
  const [submitting, setSubmitting]     = React.useState(false);

  const project        = projects.find((p) => p.id === projectId);
  const memberIds      = new Set((project?.members ?? []).map((m) => m.id));
  const projectMembers = users.filter((u) => memberIds.has(u.id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim())  { setError('Title is required');   return; }
    if (!projectId)     { setError('Project is required'); return; }

    setError('');
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        projectId,
        priority,
      };
      if (description.trim()) payload.description = description.trim();
      if (assignee)           payload.assignee    = assignee;
      if (due)                payload.due         = due;
      const labelsArr = labels.split(',').map((s) => s.trim()).filter(Boolean);
      if (labelsArr.length > 0) payload.labels = labelsArr;

      const res = await api.tasks.create(payload);
      const newTask = res.data?.task;
      if (newTask) setTasks((prev) => [newTask, ...prev]);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal__head">
          <span className="h2" style={{ fontSize: 16 }}>Create task</span>
          <button className="modal__close" type="button" onClick={onClose}><Icon.Close /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body" style={{ display: 'grid', gap: 14 }}>
            <div className="field">
              <label className="field__label">Title</label>
              <input
                className="field__control"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
              />
            </div>

            <div className="field">
              <label className="field__label">Description</label>
              <textarea
                className="field__control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details (optional)"
                style={{ minHeight: 80 }}
              />
            </div>

            {!initialProjectId && (
              <div className="field">
                <label className="field__label">Project</label>
                <Select
                  value={projectId}
                  onChange={setProjectId}
                  options={projects.map((p) => ({ value: p.id, label: `${p.key} · ${p.name}` }))}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="field">
                <label className="field__label">Assignee</label>
                <Select
                  value={assignee}
                  onChange={setAssignee}
                  options={[
                    { value: '', label: 'Unassigned' },
                    ...projectMembers.map((u) => ({ value: u.id, label: u.name })),
                  ]}
                />
              </div>
              <div className="field">
                <label className="field__label">Priority</label>
                <Select
                  value={priority}
                  onChange={setPriority}
                  options={[
                    { value: 'Critical', label: 'Critical' },
                    { value: 'Urgent',   label: 'Urgent' },
                    { value: 'Required', label: 'Required' },
                  ]}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="field">
                <label className="field__label">Due date</label>
                <input
                  type="date"
                  className="field__control"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                />
              </div>
              <div className="field">
                <label className="field__label">Labels (comma-separated)</label>
                <input
                  className="field__control"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                  placeholder="design, frontend"
                />
              </div>
            </div>

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>
            )}

            <div className="row gap-8" style={{ justifyContent: 'flex-end', marginTop: 6 }}>
              <Button variant="ghost"   type="button" onClick={onClose}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create task'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
