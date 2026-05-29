import React from 'react';
import { Icon } from '../components/Icons.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { AvatarStack } from '../components/Avatar.jsx';
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

const STATUS_ORDER = { todo: 0, in_progress: 1, done: 2 };

function MemberPanel({ users, members, memberIds, ownerId, projectId, isAdmin, onAdd, onRemove, onClose }) {
  const [search, setSearch] = React.useState('');
  const [busy, setBusy]     = React.useState(null);
  const [error, setError]   = React.useState('');
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const filtered = users.filter((u) => {
    if (memberIds.has(u.id)) return false;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q);
  });

  const handleAdd = async (user) => {
    if (busy) return;
    setError(''); setBusy(user.id);
    try {
      const res = await api.projects.addMember(projectId, user.id);
      onAdd(res.data.member);
    } catch (err) { setError(err.message); }
    finally { setBusy(null); }
  };

  const handleRemove = async (userId) => {
    if (busy) return;
    setError(''); setBusy(userId);
    try {
      await api.projects.removeMember(projectId, userId);
      onRemove(userId);
    } catch (err) { setError(err.message); }
    finally { setBusy(null); }
  };

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 6px)', right: 0, width: 300,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      zIndex: 200, overflow: 'hidden',
    }}>
      {error && (
        <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--danger)', borderBottom: '1px solid var(--border)' }}>
          {error}
        </div>
      )}

      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
        <div className="field__label" style={{ marginBottom: 6 }}>Members ({members.length})</div>
        <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {members.map((u) => (
            <div key={u.id} className="row gap-8" style={{ padding: '4px 2px' }}>
              <Avatar user={u} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--ink-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
              </div>
              {u.id === ownerId
                ? <span className="small" style={{ color: 'var(--ink-4)' }}>Admin</span>
                : isAdmin
                  ? <button title="Remove member" disabled={!!busy} onClick={() => handleRemove(u.id)}
                      style={{ background: 'transparent', border: 0, color: 'var(--ink-4)', cursor: 'pointer', padding: 2, display: 'flex' }}>
                      <Icon.Close />
                    </button>
                  : <span className="small" style={{ color: 'var(--ink-4)', textTransform: 'capitalize' }}>{u.role ?? 'member'}</span>}
            </div>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div style={{ padding: '10px 12px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 8, display: 'flex', color: 'var(--ink-4)' }}><Icon.Search /></span>
            <input autoFocus placeholder="Add member…" value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 30, height: 32, fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 8 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '14px 0', color: 'var(--ink-4)', fontSize: 13, textAlign: 'center' }}>No users to add</div>
            ) : filtered.map((u) => (
              <button key={u.id} onClick={() => handleAdd(u)} disabled={!!busy}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left' }}>
                <Avatar user={u} size="md" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ink-1)' }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                </div>
                {busy === u.id && <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>…</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProjectScreen({ projectId, tasks = [], setTasks, projects = [], users = [], openTask, currentUserId, onMemberAdded, onMemberRemoved }) {
  const findProject = (id) => projects.find((p) => p.id === id);
  const findUser    = (id) => users.find((u) => u.id === id);

  const project = findProject(projectId);
  const [view, setView]                     = React.useState('board');
  const [showPanel, setShowPanel]           = React.useState(false);
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
  const members      = (project.members ?? []).map((m) => findUser(m.id) ?? { ...m, color: m.avatarColor }).filter(Boolean);
  const memberIds    = new Set((project.members ?? []).map((m) => m.id));
  const isProjectAdmin = currentUserId === project.ownerId;
  const ownerName    = project.ownerName ?? (project.members ?? []).find((m) => m.id === project.ownerId)?.name;

  const moveTask = async (taskId, status) => {
    const t = tasks.find((x) => x.id === taskId);
    if (!t || t.status === status) return;
    if (STATUS_ORDER[status] < STATUS_ORDER[t.status]) return;
    const canEdit = currentUserId === project.ownerId || currentUserId === t.assignee;
    if (!canEdit) return;
    const snapshot = t;
    setTasks((ts) => ts.map((x) => (x.id === taskId ? { ...x, status } : x)));
    try {
      const res = await api.tasks.update(taskId, { status });
      const updated = res.data?.task;
      if (updated) setTasks((ts) => ts.map((x) => (x.id === taskId ? updated : x)));
    } catch {
      setTasks((ts) => ts.map((x) => (x.id === taskId ? snapshot : x)));
    }
  };

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
            {project.description && <div className="page-header__meta" style={{ marginTop: 8 }}>{project.description}</div>}
            {ownerName && <div className="small" style={{ color: 'var(--ink-3)', marginTop: 6 }}>Owner · {ownerName}</div>}
          </div>
          <div className="row gap-8" style={{ alignItems: 'center' }}>
            <AvatarStack users={members} max={5} />
            <div style={{ position: 'relative' }}>
              <Button variant="ghost" size="sm" icon={<Icon.Users />} onClick={() => setShowPanel((v) => !v)}>
                Members
              </Button>
              {showPanel && (
                <MemberPanel
                  users={users}
                  members={members}
                  memberIds={memberIds}
                  ownerId={project.ownerId}
                  projectId={projectId}
                  isAdmin={isProjectAdmin}
                  onAdd={(member) => onMemberAdded(member)}
                  onRemove={(userId) => onMemberRemoved(userId)}
                  onClose={() => setShowPanel(false)}
                />
              )}
            </div>
            <div style={{ width: 1, height: 22, background: 'var(--border)' }} />
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
        ? <KanbanBoard tasks={projectTasks} onMoveTask={moveTask} openTask={openTask} findUser={findUser} />
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

export function KanbanBoard({ tasks, onMoveTask, openTask, findUser }) {
  const [draggingId, setDraggingId] = React.useState(null);
  const [hoverCol, setHoverCol]     = React.useState(null);

  const draggingTask = tasks.find((t) => t.id === draggingId);
  const draggingRank = draggingTask ? STATUS_ORDER[draggingTask.status] : -1;
  const canDropIn = (colKey) => draggingRank < 0 || STATUS_ORDER[colKey] >= draggingRank;

  const onDragStart = (e, id) => { setDraggingId(id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', id); };
  const onDragEnd   = () => { setDraggingId(null); setHoverCol(null); };
  const onDragOver  = (e, col) => { if (!canDropIn(col)) return; e.preventDefault(); setHoverCol(col); };
  const onDragLeave = (col) => { if (hoverCol === col) setHoverCol(null); };
  const onDrop      = (e, col) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggingId;
    setHoverCol(null);
    setDraggingId(null);
    if (id && canDropIn(col)) onMoveTask(id, col);
  };

  return (
    <div className="kanban">
      {COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.status === col.key);
        const blocked = draggingId && !canDropIn(col.key);
        return (
          <div
            key={col.key}
            className={`kcol${hoverCol === col.key ? ' kcol--drag-over' : ''}`}
            style={blocked ? { opacity: 0.45 } : undefined}
            onDragOver={(e) => onDragOver(e, col.key)}
            onDragLeave={() => onDragLeave(col.key)}
            onDrop={(e) => onDrop(e, col.key)}
          >
            <div className="kcol__head">
              <span className="kcol__title">{col.title}</span>
              <span className="kcol__count">{items.length}</span>
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
