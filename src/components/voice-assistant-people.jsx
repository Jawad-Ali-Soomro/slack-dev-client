import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import UserAvatar from "./user-avatar";

const statusClass = (status) => {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "in_progress":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "cancelled":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
};

const pretty = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase()) || "—";

export function TaskPills({ tasks = [], limit = 4 }) {
  if (!tasks.length) {
    return (
      <p className="text-xs text-gray-400">No assigned tasks right now.</p>
    );
  }

  return (
    <ul className="space-y-1.5">
      {tasks.slice(0, limit).map((task) => (
        <li
          key={task.id || task.title}
          className="flex items-start justify-between gap-2 rounded-xl border border-orange-50 bg-orange-50/60 px-2.5 py-1.5"
        >
          <span className="min-w-0 text-left text-xs font-medium leading-4 text-gray-800">
            {task.title}
          </span>
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusClass(
              task.status,
            )}`}
          >
            {pretty(task.status)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function PersonChip({ person }) {
  const [hover, setHover] = useState(false);
  const tasks = person.tasks || [];

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span className="inline-flex rounded-full p-0.5">
        <UserAvatar
          user={person}
          size="lg"
          showHoverCard={false}
          ring={false}
        />
      </span>
      <AnimatePresence>
        {hover ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-[calc(100%+10px)] left-1/2 z-10 w-72 -translate-x-1/2 rounded-2xl border border-orange-100 bg-white p-3 text-left shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
          >
            <div className="flex items-center gap-3">
              <UserAvatar
                user={person}
                size="lg"
                showHoverCard={false}
                ring={false}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {person.username}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {person.email || pretty(person.jobRole)}
                </p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {person.availability ? (
                <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#FF914B]">
                  {pretty(person.availability)}
                </span>
              ) : null}
              {person.jobRole ? (
                <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  {pretty(person.jobRole)}
                </span>
              ) : null}
              <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                {person.taskCount ?? tasks.length} tasks
              </span>
            </div>
            <div className="mt-2">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                Assigned tasks
              </p>
              <TaskPills tasks={tasks} limit={3} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function PeopleRail({ people }) {
  if (!people?.length) return null;

  return (
    <div className="mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-3">
      {people.slice(0, 12).map((person) => (
        <PersonChip key={person.id || person.username} person={person} />
      ))}
    </div>
  );
}
