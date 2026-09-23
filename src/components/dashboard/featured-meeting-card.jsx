import { MoreHorizontal, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

const formatTimeRange = (startDate, endDate) => {
  if (!startDate && !endDate) return "Time not set";
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  const timeOpts = { hour: "2-digit", minute: "2-digit", hour12: true };
  if (start && end) {
    return `Time: ${start.toLocaleTimeString(undefined, timeOpts)} - ${end.toLocaleTimeString(undefined, timeOpts)}`;
  }
  if (start) {
    return `Time: ${start.toLocaleTimeString(undefined, timeOpts)}`;
  }
  return `Time: ${end.toLocaleTimeString(undefined, timeOpts)}`;
};

/**
 * Dark featured meeting card — reference “Meeting with Arc” style.
 */
export default function FeaturedMeetingCard({
  meeting,
  onJoin,
  onOpenMeetings,
  className = "",
}) {
  const title =
    meeting?.title || meeting?.name || "No upcoming meeting";
  const timeLabel = meeting
    ? formatTimeRange(meeting.startDate, meeting.endDate)
    : "Schedule a meeting to get started";
  const hasLink = Boolean(meeting?.meetingLink);

  const handleCta = () => {
    if (meeting?.meetingLink) {
      onJoin?.(meeting.meetingLink);
      return;
    }
    onOpenMeetings?.();
  };

  return (
    <div
      className={`rounded-[28px] bg-[#121212] text-white p-6 flex flex-col justify-between shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-semibold leading-snug tracking-tight max-w-[85%]">
          {meeting ? title : "No meetings yet"}
        </h3>
        <button
          type="button"
          className="flex-shrink-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
          aria-label="Meeting options"
          onClick={onOpenMeetings}
        >
          <MoreHorizontal className="w-4 h-4 text-white/80" />
        </button>
      </div>

      <p className="mt-4 text-sm text-white/55 font-medium">{timeLabel}</p>

      <Button
        type="button"
        onClick={handleCta}
        disabled={!meeting}
        className="mt-8 w-full h-12 rounded-2xl bg-[#75FC96] hover:bg-[#4fd972] text-black font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Video className="w-4 h-4" />
        {hasLink ? "Start Meeting" : meeting ? "View Meeting" : "Schedule Meeting"}
      </Button>
    </div>
  );
}
