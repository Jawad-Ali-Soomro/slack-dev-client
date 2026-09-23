import { CheckSquare, FolderKanban, MoreHorizontal, Video } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";
import { Button } from "@/components/ui/button";
import "swiper/css";
import "swiper/css/effect-cards";

const formatTimeRange = (startDate, endDate) => {
  if (!startDate && !endDate) return "Time not set";
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  const timeOpts = { hour: "2-digit", minute: "2-digit", hour12: true };
  if (start && end) {
    return `Time: ${start.toLocaleTimeString(undefined, timeOpts)} - ${end.toLocaleTimeString(undefined, timeOpts)}`;
  }
  if (start) return `Time: ${start.toLocaleTimeString(undefined, timeOpts)}`;
  return `Time: ${end.toLocaleTimeString(undefined, timeOpts)}`;
};

const formatDue = (dueDate) => {
  if (!dueDate) return "No due date";
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return "No due date";
  return `Due: ${due.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} · ${due.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
};

function SpotlightCard({
  badge,
  title,
  subtitle,
  ctaLabel,
  ctaIcon: CtaIcon,
  onCta,
  onMore,
  moreLabel,
  disabled,
}) {
  return (
    <div className="h-full rounded-[28px] bg-[#121212] text-white p-6 flex flex-col justify-between shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/80">
            {badge}
          </span>
          <button
            type="button"
            className="flex-shrink-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
            aria-label={moreLabel || "Open"}
            onClick={onMore}
          >
            <MoreHorizontal className="w-4 h-4 text-white/80" />
          </button>
        </div>
        <h3 className="mt-4 text-xl font-semibold leading-snug tracking-tight line-clamp-2">
          {title}
        </h3>
        <p className="mt-3 text-sm text-white/55 font-medium line-clamp-2">
          {subtitle}
        </p>
      </div>

      <Button
        type="button"
        onClick={onCta}
        disabled={disabled}
        className="mt-6 w-full h-12 rounded-2xl bg-[#75FC96] hover:bg-[#4fd972] text-black font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {CtaIcon ? <CtaIcon className="w-4 h-4" /> : null}
        {ctaLabel}
      </Button>
    </div>
  );
}

export default function FeaturedCardsSwiper({
  task,
  meeting,
  project,
  onOpenTasks,
  onOpenMeetings,
  onOpenProjects,
  onJoinMeeting,
  className = "",
}) {
  const taskTitle = task?.title || task?.name || "No tasks yet";
  const taskStatus = (task?.status || "todo").replace(/_/g, " ");
  const meetingTitle = meeting?.title || meeting?.name || "No meetings yet";
  const hasMeetingLink = Boolean(meeting?.meetingLink);
  const projectTitle = project?.name || project?.title || "No projects yet";
  const projectProgress = Math.min(
    100,
    Math.max(0, Number(project?.progress) || 0),
  );
  const projectStatus = (project?.status || "planning").replace(/_/g, " ");

  return (
    <div
      data-swiper
      className={`featured-cards-swiper-wrap ${className}`}
      onDragStart={(e) => e.preventDefault()}
    >
      <Swiper
        effect="cards"
        grabCursor
        modules={[EffectCards]}
        className="featured-cards-swiper"
      >
        <SwiperSlide>
          <SpotlightCard
            badge="Task"
            title={task ? taskTitle : "No tasks yet"}
            subtitle={
              task
                ? `${formatDue(task.dueDate)} · ${taskStatus}`
                : "Create a task to get started"
            }
            ctaLabel={task ? "View Task" : "Open Tasks"}
            ctaIcon={CheckSquare}
            onCta={onOpenTasks}
            onMore={onOpenTasks}
            moreLabel="Open tasks"
          />
        </SwiperSlide>

        <SwiperSlide>
          <SpotlightCard
            badge="Meeting"
            title={meeting ? meetingTitle : "No meetings yet"}
            subtitle={
              meeting
                ? formatTimeRange(meeting.startDate, meeting.endDate)
                : "Schedule a meeting to get started"
            }
            ctaLabel={
              hasMeetingLink
                ? "Start Meeting"
                : meeting
                  ? "View Meeting"
                  : "Schedule Meeting"
            }
            ctaIcon={Video}
            onCta={() => {
              if (meeting?.meetingLink) {
                onJoinMeeting?.(meeting.meetingLink);
                return;
              }
              onOpenMeetings?.();
            }}
            onMore={onOpenMeetings}
            moreLabel="Open meetings"
            disabled={!meeting}
          />
        </SwiperSlide>

        <SwiperSlide>
          <SpotlightCard
            badge="Project"
            title={project ? projectTitle : "No projects yet"}
            subtitle={
              project
                ? `${projectProgress}% complete · ${projectStatus}`
                : "Start a project to get going"
            }
            ctaLabel={project ? "View Project" : "Open Projects"}
            ctaIcon={FolderKanban}
            onCta={onOpenProjects}
            onMore={onOpenProjects}
            moreLabel="Open projects"
          />
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
