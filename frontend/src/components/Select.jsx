import React from 'react';
import { Icon } from './Icons.jsx';

export function Select({ value, onChange, options, renderValue }) {
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
        <span style={{ flex: 1, textAlign: 'left' }}>
          {renderValue ? renderValue() : options.find((o) => o.value === value)?.label}
        </span>
        <Icon.ChevronDown />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 20,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 8, boxShadow: 'var(--shadow)', padding: 4,
        }}>
          {options.map((o) => (
            <button
              key={o.value}
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
