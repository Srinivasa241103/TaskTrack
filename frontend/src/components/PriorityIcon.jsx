import { Icon } from './Icons.jsx';

export function PriorityIcon({ priority }) {
  if (priority === 'Critical')
    return <span className="kcard__priority kcard__priority--high" title="Critical priority"><Icon.Up /></span>;
  if (priority === 'Urgent')
    return <span className="kcard__priority kcard__priority--med" title="Urgent priority"><Icon.Eq /></span>;
  return <span className="kcard__priority kcard__priority--low" title="Required priority"><Icon.Down /></span>;
}
