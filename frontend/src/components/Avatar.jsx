export function Avatar({ user, size = 'sm' }) {
  if (!user) return null;
  return (
    <span
      className={`avatar avatar--${size}`}
      style={{ background: user.color }}
      title={user.name}
    >
      {user.initials}
    </span>
  );
}

export function AvatarStack({ users, max = 4 }) {
  const shown = users.slice(0, max);
  const more = users.length - shown.length;
  return (
    <span className="avatar-stack">
      {shown.map((u) => <Avatar key={u.id} user={u} />)}
      {more > 0 && (
        <span className="avatar avatar--sm" style={{ background: '#D8D5CB', color: '#3A3B40' }}>
          +{more}
        </span>
      )}
    </span>
  );
}
