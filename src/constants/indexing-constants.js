import {
    Calendar,
    CheckCircle2,
    FolderOpen,
    MessageSquare,
    Users,
    Zap,
} from "lucide-react";

export const TRUST_TEAM = [
    {
        username: "Maya Chen",
        email: "maya_chen@slackdev.seed",
        avatar:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&h=96&q=80",
    },
    {
        username: "Liam Okonkwo",
        email: "liam_okonkwo@slackdev.seed",
        avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&h=96&q=80",
    },
    {
        username: "Sofia Rossi",
        email: "sofia_rossi@slackdev.seed",
        avatar:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&h=96&q=80",
    },
];

export const NAV = [
    { id: "home", label: "Home" },
    { id: "features", label: "Product" },
    { id: "workspace", label: "Workspace" },
    { to: "/contact", label: "Contact" },
];

export const HEADLINE_WORDS = ["ships", "assigns", "aligns", "scales"];

export const LIVE_COPY = [
    "Auto-assign matching frontend & backend roles",
    "8 members online across Atlas and Nova",
    "Sprint review in 12 minutes · Conference A",
    "Least-busy developer picked in realtime",
];

export const STATS = [
    { target: 12, suffix: "k+", decimals: 0, label: "Tasks coordinated" },
    { target: 98, suffix: "%", decimals: 0, label: "On-time delivery" },
    { target: 24, suffix: "/7", decimals: 0, label: "Workspace availability" },
    { target: 99.9, suffix: "%", decimals: 1, label: "Workspace uptime" },
];

export const FEATURES = [
    {
        icon: Users,
        title: "Workspaces",
        body: "Invite, role, and organize people into the squads that actually ship. Owners, admins, and members stay in their lane.",
    },
    {
        icon: CheckCircle2,
        title: "Tasks",
        body: "Assign work by hand or let Auto assign pick the least-busy developer from frontend or backend in the description.",
    },
    {
        icon: FolderOpen,
        title: "Projects",
        body: "Keep repos, tasks, and people on one board so progress is visible without chasing status in chat.",
    },
    {
        icon: Calendar,
        title: "Meetings",
        body: "Schedule standups and reviews, assign an owner, and keep the calendar next to the work it is about.",
    },
    {
        icon: MessageSquare,
        title: "Chat",
        body: "Talk in context with the same members you assign. No extra tool just to ask who owns a ticket.",
    },
    {
        icon: Zap,
        title: "Automation",
        body: "Admins switch on workspace rules. Auto-assign is live — more triggers for overdue work and follow-ups are ready.",
    },
];

export const STEPS = [
    {
        step: "01",
        title: "Stand up the workspace",
        body: "Create a workspace, invite friends, and set job roles — frontend, backend, fullstack — plus busy or available status.",
    },
    {
        step: "02",
        title: "Capture the work",
        body: "Spin up a task, link a GitHub repo, and describe it. Mention frontend or backend and the workspace already knows who fits.",
    },
    {
        step: "03",
        title: "Let the system assign",
        body: "One click Auto assign skips busy people and gives the ticket to the member with the lightest active load.",
    },
];

export const MARQUEE = [
    "Workspaces",
    "Tasks",
    "Projects",
    "Meetings",
    "Chat",
    "Automation",
    "GitHub",
    "Availability",
    "Auto assign",
    "Roles",
];

export const FLOATS = [
    {
        title: "Auto-assigned",
        body: "Maya · frontend · 2 open",
        x: "-8%",
        y: "18%",
        depth: 28,
    },
    {
        title: "Sprint review",
        body: "Today · 10:00 · Atlas",
        x: "72%",
        y: "14%",
        depth: 18,
    },
    {
        title: "Workspace Atlas",
        body: "8 online · 3 busy",
        x: "80%",
        y: "62%",
        depth: 22,
    },
];

export const DASH_METRICS = [
    { label: "System Status", value: "All Systems Active" },
    { label: "Tasks This Week", value: "12" },
    { label: "Completion Rate", value: "86%" },
    { label: "Active Projects", value: "4" },
];

export const LINE_DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
export const LINE_VALUES = [8, 12, 10, 22, 18, 30, 26];

export const PIE_SLICES = [
    { label: "Done", value: 46, color: "#ff914b" },
    { label: "Progress", value: 32, color: "#75fc96" },
    { label: "Pending", value: 22, color: "#d4d4d8" },
];
