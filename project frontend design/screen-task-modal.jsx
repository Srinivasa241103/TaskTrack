// Task Detail Modal.

function TaskModal({ task, tasks, setTasks, onClose, isAdmin }) {
  if (!task) return null;
  const project = findProject(task.projectId);
  const assignee = findUser(task.assignee);
  const projectMembers = project.members.map(findUser);

  const update = (patch) =>
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...patch } : t)));

  const onDelete = () => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    onClose();
  };

  // Activity is mostly mock but parameterized by current state.
  const activity = ACTIVITY.map((a) => ({ ...a, user: findUser(a.userId) }));

  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <span style={{ width: 22, height: 22, borderRadius: 5, background: project.color, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            {project.key}
          </span>
          <span className="mono small" style={{ color: 'var(--ink-3)' }}>{task.key}</span>
          <span style={{ color: 'var(--ink-4)' }}>·</span>
          <span className="small">{project.name}</span>
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
                {task.labels && task.labels.map((l) => <Badge key={l} tone="primary" outline>{l}</Badge>)}
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
                <Avatar user={findUser(CURRENT_USER_ID)} size="md" />
                <div style={{ flex: 1 }}>
                  <textarea
                    className="field__control"
                    placeholder="Write a comment… (Markdown supported)"
                    style={{ minHeight: 60 }}
                  />
                  <div className="row gap-8" style={{ marginTop: 8 }}>
                    <Button variant="primary" size="sm">Comment</Button>
                    <Button variant="ghost" size="sm">Cancel</Button>
                  </div>
                </div>
              </div>

              <div className="activity">
                {activity.map((a) => (
                  <div key={a.id} className="activity__item">
                    <Avatar user={a.user} size="sm" />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{a.user.name} </span>
                      {a.text}
                      <time>{a.when}</time>
                    </div>
                  </div>
                ))}
              </div>
            </main>

            <aside>
              <div className="field">
                <label className="field__label">Status</label>
                <Select value={task.status} onChange={(v) => update({ status: v })} options={[
                  { value: 'todo', label: 'To Do' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'done', label: 'Done' },
                ]} renderValue={() => <StatusBadge status={task.status} />} />
              </div>

              <div className="field">
                <label className="field__label">Assignee</label>
                <Select value={task.assignee} onChange={(v) => update({ assignee: v })}
                  options={projectMembers.map((u) => ({ value: u.id, label: u.name }))}
                  renderValue={() => assignee ? (
                    <span className="row gap-8"><Avatar user={assignee} size="sm" /><span style={{ fontSize: 13 }}>{assignee.name}</span></span>
                  ) : <span style={{ color: 'var(--ink-3)' }}>Unassigned</span>}
                />
              </div>

              <div className="field">
                <label className="field__label">Priority</label>
                <Select value={task.priority} onChange={(v) => update({ priority: v })}
                  options={[
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' },
                  ]}
                  renderValue={() => (
                    <span className="row gap-8" style={{ textTransform: 'capitalize' }}>
                      <PriorityIcon priority={task.priority} />{task.priority}
                    </span>
                  )}
                />
              </div>

              <div className="field">
                <label className="field__label">Due date</label>
                <button className="field__control" style={{ textAlign: 'left', cursor: 'pointer', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon.Cal />
                  <span style={{ fontSize: 13 }}>{new Date(task.due).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' })}</span>
                </button>
              </div>

              <div className="field">
                <label className="field__label">Reporter</label>
                <span className="row gap-8" style={{ padding: '6px 0' }}>
                  <Avatar user={findUser('u6')} size="sm" />
                  <span style={{ fontSize: 13 }}>Marcus Chen</span>
                </span>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <div className="small" style={{ marginBottom: 4 }}>Created May 21, 2026</div>
                <div className="small">Updated 2 hours ago</div>
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

// Lightweight custom select — looks consistent with the rest of the UI.
function Select({ value, onChange, options, renderValue }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="field__control"
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'var(--surface)' }}
      >
        <span style={{ flex: 1, textAlign: 'left' }}>{renderValue ? renderValue() : options.find((o)=>o.value===value)?.label}</span>
        <Icon.ChevronDown />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 20,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 8, boxShadow: 'var(--shadow)', padding: 4,
        }}>
          {options.map((o) => (
            <button key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 8px', borderRadius: 5, border: 0,
                background: value === o.value ? 'var(--primary-soft)' : 'transparent',
                color: value === o.value ? 'var(--primary)' : 'var(--ink)',
                fontSize: 13, cursor: 'pointer', textAlign: 'left',
                fontWeight: value === o.value ? 500 : 400,
              }}
              onMouseEnter={(e) => { if (value !== o.value) e.currentTarget.style.background = 'var(--hover)'; }}
              onMouseLeave={(e) => { if (value !== o.value) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ flex: 1 }}>{o.label}</span>
              {value === o.value && <Icon.Check />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { TaskModal, Select });
