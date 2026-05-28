// Icons + primitive components for Plot.
// All icons are 16×16, currentColor strokes, 1.5 stroke-width.

export const Icon = {
  Dashboard: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="5.5" height="5.5" rx="1" />
      <rect x="8.5" y="2" width="5.5" height="5.5" rx="1" />
      <rect x="2" y="8.5" width="5.5" height="5.5" rx="1" />
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" />
    </svg>,

  Projects: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4.5a1.5 1.5 0 0 1 1.5-1.5h2.4a1.5 1.5 0 0 1 1.2.6l.6.8a1.5 1.5 0 0 0 1.2.6h3.6A1.5 1.5 0 0 1 14 6.5v5A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5z" />
    </svg>,

  Tasks: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4l1.5 1.5L7 3" />
      <path d="M3 11l1.5 1.5L7 10" />
      <path d="M9.5 4.5h4" /><path d="M9.5 11.5h4" />
    </svg>,

  Users: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2.5" />
      <path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      <path d="M10.5 4.5a2 2 0 0 1 0 4" />
      <path d="M11 9.2c1.7.4 3 1.9 3 3.8" />
    </svg>,

  Settings: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1.5v1.8M8 12.7v1.8M14.5 8h-1.8M3.3 8H1.5M12.6 3.4l-1.3 1.3M4.7 11.3l-1.3 1.3M12.6 12.6l-1.3-1.3M4.7 4.7L3.4 3.4" />
    </svg>,

  Logout: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11.5V13a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1H8a1 1 0 0 1 1 1v1.5" />
      <path d="M6.5 8h7" /><path d="M11 5.5L13.5 8 11 10.5" />
    </svg>,

  Search: () =>
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" />
    </svg>,

  Plus: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M8 3.5v9M3.5 8h9" />
    </svg>,

  Filter: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3.5h12L9.5 9v4l-3-1V9z" />
    </svg>,

  Board: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2.5" width="3.5" height="11" rx="1" />
      <rect x="6.25" y="2.5" width="3.5" height="7" rx="1" />
      <rect x="10.5" y="2.5" width="3.5" height="9" rx="1" />
    </svg>,

  List: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h9M5 8h9M5 12h9" />
      <circle cx="2.5" cy="4" r=".7" fill="currentColor" stroke="none" />
      <circle cx="2.5" cy="8" r=".7" fill="currentColor" stroke="none" />
      <circle cx="2.5" cy="12" r=".7" fill="currentColor" stroke="none" />
    </svg>,

  Close: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </svg>,

  Cal: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="12" height="11" rx="1.5" />
      <path d="M2 6h12M5.5 1.5v2M10.5 1.5v2" />
    </svg>,

  Up: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 11.5v-7M4.5 8L8 4.5 11.5 8" />
    </svg>,

  Down: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4.5v7M4.5 8L8 11.5 11.5 8" />
    </svg>,

  Eq: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3.5 6.5h9M3.5 9.5h9" />
    </svg>,

  More: () =>
    <svg viewBox="0 0 16 16" fill="currentColor">
      <circle cx="3.5" cy="8" r="1.2" /><circle cx="8" cy="8" r="1.2" /><circle cx="12.5" cy="8" r="1.2" />
    </svg>,

  Check: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5L6.5 12 13 4.5" />
    </svg>,

  Alert: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2.5L14 13H2z" />
      <path d="M8 6.5v3M8 11.5v.01" strokeWidth="1.8" />
    </svg>,

  Inbox: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9.5V4a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 14 4v5.5" />
      <path d="M2 9.5h3.5L6.5 11h3l1-1.5H14V12a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12z" />
    </svg>,

  Chevron: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4l4 4-4 4" />
    </svg>,

  ChevronDown: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6l4 4 4-4" />
    </svg>,

  Trash: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4.5h10M6 4.5V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M5 4.5l.5 8a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1l.5-8" />
    </svg>,

  Mail: () =>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
      <path d="M2.5 4.5L8 9l5.5-4.5" />
    </svg>,
};
