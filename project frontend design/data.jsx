// Sample data for the Plot prototype. Believable SaaS / product team content.

const USERS = [
  { id: 'u1', name: 'Aanya Mehta',     initials: 'AM', color: '#6366F1', role: 'admin'  },
  { id: 'u2', name: 'Rohan Iyer',      initials: 'RI', color: '#0EA5A8', role: 'member' },
  { id: 'u3', name: 'Priya Saxena',    initials: 'PS', color: '#D9488A', role: 'member' },
  { id: 'u4', name: 'Devon Walker',    initials: 'DW', color: '#B45309', role: 'member' },
  { id: 'u5', name: 'Sana Khan',       initials: 'SK', color: '#16A34A', role: 'member' },
  { id: 'u6', name: 'Marcus Chen',     initials: 'MC', color: '#7C3AED', role: 'admin'  },
  { id: 'u7', name: 'Lena Park',       initials: 'LP', color: '#DC2626', role: 'member' },
  { id: 'u8', name: 'Ishaan Verma',    initials: 'IV', color: '#0369A1', role: 'member' },
];

const CURRENT_USER_ID = 'u1'; // Aanya — admin

const PROJECTS = [
  {
    id: 'p1',
    key: 'WEB',
    name: 'Website Relaunch',
    description: 'Migrate marketing site to the new design system; ship pricing, docs, and a refreshed home before Q3.',
    color: '#3730E0',
    members: ['u1','u2','u3','u4','u5'],
    progress: { done: 18, total: 32 },
  },
  {
    id: 'p2',
    key: 'MOB',
    name: 'Mobile App v3',
    description: 'Rewrite onboarding and rebuild the inbox surface. Targeting App Store feature.',
    color: '#0EA5A8',
    members: ['u2','u3','u6','u7'],
    progress: { done: 9, total: 26 },
  },
  {
    id: 'p3',
    key: 'API',
    name: 'Public API',
    description: 'Stabilize v2 endpoints, write reference docs, and ship SDK clients for JS and Python.',
    color: '#B45309',
    members: ['u1','u6','u8'],
    progress: { done: 22, total: 24 },
  },
  {
    id: 'p4',
    key: 'OPS',
    name: 'Internal Tooling',
    description: 'Customer support console, admin dashboards, and the on-call rotation tool.',
    color: '#7C3AED',
    members: ['u1','u4','u5','u8'],
    progress: { done: 5, total: 18 },
  },
  {
    id: 'p5',
    key: 'BIL',
    name: 'Billing & Invoicing',
    description: 'New invoice templates, dunning emails, and self-serve subscription management.',
    color: '#16A34A',
    members: ['u3','u4','u7'],
    progress: { done: 12, total: 20 },
  },
  {
    id: 'p6',
    key: 'GTM',
    name: 'GTM Launch — Plot 2.0',
    description: 'Coordinated rollout: press, customer comms, sales enablement, in-app announcements.',
    color: '#D9488A',
    members: ['u1','u2','u5','u6','u7','u8'],
    progress: { done: 3, total: 14 },
  },
];

// Status: 'todo' | 'in_progress' | 'done'
// Priority: 'high' | 'medium' | 'low'
const today = new Date('2026-05-27');
const D = (offsetDays) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const TASKS = [
  // WEB
  { id:'t1', key:'WEB-12', projectId:'p1', title:'Refactor pricing page hero', status:'in_progress', priority:'high',   assignee:'u1', due:D(-2), labels:['design','frontend'], description:'Replace the carousel with a static comparison table. Pull plan data from the new pricing API and ensure mobile collapses gracefully.' },
  { id:'t2', key:'WEB-15', projectId:'p1', title:'Footer link audit',          status:'todo',        priority:'low',    assignee:'u3', due:D(5),  labels:['content'],            description:'Cross-reference footer with sitemap, remove dead links, add new Trust Center entry.' },
  { id:'t3', key:'WEB-19', projectId:'p1', title:'Add OG image generator',     status:'todo',        priority:'medium', assignee:'u4', due:D(8),  labels:['infra'],              description:'Edge function that takes a title and renders a 1200×630 image with the brand wordmark.' },
  { id:'t4', key:'WEB-21', projectId:'p1', title:'Cookie banner GDPR review',  status:'in_progress', priority:'medium', assignee:'u5', due:D(1),  labels:['legal'],              description:'Legal flagged the previous banner — add granular consent and remove pre-checked boxes.' },
  { id:'t5', key:'WEB-26', projectId:'p1', title:'Migrate blog to MDX',        status:'done',        priority:'low',    assignee:'u2', due:D(-10),labels:['content','frontend'], description:'Done — all 84 posts converted with redirects in place.' },
  { id:'t6', key:'WEB-30', projectId:'p1', title:'Animated diagram on /how',   status:'in_progress', priority:'high',   assignee:'u2', due:D(3),  labels:['design'],             description:'SVG sequence triggered on scroll; coordinate with Aanya on the storyboard.' },
  { id:'t7', key:'WEB-33', projectId:'p1', title:'Lighthouse score regression',status:'todo',        priority:'high',   assignee:'u4', due:D(-1), labels:['perf'],               description:'LCP went from 1.8s to 3.2s after the hero refactor. Likely the new font payload.' },
  { id:'t8', key:'WEB-34', projectId:'p1', title:'404 page illustration',      status:'todo',        priority:'low',    assignee:'u3', due:D(14), labels:['design'],             description:'' },
  { id:'t9', key:'WEB-37', projectId:'p1', title:'Sticky nav on scroll',       status:'done',        priority:'medium', assignee:'u4', due:D(-8), labels:['frontend'],           description:'' },
  { id:'t10',key:'WEB-40', projectId:'p1', title:'Switch CDN to fly.io edge',  status:'done',        priority:'medium', assignee:'u5', due:D(-15),labels:['infra'],              description:'' },

  // MOB
  { id:'t11',key:'MOB-04', projectId:'p2', title:'Onboarding screen — Step 2 redesign', status:'in_progress', priority:'high', assignee:'u3', due:D(2), labels:['design','ios'], description:'' },
  { id:'t12',key:'MOB-08', projectId:'p2', title:'Push notification permission flow',   status:'todo',        priority:'medium', assignee:'u7', due:D(6), labels:['ios','android'], description:'' },
  // API
  { id:'t13',key:'API-22', projectId:'p3', title:'Document /v2/webhooks',               status:'done',        priority:'medium', assignee:'u1', due:D(-3), labels:['docs'], description:'' },
  { id:'t14',key:'API-23', projectId:'p3', title:'Python SDK — async client',           status:'in_progress', priority:'high',   assignee:'u6', due:D(4),  labels:['sdk'],  description:'' },
  // OPS
  { id:'t15',key:'OPS-07', projectId:'p4', title:'On-call rotation auto-rotate',        status:'todo',        priority:'medium', assignee:'u8', due:D(10), labels:['internal'], description:'' },
  // BIL
  { id:'t16',key:'BIL-11', projectId:'p5', title:'Failed payment dunning sequence',     status:'in_progress', priority:'high',   assignee:'u4', due:D(0),  labels:['email'], description:'' },
  { id:'t17',key:'BIL-14', projectId:'p5', title:'Tax ID collection at checkout',       status:'todo',        priority:'high',   assignee:'u3', due:D(-3), labels:['legal','frontend'], description:'' },
];

const ACTIVITY = [
  { id:'a1', taskId:'t1', userId:'u1', when:'2h ago',    text:'changed status from To Do to In Progress' },
  { id:'a2', taskId:'t1', userId:'u6', when:'5h ago',    text:'commented: "Pulled the new plan IDs from the staging API — let me know if anything looks off."' },
  { id:'a3', taskId:'t1', userId:'u1', when:'yesterday', text:'set due date to May 25, 2026' },
  { id:'a4', taskId:'t1', userId:'u1', when:'2 days ago',text:'assigned to themselves' },
  { id:'a5', taskId:'t1', userId:'u6', when:'3 days ago',text:'created this task' },
];

const findUser = (id) => USERS.find((u) => u.id === id);
const findProject = (id) => PROJECTS.find((p) => p.id === id);
const tasksByProject = (pid) => TASKS.filter((t) => t.projectId === pid);
const tasksAssignedTo = (uid) => TASKS.filter((t) => t.assignee === uid);

Object.assign(window, {
  USERS, PROJECTS, TASKS, ACTIVITY, CURRENT_USER_ID,
  findUser, findProject, tasksByProject, tasksAssignedTo,
});
