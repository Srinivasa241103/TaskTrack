import { Icon } from '../Icons.jsx';
import { Avatar } from '../Avatar.jsx';
import { Button } from '../Button.jsx';

export function TopBar({ onCreate, currentUser, onProfileClick }) {
  return (
    <header className="topbar">
      <div className="topbar__search">
        <span className="topbar__search-icon"><Icon.Search /></span>
        <input placeholder="Search tasks, projects, people…" />
        <span className="topbar__kbd">⌘K</span>
      </div>
      <div className="topbar__spacer" />
      <Button variant="ghost" size="sm" icon={<Icon.Inbox />} />
      <Button variant="primary" size="sm" icon={<Icon.Plus />} onClick={onCreate}>Create</Button>
      <div style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 6px' }} />
      <button
        onClick={onProfileClick}
        title="My profile"
        style={{ appearance: 'none', border: 0, background: 'transparent', padding: 0, cursor: 'pointer', borderRadius: '50%' }}
      >
        <Avatar user={currentUser} size="md" />
      </button>
    </header>
  );
}
