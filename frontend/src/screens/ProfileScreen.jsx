import { Avatar } from '../components/Avatar.jsx';
import { Button } from '../components/Button.jsx';
import { Icon } from '../components/Icons.jsx';

export function ProfileScreen({ profile, onLogout }) {
  if (!profile) return null;

  const Row = ({ label, value }) => (
    <div className="row" style={{ justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border-2)' }}>
      <span className="field__label" style={{ margin: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--ink-1)' }}>{value}</span>
    </div>
  );

  return (
    <div className="page" data-screen-label="Account">
      <div className="page-header">
        <div className="h1">Account</div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card__body col gap-16">
          <div className="row gap-12">
            <Avatar user={profile} size="lg" />
            <div className="col" style={{ gap: 2 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{profile.name}</div>
              <div className="small" style={{ color: 'var(--ink-3)' }}>{profile.email}</div>
            </div>
          </div>

          <div className="col">
            <Row label="Name" value={profile.name} />
            <Row label="Email" value={profile.email} />
            <Row label="Role" value={<span style={{ textTransform: 'capitalize' }}>{profile.role ?? 'member'}</span>} />
          </div>

          <div>
            <Button variant="danger" size="sm" icon={<Icon.Logout />} onClick={onLogout}>Log out</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
