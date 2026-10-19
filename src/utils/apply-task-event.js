export function taskIdOf(task) {
  if (!task) return "";
  const raw = task.id || task._id;
  return raw ? String(raw) : "";
}

function personId(person) {
  if (!person) return "";
  if (typeof person === "string" || typeof person === "number") return String(person);
  return String(person.id || person._id || "");
}

export function applyTaskToList(tasks, event, { include } = {}) {
  const list = Array.isArray(tasks) ? tasks : [];
  const id = taskIdOf(event);
  if (!id) return list;

  const index = list.findIndex((task) => taskIdOf(task) === id);
  if (event?.deleted) {
    if (index === -1) return list;
    return list.filter((task) => taskIdOf(task) !== id);
  }

  const merged =
    index === -1
      ? { ...event, id }
      : {
          ...list[index],
          ...event,
          id: event.id || list[index].id || id,
          _id: list[index]._id || event._id || id,
        };

  if (include && !include(merged)) {
    if (index === -1) return list;
    return list.filter((task) => taskIdOf(task) !== id);
  }

  if (index === -1) return [merged, ...list];
  const next = [...list];
  next[index] = merged;
  return next;
}

function eventProjectId(event) {
  if (!event) return undefined;
  const hasProject =
    Object.prototype.hasOwnProperty.call(event, "project") ||
    Object.prototype.hasOwnProperty.call(event, "projectId");
  if (!hasProject) return undefined;
  const raw = event.projectId || event.project?.id || event.project?._id || "";
  return raw ? String(raw) : "";
}

function toProjectTask(event, existing) {
  const id = taskIdOf(event);
  const assignTo = event.assignTo
    ? {
        ...(existing?.assignTo || {}),
        _id: event.assignTo._id || event.assignTo.id || existing?.assignTo?._id,
        id: event.assignTo.id || event.assignTo._id || existing?.assignTo?.id,
        username: event.assignTo.username || existing?.assignTo?.username,
        avatar: event.assignTo.avatar ?? existing?.assignTo?.avatar,
      }
    : existing?.assignTo;

  return {
    ...(existing || {}),
    ...event,
    _id: existing?._id || id,
    id,
    assignTo,
  };
}

export function patchProjectTasks(project, event) {
  if (!project) return project;
  const tasks = Array.isArray(project.tasks) ? project.tasks : [];
  const projectId = String(project.id || project._id || "");
  const targetProjectId = eventProjectId(event);
  const id = taskIdOf(event);
  if (!id) return project;

  const index = tasks.findIndex((task) => taskIdOf(task) === id);
  let nextTasks = tasks;

  if (event?.deleted) {
    if (index === -1) return project;
    nextTasks = tasks.filter((task) => taskIdOf(task) !== id);
  } else if (targetProjectId === undefined) {
    if (index === -1) return project;
    nextTasks = [...tasks];
    nextTasks[index] = toProjectTask(event, tasks[index]);
  } else if (targetProjectId !== projectId) {
    if (index === -1) return project;
    nextTasks = tasks.filter((task) => taskIdOf(task) !== id);
  } else if (index === -1) {
    nextTasks = [toProjectTask(event), ...tasks];
  } else {
    nextTasks = [...tasks];
    nextTasks[index] = toProjectTask(event, tasks[index]);
  }

  if (nextTasks === tasks) return project;

  const stats = project.stats
    ? {
        ...project.stats,
        totalTasks: nextTasks.length,
        completedTasks: nextTasks.filter((task) => task.status === "completed")
          .length,
      }
    : project.stats;

  return { ...project, tasks: nextTasks, stats };
}

export function applyTaskToUser(user, event, viewedUserId) {
  if (!user) return user;
  const tasks = Array.isArray(user.tasks) ? user.tasks : [];
  const id = taskIdOf(event);
  if (!id) return user;

  const viewed = String(viewedUserId || user.id || user._id || "");
  const assigneeId = personId(event.assignTo);
  const assignerId = personId(event.assignedBy);
  const index = tasks.findIndex((task) => taskIdOf(task) === id);
  const knownParty = Boolean(assigneeId || assignerId);
  const relates = assigneeId === viewed || assignerId === viewed;

  if (event?.deleted || (knownParty && !relates)) {
    if (index === -1) return user;
    return { ...user, tasks: tasks.filter((task) => taskIdOf(task) !== id) };
  }

  if (!relates && index === -1) return user;

  const nextTask = {
    ...(index === -1 ? {} : tasks[index]),
    id,
    title: event.title ?? tasks[index]?.title,
    status: event.status ?? tasks[index]?.status,
    priority: event.priority ?? tasks[index]?.priority,
    role: assigneeId
      ? assigneeId === viewed
        ? "assignee"
        : "assigner"
      : tasks[index]?.role || "assignee",
    projectName:
      event.project?.name || event.projectName || tasks[index]?.projectName,
    createdAt: event.createdAt || tasks[index]?.createdAt,
  };

  if (index === -1) return { ...user, tasks: [nextTask, ...tasks] };
  const next = [...tasks];
  next[index] = nextTask;
  return { ...user, tasks: next };
}
