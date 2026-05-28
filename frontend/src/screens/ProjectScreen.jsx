import React from 'react';
import { Icon } from '../components/Icons.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { AvatarStack } from '../components/Avatar.jsx';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { PriorityIcon } from '../components/PriorityIcon.jsx';
import { StatusBadge } from '../components/Badge.jsx';
import { formatDue } from '../utils/dateUtils.js';
import { api } from '../services/api.js';
import { CreateTaskModal } from './CreateTaskModal.jsx';

const COLUMNS = [
  { key: 'todo',        title: 'To Do' },
  { key: 'in_progress', title: 'In Progress' },
  { key: 'done',        title: 'Done' },
];

function MemberPicker({ users, memberIds, projectId, onAdd, onClose }) {
  const [search, setSearch] = React.useState('');
  const [adding, setAdding] = React.useState(null);
  const [error, setError]   = React.useState('');
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const handleAdd = async (user) => {
    if (memberIds.has(user.id) || adding) return;
    setError('');
    setAdding(user.id);
    try {
      const res = await api.projects.addMember(projectId, user.id);
      onAdd(res.data.member);
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(null);
    }
  };

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        right: 0,
        width: 288,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        zIndex: 200,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: 8, display: 'flex', color: 'var(--ink-4)' }}>
            <Icon.Search />
          </span>
          <input
            autoFocus
            placeholder="Search members…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 30, height: 32, fontSize: 13, boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {error && (
        <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--danger)', borderBottom: '1px solid var(--border)' }}>
          {error}
        </div>
      )}

      <div style={{ maxHeight: 256, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '18px 12px', color: 'var(--ink-4)', fontSize: 13, textAlign: 'center' }}>
            No users found
          </div>
        ) : (
          filtered.map((u) => {
            const isMember = memberIds.has(u.id);
            const isAdding = adding === u.id;
            return (
              <button
                key={u.id}
                onClick={() => handleAdd(u)}
                disabled={isMember || !!adding}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 0,
                  cursor: isMember ? 'default' : 'pointer',
                  textAlign: 'left',
                  opacity: isMember ? 0.5 : 1,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { if (!isMember && !adding) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Avatar user={u} size="md" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ink-1)' }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.email}
                  </div>
                </div>
                {isMember && (
                  <span style={{ color: 'var(--primary)', display: 'flex', flexShrink: 0 }}>
                    <Icon.Check />
                  </span>
                )}
                {isAdding && (
                  <span style={{ fontSize: 11, color: 'var(--ink-3)', flexShrink: 0 }}>Adding…</span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function ProjectScreen({ projectId, tasks = [], setTasks, projects = [], users = [], openTask, isAdmin, onMemberAdded }) {
  const findProject = (id) => projects.find((p) => p.id === id);
  const findUser    = (id) => users.find((u) => u.id === id);

  const project = findProject(projectId);
  const [view, setView]                 = React.useState('board');
  const [showPicker, setShowPicker]     = React.useState(false);
  const [showCreateTask, setShowCreateTask] = React.useState(false);

  if (!project) {
    return (
      <div className="page">
        <div className="card">
          <div className="empty">
            <div className="h2" style={{ marginBottom: 6 }}>Project not found</div>
            <div className="small">This project may have been deleted or you don't have access.</div>
          </div>
        </div>
      </div>
    );
  }

  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  const members    = (project.members ?? []).map(findUser).filter(Boolean);
  const memberIds  = new Set((project.members ?? []).map((m) => m.id));

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
              <span style={{ borderRadius: 6, background: project.color, color: '#fff', display: 'inline-flex', alignItems: 'center', padding: '4px 10px', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                {project.key}
              </span>
              <div className="h1">{project.name}</div>
            </div>
            <div className="page-header__meta" style={{ marginTop: 8 }}>{project.description}</div>
          </div>
          <div className="row gap-8" style={{ alignItems: 'center' }}>
            <AvatarStack users={members} max={5} />
            {isAdmin && (
              <div style={{ position: 'relative' }}>
                <Button variant="ghost" size="sm" icon={<Icon.Plus />} onClick={() => setShowPicker((v) => !v)}>
                  Add member
                </Button>
                {showPicker && (
                  <MemberPicker
                    users={users}
                    memberIds={memberIds}
                    projectId={projectId}
                    onAdd={(member) => { onMemberAdded(member); }}
                    onClose={() => setShowPicker(false)}
                  />
                )}
              </div>
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
            <Button variant="primary" size="sm" icon={<Icon.Plus />} onClick={() => setShowCreateTask(true)}>Create task</Button>
          </div>
        </div>
      </div>

      {view === 'board'
        ? <KanbanBoard tasks={projectTasks} setTasks={setTasks} openTask={openTask} findUser={findUser} />
        : <TaskList    tasks={projectTasks} openTask={openTask} findUser={findUser} />}

      {showCreateTask && (
        <CreateTaskModal
          projects={projects}
          users={users}
          projectId={projectId}
          setTasks={setTasks}
          onClose={() => setShowCreateTask(false)}
        />
      )}
    </>
  );
}

export function KanbanBoard({ tasks, setTasks, openTask, findUser }) {
  const [draggingId, setDraggingId] = React.useState(null);
  const [hoverCol, setHoverCol]     = React.useState(null);

  const onDragStart = (e, id) => { setDraggingId(id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', id); };
  const onDragEnd   = () => { setDraggingId(null); setHoverCol(null); };
  const onDragOver  = (e, col) => { e.preventDefault(); setHoverCol(col); };
  const onDragLeave = (col) => { if (hoverCol === col) setHoverCol(null); };
  const onDrop      = (e, col) => {
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
                <div style={{ border: '1px dashed var(--border-strong)', borderRadius: 8, padding: '20px 12px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 12 }}>
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
                  findUser={findUser}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TaskCard({ task, dragging, onClick, onDragStart, onDragEnd, findUser }) {
  const due      = formatDue(task.due);
  const assignee = findUser?.(task.assignee);
  return (
    <div className={`kcard${dragging ? ' dragging' : ''}`} draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onClick}>
      <div className="kcard__title">{task.title}</div>
      {task.labels?.length > 0 && (
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
              <Icon.Cal />{due.label}
            </span>
          )}
          {assignee && <Avatar user={assignee} size="sm" />}
        </div>
      </div>
    </div>
  );
}

export function TaskList({ tasks, openTask, findUser }) {
  return (
    <div className="page" style={{ paddingTop: 0 }}>
      <div className="card">
        {tasks.length === 0 ? (
          <div className="empty"><div className="small">No tasks in this project yet.</div></div>
        ) : (
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
                const u   = findUser?.(t.assignee);
                const due = formatDue(t.due);
                return (
                  <tr key={t.id} onClick={() => openTask(t.id)}>
                    <td><span className="tbl__id mono">{t.key}</span></td>
                    <td><div className="tbl__title">{t.title}</div></td>
                    <td>
                      <span className="row gap-8" style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                        <PriorityIcon priority={t.priority} />
                        <span style={{ textTransform: 'capitalize' }}>{t.priority}</span>
                      </span>
                    </td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>
                      {u ? (
                        <span className="row gap-8" style={{ fontSize: 13 }}>
                          <Avatar user={u} size="sm" /> {u.name?.split(' ')[0]}
                        </span>
                      ) : <span className="small" style={{ color: 'var(--ink-4)' }}>Unassigned</span>}
                    </td>
                    <td>
                      {due && (
                        <span style={{ color: due.overdue && t.status !== 'done' ? 'var(--danger)' : 'var(--ink-2)', fontSize: 13 }}>
                          {due.label}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
