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
      {Icon ? <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : null}
      <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
        {children}
      </span>
    </>
  );

  const className =
    "inline-flex max-w-full h-12 items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm";

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
        <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
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

function captureFields(captureMetadata) {
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
  const websiteLabel = website.domain || website.hostname || website.url;
  const showPath = Boolean(website.pathname && website.pathname !== "/");
  const browserLabel = browser.version
    ? `${browser.name} ${browser.version}`
    : browser.name;
  const timezone = device.timezone || session.timezone;
  const showEnvironment = Boolean(
    browser.name || device.os || screenLabel || viewportLabel,
  );

  return {
    website,
    browser,
    device,
    screenshot,
    capturedAt,
    screenLabel,
    viewportLabel,
    websiteLabel,
    showPath,
    browserLabel,
    timezone,
    showEnvironment,
  };
}

function WebsiteCaptureSection({
  website,
  capturedAt,
  screenshot,
  websiteLabel,
  showPath,
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
        Website
      </p>
      <div className="grid grid-cols-2 gap-2">
        {capturedAt && <DetailPill icon={Calendar}>{capturedAt}</DetailPill>}
        {website.url && (
          <DetailPill icon={Link2} href={website.url} title={website.url}>
            {websiteLabel}
          </DetailPill>
        )}
        {website.title && (
          <DetailPill icon={Globe} title={website.title}>
            {website.title}
          </DetailPill>
        )}
        {showPath && (
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
  );
}

function EnvironmentCaptureSection({
  browser,
  device,
  screenLabel,
  viewportLabel,
  browserLabel,
  timezone,
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
        Environment
      </p>
      <div className="grid grid-cols-2 gap-2">
        {browser.name && <DetailPill icon={AppWindow}>{browserLabel}</DetailPill>}
        {device.os && <DetailPill icon={Cpu}>{device.os}</DetailPill>}
        {timezone && <DetailPill icon={Clock}>{timezone}</DetailPill>}
        {screenLabel && (
          <DetailPill icon={Monitor}>{`Screen ${screenLabel}`}</DetailPill>
        )}
        {viewportLabel && (
          <DetailPill icon={Monitor}>{`Viewport ${viewportLabel}`}</DetailPill>
        )}
      </div>
    </div>
  );
}

export default function TaskCaptureDetails({ captureMetadata }) {
  if (!captureMetadata) return null;

  const fields = captureFields(captureMetadata);

  return (
    <div className="space-y-4">
      <WebsiteCaptureSection
        website={fields.website}
        capturedAt={fields.capturedAt}
        screenshot={fields.screenshot}
        websiteLabel={fields.websiteLabel}
        showPath={fields.showPath}
      />
      {fields.showEnvironment && (
        <EnvironmentCaptureSection
          browser={fields.browser}
          device={fields.device}
          screenLabel={fields.screenLabel}
          viewportLabel={fields.viewportLabel}
          browserLabel={fields.browserLabel}
          timezone={fields.timezone}
        />
      )}
    </div>
  );
}
