import { CheckCircle, Clock, ListTodo, XCircle } from "lucide-react";

export const STATUS_TABS = [
    {
        id: "pending",
        label: "To Do",
        icon: ListTodo,
        empty: "Nothing in to do",
        accent: "text-amber-600",
    },
    {
        id: "in_progress",
        label: "Pending",
        icon: Clock,
        empty: "Nothing in progress",
        accent: "text-sky-600",
    },
    {
        id: "completed",
        label: "Completed",
        icon: CheckCircle,
        empty: "Nothing completed yet",
        accent: "text-emerald-600",
    },
    {
        id: "cancelled",
        label: "Canceled",
        icon: XCircle,
        empty: "Nothing canceled",
        accent: "text-red-500",
    },
];
