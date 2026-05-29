import { Icon } from '../Icons.jsx';
import { Avatar } from '../Avatar.jsx';
import { Button } from '../Button.jsx';

export function TopBar({ onCreate, currentUser, onProfileClick }) {
  return (
    <header className="topbar">
      <div className="topbar__spacer" />
      <Button variant="primary" size="sm" icon={<Icon.Plus />} onClick={onCreate}>Create task</Button>
      <div style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 6px' }} />
      <button
        onClick={onProfileClick}
        title="Account"
        style={{ appearance: 'none', border: 0, background: 'transparent', padding: 0, cursor: 'pointer', borderRadius: '50%' }}
      >
        <Avatar user={currentUser} size="md" />
      </button>
    </header>
  );
}
