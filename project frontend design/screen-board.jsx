// Project Detail: Kanban + List view, with drag/drop.

const COLUMNS = [
  { key: 'todo',        title: 'To Do' },
  { key: 'in_progress', title: 'In Progress' },
  { key: 'done',        title: 'Done' },
];

function ProjectScreen({ projectId, tasks, setTasks, openTask, isAdmin }) {
  const project = findProject(projectId);
  const [view, setView] = React.useState('board');
  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  const members = project.members.map(findUser);

  return (
    <>
      <div className="page" style={{ paddingBottom: 16 }} data-screen-label={`Project · ${project.name}`}>
        <div className="page-header">
          <div>
            <div className="row gap-8" style={{ color: 'var(--ink-3)', fontSize: 12.5, marginBottom: 6 }}>
              <span>Projects</span>
              <Icon.Chevron />
              <span className="mono" style={{ color: 'var(--ink-3)' }}>{project.key}</span>
            </div>
            <div className="row gap-12">
              <span style={{ width: 28, height: 28, borderRadius: 7, background: project.color, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {project.key}
              </span>
              <div className="h1">{project.name}</div>
            </div>
            <div className="page-header__meta" style={{ marginTop: 8 }}>{project.description}</div>
          </div>
          <div className="row gap-8" style={{ alignItems: 'center' }}>
            <AvatarStack users={members} max={5} />
            {isAdmin && (
              <Button variant="ghost" size="sm" icon={<Icon.Plus />}>Add member</Button>
            )}
            <div style={{ width: 1, height: 22, background: 'var(--border)' }} />
            <Button variant="secondary" size="sm" icon={<Icon.Filter />}>Filter</Button>
            <div className="tabs">
              <button className={`tabs__btn${view === 'board' ? ' tabs__btn--active' : ''}`} onClick={() => setView('board')}>
                <Icon.Board /> Board
              </button>
              <button className={`tabs__btn${view === 'list' ? ' tabs__btn--active' : ''}`} onClick={() => setView('list')}>
                <Icon.List /> List
              </button>
            </div>
            <Button variant="primary" size="sm" icon={<Icon.Plus />}>Create task</Button>
          </div>
        </div>
      </div>

      {view === 'board'
        ? <KanbanBoard tasks={projectTasks} setTasks={setTasks} openTask={openTask} />
        : <TaskList tasks={projectTasks} openTask={openTask} />}
    </>
  );
}

function KanbanBoard({ tasks, setTasks, openTask }) {
  const [draggingId, setDraggingId] = React.useState(null);
  const [hoverCol, setHoverCol] = React.useState(null);

  const onDragStart = (e, id) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };
  const onDragEnd = () => { setDraggingId(null); setHoverCol(null); };
  const onDragOver = (e, col) => { e.preventDefault(); setHoverCol(col); };
  const onDragLeave = (col) => { if (hoverCol === col) setHoverCol(null); };
  const onDrop = (e, col) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggingId;
    if (!id) return;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: col } : t)));
    setHoverCol(null);
    setDraggingId(null);
  };

  return (
    <div className="kanban">
      {COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.status === col.key);
        return (
          <div
            key={col.key}
            className={`kcol${hoverCol === col.key ? ' kcol--drag-over' : ''}`}
            onDragOver={(e) => onDragOver(e, col.key)}
            onDragLeave={() => onDragLeave(col.key)}
            onDrop={(e) => onDrop(e, col.key)}
          >
            <div className="kcol__head">
              <span className="kcol__title">{col.title}</span>
              <span className="kcol__count">{items.length}</span>
              <button className="kcol__add" title="Add task"><Icon.Plus /></button>
            </div>
            <div className="kcol__list">
              {items.length === 0 && (
                <div style={{
                  border: '1px dashed var(--border-strong)', borderRadius: 8, padding: '20px 12px',
                  textAlign: 'center', color: 'var(--ink-4)', fontSize: 12,
                }}>
                  Drop tasks here
                </div>
              )}
              {items.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  dragging={draggingId === t.id}
                  onClick={() => openTask(t.id)}
                  onDragStart={(e) => onDragStart(e, t.id)}
                  onDragEnd={onDragEnd}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TaskCard({ task, dragging, onClick, onDragStart, onDragEnd }) {
  const due = formatDue(task.due);
  const assignee = findUser(task.assignee);
  return (
    <div
      className={`kcard${dragging ? ' dragging' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      <div className="kcard__title">{task.title}</div>

      {task.labels && task.labels.length > 0 && (
        <div className="row gap-4" style={{ flexWrap: 'wrap' }}>
          {task.labels.map((l) => <Badge key={l} tone="primary" outline>{l}</Badge>)}
        </div>
      )}

      <div className="kcard__foot">
        <div className="row gap-8">
          <span className="kcard__key mono">{task.key}</span>
          <PriorityIcon priority={task.priority} />
        </div>
        <div className="row gap-8">
          {due && (
            <span className={`kcard__due${due.overdue && task.status !== 'done' ? ' kcard__due--overdue' : ''}`}>
              <Icon.Cal />
              {due.label}
            </span>
          )}
          {assignee && <Avatar user={assignee} size="sm" />}
        </div>
      </div>
    </div>
  );
}

function TaskList({ tasks, openTask }) {
  return (
    <div className="page" style={{ paddingTop: 0 }}>
      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 88 }}>Key</th>
              <th>Title</th>
              <th style={{ width: 110 }}>Priority</th>
              <th style={{ width: 130 }}>Status</th>
              <th style={{ width: 110 }}>Assignee</th>
              <th style={{ width: 110 }}>Due</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => {
              const u = findUser(t.assignee);
              const due = formatDue(t.due);
              return (
                <tr key={t.id} onClick={() => openTask(t.id)}>
                  <td><span className="tbl__id mono">{t.key}</span></td>
                  <td>
                    <div className="tbl__title">{t.title}</div>
                  </td>
                  <td>
                    <span className="row gap-8" style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                      <PriorityIcon priority={t.priority} />
                      <span style={{ textTransform: 'capitalize' }}>{t.priority}</span>
                    </span>
                  </td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>
                    <span className="row gap-8" style={{ fontSize: 13 }}>
                      <Avatar user={u} size="sm" /> {u.name.split(' ')[0]}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: due.overdue && t.status !== 'done' ? 'var(--danger)' : 'var(--ink-2)', fontSize: 13 }}>
                      {due.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { ProjectScreen, KanbanBoard, TaskCard, TaskList });
