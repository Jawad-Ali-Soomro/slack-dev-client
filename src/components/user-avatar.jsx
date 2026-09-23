import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { getAvatarUrl } from "@/utils/avatar-utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const HOVER_READY_MS = 450;

function usePointerHoverCard() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const readyRef = useRef(false);
  const pointerInside = useRef(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      readyRef.current = true;
    }, HOVER_READY_MS);
    return () => {
      window.clearTimeout(id);
      readyRef.current = false;
      pointerInside.current = false;
      setOpen(false);
    };
  }, []);

  const onOpenChange = (next) => {
    if (next) {
      if (!readyRef.current) return;
      const hovered =
        pointerInside.current || triggerRef.current?.matches(":hover");
      if (!hovered) return;
    }
    setOpen(next);
  };

  const triggerProps = {
    ref: triggerRef,
    onPointerEnter: () => {
      pointerInside.current = true;
    },
    onPointerLeave: () => {
      pointerInside.current = false;
    },
  };

  return { open, onOpenChange, triggerProps };
}

const SIZE = {
  sm: "h-6 w-6 text-[9px]",
  md: "h-8 w-8 text-[10px]",
  lg: "h-9 w-9 text-[11px]",
  xl: "h-12 w-12 text-sm",
  "2xl": "h-20 w-20 text-xl",
};

export function normalizePerson(item) {
  if (!item) return { id: null, name: "User", avatar: null, email: null };
  const nested = item.user && typeof item.user === "object" ? item.user : item;
  return {
    id: nested.id || nested._id || item.id || item._id || null,
    name:
      nested.username ||
      nested.name ||
      item.username ||
      item.name ||
      "User",
    avatar: nested.avatar || item.avatar || null,
    email: nested.email || item.email || null,
  };
}

function initials(name) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function AvatarCircle({
  src,
  name,
  size = "md",
  className,
  ring = true,
}) {
  const url = getAvatarUrl(src, name);
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=random&color=fff&size=128`;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-800",
        ring && "ring-2 ring-white dark:ring-black",
        SIZE[size] || SIZE.md,
        className,
      )}
    >
      <img
        src={url}
        alt={name || "User"}
        className="h-full w-full object-cover rounded-full"
        onError={(e) => {
          if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
        }}
      />
    </span>
  );
}

function NameCard({ name, email }) {
  return (
    <div className="min-w-0">
      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
        {name}
      </p>
      {email ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
          {email}
        </p>
      ) : null}
    </div>
  );
}

export function UserAvatar({
  user,
  src,
  name,
  username,
  email,
  size = "md",
  className,
  onClick,
  showHoverCard = true,
  ring = true,
}) {
  const person = normalizePerson(
    user || { avatar: src, username: name || username, email },
  );
  const displayName = name || username || person.name;
  const displayEmail = email || person.email;
  const avatarSrc = src ?? person.avatar;

  const handleClick = (e) => {
    if (!onClick) return;
    e.stopPropagation();
    onClick(person.id, e);
  };

  const circle = (
    <AvatarCircle
      src={avatarSrc}
      name={displayName}
      size={size}
      className={className}
      ring={ring}
    />
  );

  const hover = usePointerHoverCard();

  if (!showHoverCard) {
    if (!onClick) return circle;
    return (
      <button type="button" onClick={handleClick} className="inline-flex rounded-full p-0 border-0 bg-transparent">
        {circle}
      </button>
    );
  }

  return (
    <HoverCard
      open={hover.open}
      onOpenChange={hover.onOpenChange}
      openDelay={180}
      closeDelay={80}
    >
      <HoverCardTrigger asChild>
        <button
          {...hover.triggerProps}
          type="button"
          onClick={handleClick}
          className="inline-flex rounded-full p-0 border-0 bg-transparent cursor-pointer"
          aria-label={displayName}
        >
          {circle}
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="top" className="w-auto max-w-[220px] px-3 py-2">
        <div className="flex items-center gap-2.5">
          <AvatarCircle src={avatarSrc} name={displayName} size="md" ring={false} />
          <NameCard name={displayName} email={displayEmail} />
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function ExtraCountHover({ extra, extraCount, size, zIndex }) {
  const hover = usePointerHoverCard();

  return (
    <HoverCard
      open={hover.open}
      onOpenChange={hover.onOpenChange}
      openDelay={180}
      closeDelay={80}
    >
      <HoverCardTrigger asChild>
        <button
          {...hover.triggerProps}
          type="button"
          className={cn(
            "relative inline-flex items-center justify-center rounded-full",
            "ring-2 ring-white dark:ring-black bg-black text-white font-semibold leading-none",
            SIZE[size] || SIZE.md,
          )}
          style={{ marginLeft: -10, zIndex }}
          aria-label={`${extraCount} more`}
        >
          +{extraCount > 99 ? 99 : extraCount}
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="top" className="w-auto max-w-[240px] px-3 py-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
          {extraCount} more
        </p>
        <ul className="space-y-1.5">
          {extra.slice(0, 8).map((person, index) => (
            <li
              key={person.id || `${person.name}-extra-${index}`}
              className="flex items-center gap-2"
            >
              <AvatarCircle src={person.avatar} name={person.name} size="sm" ring={false} />
              <NameCard name={person.name} email={person.email} />
            </li>
          ))}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
}

export function AvatarGroup({
  users = [],
  max = 3,
  size = "md",
  onUserClick,
  className,
  emptyLabel = "No attendees",
}) {
  const people = (users || []).map(normalizePerson);
  const visible = people.slice(0, max);
  const extra = people.slice(max);
  const extraCount = extra.length;

  if (!people.length) {
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {emptyLabel}
      </span>
    );
  }

  return (
    <div className={cn("flex items-center", className)}>
      {visible.map((person, index) => (
        <div
          key={person.id || `${person.name}-${index}`}
          className="relative"
          style={{ marginLeft: index === 0 ? 0 : -10, zIndex: index + 1 }}
        >
          <UserAvatar
            user={person}
            size={size}
            onClick={
              onUserClick
                ? (id, e) => onUserClick(id ?? person.id, e)
                : undefined
            }
          />
        </div>
      ))}
      {extraCount > 0 && (
        <ExtraCountHover
          extra={extra}
          extraCount={extraCount}
          size={size}
          zIndex={visible.length + 1}
        />
      )}
    </div>
  );
}

export default UserAvatar;
