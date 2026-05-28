export function Button({ variant = 'ghost', size = 'md', icon, children, onClick, type = 'button', style, disabled }) {
  const cls = ['btn', `btn--${variant}`, size === 'sm' && 'btn--sm', !children && 'btn--icon']
    .filter(Boolean)
    .join(' ');
  return (
    <button type={type} className={cls} onClick={onClick} style={style} disabled={disabled}>
      {icon}
      {children}
    </button>
  );
}
