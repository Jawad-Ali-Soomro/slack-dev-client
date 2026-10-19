import { useMemo, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import taskService from "../services/task-service";
import UserAvatar from "./user-avatar";
import { PiUserPlus } from "react-icons/pi";

const personId = (person) => person?.id || person?._id || "";

export default function ReassignTaskButton({
  task,
  users = [],
  currentUserId,
  onReassigned,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState("");

  const currentAssigneeId = personId(task?.assignTo);

  const candidates = useMemo(() => {
    const list = [...(users || [])];
    const assigner = task?.assignedBy;
    const assignerId = personId(assigner);
    if (
      assignerId &&
      assignerId !== currentUserId &&
      !list.some((person) => personId(person) === assignerId)
    ) {
      list.unshift({
        id: assignerId,
        username: assigner.username,
        name: assigner.username,
        avatar: assigner.avatar,
        availability: assigner.availability,
      });
    }

    const q = query.trim().toLowerCase();
    return list.filter((person) => {
      const id = personId(person);
      if (!id || id === currentAssigneeId) return false;
      if (!q) return true;
      return (
        (person.username || person.name || "").toLowerCase().includes(q) ||
        (person.email || "").toLowerCase().includes(q)
      );
    });
  }, [users, task?.assignedBy, currentAssigneeId, currentUserId, query]);

  const handleReassign = async (person) => {
    const nextId = personId(person);
    if (!nextId || !(task?.id || task?._id)) return;
    if (person.availability === "busy" || person.isBusy) {
      toast.error(
        `${person.username || person.name} is busy and can't be assigned tasks right now`,
      );
      return;
    }

    try {
      setSavingId(nextId);
      const res = await taskService.reassignTask(
        task.id || task._id,
        nextId,
      );
      const updated = res?.task;
      toast.success(`Reassigned to ${person.username || person.name}`);
      setOpen(false);
      setQuery("");
      if (updated) {
        onReassigned?.(updated);
        window.dispatchEvent(
          new CustomEvent("tasks:changed", { detail: updated }),
        );
      }
    } catch (error) {
      toast.error(error?.message || "Could not reassign task");
    } finally {
      setSavingId("");
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 text-gray-400 h-10 w-10 hover:text-black dark:hover:text-white"
          title="Reassign task"
        >
          <PiUserPlus />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
          Reassign to
        </p>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a member"
          className="mb-2 h-10"
        />
        <div className="max-h-56 space-y-1 overflow-y-auto">
          {candidates.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-gray-500">
              No candidates to reassign to
            </p>
          ) : (
            candidates.map((person) => {
              const id = personId(person);
              const busy = person.availability === "busy" || person.isBusy;
              const saving = savingId === id;
              return (
                <button
                  key={id}
                  type="button"
                  disabled={busy || !!savingId}
                  onClick={() => handleReassign(person)}
                  className="flex w-full items-center gap-2 rounded-[12px] px-2 py-2 text-left text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/5"
                >
                  <UserAvatar user={person} size="sm" />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {person.username || person.name}
                  </span>
                  {busy ? (
                    <span className="text-[10px] font-bold uppercase text-amber-600">
                      Busy
                    </span>
                  ) : saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
