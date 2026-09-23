import {
  Calendar,
  Globe,
  Link2,
  Monitor,
  ExternalLink,
  FolderTree,
  AppWindow,
  Cpu,
  Clock,
} from "lucide-react";

function DetailPill({ icon: Icon, children, href, title }) {
  if (children === undefined || children === null || children === "") return null;

  const content = (
    <>
      {Icon ? <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" /> : null}
      <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
        {children}
      </span>
    </>
  );

  const className =
    "inline-flex max-w-full h-12 items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 shadow-sm";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        title={title || String(children)}
        className={`${className} hover:border-teal-300 dark:hover:border-teal-700 transition-colors`}
      >
        {content}
        <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
      </a>
    );
  }

  return (
    <span className={className} title={title || String(children)}>
      {content}
    </span>
  );
}

function formatCaptureDate(session) {
  const raw = session?.timestamp || [session?.date, session?.time].filter(Boolean).join(" ");
  if (!raw) return null;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return [session?.date, session?.time].filter(Boolean).join(", ") || String(raw);
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TaskCaptureDetails({ captureMetadata }) {
  if (!captureMetadata) return null;

  const website = captureMetadata.website || {};
  const browser = captureMetadata.browser || {};
  const device = captureMetadata.device || {};
  const display = captureMetadata.display || {};
  const session = captureMetadata.session || {};

  const screenshot =
    typeof captureMetadata.screenshot === "string"
      ? captureMetadata.screenshot
      : null;

  const capturedAt = formatCaptureDate(session);
  const screenLabel =
    display.screenWidth != null
      ? `${display.screenWidth}×${display.screenHeight}`
      : null;
  const viewportLabel =
    display.viewportWidth != null
      ? `${display.viewportWidth}×${display.viewportHeight}`
      : null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 mb-2">
          Website
        </p>
        <div className="grid grid-cols-2 gap-2">
          {capturedAt && (
            <DetailPill icon={Calendar}>{capturedAt}</DetailPill>
          )}
          {website.url && (
            <DetailPill icon={Link2} href={website.url} title={website.url}>
              {website.domain || website.hostname || website.url}
            </DetailPill>
          )}
          {website.title && (
            <DetailPill icon={Globe} title={website.title}>
              {website.title}
            </DetailPill>
          )}
          {website.pathname && website.pathname !== "/" && (
            <DetailPill icon={FolderTree} title={website.pathname}>
              {website.pathname}
            </DetailPill>
          )}
          {screenshot && (
            <DetailPill icon={ExternalLink} href={screenshot} title="Open screenshot">
              View screenshot
            </DetailPill>
          )}
        </div>
      </div>

      {(browser.name || device.os || screenLabel || viewportLabel) && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 mb-2">
            Environment
          </p>
          <div className="grid grid-cols-2 gap-2">
            {browser.name && (
              <DetailPill icon={AppWindow}>
                {browser.version
                  ? `${browser.name} ${browser.version}`
                  : browser.name}
              </DetailPill>
            )}
            {device.os && <DetailPill icon={Cpu}>{device.os}</DetailPill>}
            {(device.timezone || session.timezone) && (
              <DetailPill icon={Clock}>
                {device.timezone || session.timezone}
              </DetailPill>
            )}
            {screenLabel && (
              <DetailPill icon={Monitor}>{`Screen ${screenLabel}`}</DetailPill>
            )}
            {viewportLabel && (
              <DetailPill icon={Monitor}>{`Viewport ${viewportLabel}`}</DetailPill>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
