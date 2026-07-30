import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PiBed,
  PiBuildings,
  PiCalendarBlank,
  PiCheck,
  PiCheckCircle,
  PiCheckSquare,
  PiDoorOpen,
  PiLockSimple,
  PiPencilSimple,
  PiPlus,
  PiShower,
  PiSquare,
  PiStack,
  PiThermometer,
  PiTrash,
  PiUsers,
  PiXCircle,
} from "react-icons/pi";
import {
  bulkRoomStatusRequest,
  createFloorRequest,
  createRoomRequest,
  deleteFloorRequest,
  deleteRoomRequest,
  listBookingsRequest,
  listFloorsRequest,
  listOrganizationsRequest,
  updateBookingRequest,
  updateFloorRequest,
  updateRoomRequest,
} from "@multi-tenants/api";
import {
  formatBusinessTypeLabel,
  formatLodgingAttributeLabel,
  isLodgingBusinessType,
  LODGING_BATHROOM_OPTIONS,
  LODGING_CLIMATE_OPTIONS,
  getProductCategoriesForBusiness,
} from "@multi-tenants/constants";
import { cn } from "@multi-tenants/utils";
import Button from "../button.jsx";
import Input from "../input.jsx";
import { Dropdown } from "../dropdown.jsx";
import ConfirmModal from "../confirm-modal.jsx";
import Loading from "../loading.jsx";
import {
  FormFieldProvider,
  FieldLabel,
  SectionTitle,
} from "../../contexts/form-field-context.jsx";

const climateOptions = LODGING_CLIMATE_OPTIONS.map((item) => ({
  value: item.value,
  label: item.label,
}));

const bathroomOptions = LODGING_BATHROOM_OPTIONS.map((item) => ({
  value: item.value,
  label: item.label,
}));

const ICON_BTN =
  "h-10 w-10 shrink-0 px-0 inline-flex items-center justify-center";

function canManageOrg(org) {
  return org?.myRole === "OWNER" || org?.myRole === "ADMIN";
}

function formatPrice(price) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(Number(price) || 0);
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatStatus(status) {
  if (!status) return "—";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function Badge({ children, tone = "neutral", className = "" }) {
  const tones = {
    neutral: "bg-zinc-100 text-zinc-700 ring-zinc-200/80",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
    amber: "bg-amber-50 text-amber-800 ring-amber-200/80",
    rose: "bg-rose-50 text-rose-700 ring-rose-200/80",
    sky: "bg-sky-50 text-sky-700 ring-sky-200/80",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        tones[tone] ?? tones.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition",
        active
          ? "bg-primary text-white"
          : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50",
      )}
    >
      <Icon className="icon size-4 shrink-0" />
      {children}
    </button>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
      <Icon className="icon mx-auto size-10 text-zinc-300" />
      <p className="mt-3 text-sm font-medium text-zinc-800">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      ) : null}
    </div>
  );
}

export default function HotelRoomsPage({
  title = "Hotel rooms",
  description = "Manage floors and rooms for your hotels and hostels. Guests book available rooms by date.",
  canManage = true,
}) {
  const [organizations, setOrganizations] = useState([]);
  const [orgId, setOrgId] = useState("");
  const [floors, setFloors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("rooms");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [selectedRoomIds, setSelectedRoomIds] = useState(() => new Set());

  const [floorModal, setFloorModal] = useState(null);
  const [floorName, setFloorName] = useState("");
  const [floorLevel, setFloorLevel] = useState("1");

  const [roomModal, setRoomModal] = useState(null);
  const [roomFloorId, setRoomFloorId] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [roomLabel, setRoomLabel] = useState("");
  const [roomType, setRoomType] = useState("Double Bedroom");
  const [roomPrice, setRoomPrice] = useState("100");
  const [roomCapacity, setRoomCapacity] = useState("2");
  const [roomClimate, setRoomClimate] = useState("ac");
  const [roomBathroom, setRoomBathroom] = useState("private");

  const [toDelete, setToDelete] = useState(null);

  const lodgingOrgs = useMemo(
    () =>
      organizations.filter(
        (org) => isLodgingBusinessType(org.businessType) && canManageOrg(org),
      ),
    [organizations],
  );

  const orgOptions = useMemo(
    () =>
      lodgingOrgs.map((org) => ({
        value: org.id,
        label: `${org.name} · ${formatBusinessTypeLabel(org.businessType)}`,
      })),
    [lodgingOrgs],
  );

  const activeOrg = lodgingOrgs.find((org) => org.id === orgId) ?? null;
  const canEdit = canManage && Boolean(activeOrg && canManageOrg(activeOrg));

  const roomTypeOptions = useMemo(() => {
    const categories = getProductCategoriesForBusiness(activeOrg?.businessType);
    return categories.map((name) => ({ value: name, label: name }));
  }, [activeOrg?.businessType]);

  const allRoomIds = useMemo(
    () => floors.flatMap((floor) => (floor.rooms ?? []).map((r) => r.id)),
    [floors],
  );

  const loadOrgData = useCallback(async (id) => {
    if (!id) {
      setFloors([]);
      setBookings([]);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const [floorRows, bookingRows] = await Promise.all([
        listFloorsRequest(id),
        listBookingsRequest(id),
      ]);
      setFloors(Array.isArray(floorRows) ? floorRows : []);
      setBookings(Array.isArray(bookingRows) ? bookingRows : []);
      setSelectedRoomIds(new Set());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load hotel data",
      );
      setFloors([]);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      setIsLoading(true);
      try {
        const orgs = await listOrganizationsRequest();
        if (cancelled) return;
        const list = Array.isArray(orgs) ? orgs : [];
        setOrganizations(list);
        const lodging = list.filter(
          (org) => isLodgingBusinessType(org.businessType) && canManageOrg(org),
        );
        const first = lodging[0]?.id ?? "";
        setOrgId(first);
        if (first) await loadOrgData(first);
        else setIsLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load organizations",
          );
          setIsLoading(false);
        }
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, [loadOrgData]);

  function handleOrgChange(value) {
    setOrgId(value);
    void loadOrgData(value);
  }

  function toggleRoom(roomId) {
    setSelectedRoomIds((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  }

  function selectAllOnFloor(floor) {
    setSelectedRoomIds((prev) => {
      const next = new Set(prev);
      for (const room of floor.rooms ?? []) next.add(room.id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedRoomIds(new Set());
  }

  function selectAllRooms() {
    setSelectedRoomIds(new Set(allRoomIds));
  }

  function openCreateFloor() {
    setFloorModal({ mode: "create" });
    setFloorName("");
    setFloorLevel(String((floors.at(-1)?.level ?? 0) + 1));
    setError("");
  }

  function openEditFloor(floor) {
    setFloorModal({ mode: "edit", floor });
    setFloorName(floor.name);
    setFloorLevel(String(floor.level));
    setError("");
  }

  async function saveFloor(event) {
    event.preventDefault();
    if (!orgId || !canEdit) return;
    const level = Number(floorLevel);
    if (!floorName.trim() || !Number.isInteger(level)) {
      setError("Floor name and integer level are required");
      return;
    }
    setBusy("floor");
    setError("");
    try {
      if (floorModal?.mode === "edit") {
        await updateFloorRequest(orgId, floorModal.floor.id, {
          name: floorName.trim(),
          level,
        });
      } else {
        await createFloorRequest(orgId, {
          name: floorName.trim(),
          level,
        });
      }
      setFloorModal(null);
      await loadOrgData(orgId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save floor");
    } finally {
      setBusy("");
    }
  }

  function openCreateRoom(floorId) {
    setRoomModal({ mode: "create" });
    setRoomFloorId(floorId || floors[0]?.id || "");
    setRoomNumber("");
    setRoomLabel("");
    setRoomType(roomTypeOptions[0]?.value || "Double Bedroom");
    setRoomPrice("100");
    setRoomCapacity("2");
    setRoomClimate("ac");
    setRoomBathroom("private");
    setError("");
  }

  function openEditRoom(room) {
    setRoomModal({ mode: "edit", room });
    setRoomFloorId(room.floorId);
    setRoomNumber(room.number);
    setRoomLabel(room.label || "");
    setRoomType(room.roomType);
    setRoomPrice(String(room.price));
    setRoomCapacity(String(room.capacity));
    setRoomClimate(room.climate || "ac");
    setRoomBathroom(room.bathroom || "private");
    setError("");
  }

  async function saveRoom(event) {
    event.preventDefault();
    if (!orgId || !canEdit) return;
    const price = Number(roomPrice);
    const capacity = Number(roomCapacity);
    if (!roomFloorId || !roomNumber.trim() || !roomType || price < 0) {
      setError("Floor, number, type, and price are required");
      return;
    }
    setBusy("room");
    setError("");
    try {
      const payload = {
        floorId: roomFloorId,
        number: roomNumber.trim(),
        label: roomLabel.trim() || undefined,
        roomType,
        price,
        capacity: Number.isInteger(capacity) && capacity > 0 ? capacity : 2,
        climate: roomClimate,
        bathroom: roomBathroom,
      };
      if (roomModal?.mode === "edit") {
        await updateRoomRequest(orgId, roomModal.room.id, payload);
      } else {
        await createRoomRequest(orgId, payload);
      }
      setRoomModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save room");
    } finally {
      setBusy("");
    }
  }

  async function applyBulkStatus(status) {
    if (!orgId || !canEdit || selectedRoomIds.size === 0) return;
    setBusy("bulk");
    setError("");
    try {
      await bulkRoomStatusRequest(orgId, [...selectedRoomIds], status);
      await loadOrgData(orgId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update room status",
      );
    } finally {
      setBusy("");
    }
  }

  async function handleConfirmDelete() {
    if (!toDelete || !orgId) return;
    setBusy("delete");
    setError("");
    try {
      if (toDelete.kind === "floor") {
        await deleteFloorRequest(orgId, toDelete.id);
      } else {
        await deleteRoomRequest(orgId, toDelete.id);
      }
      setToDelete(null);
      await loadOrgData(orgId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBusy("");
    }
  }

  async function cancelBooking(booking) {
    if (!orgId || !canEdit) return;
    setBusy(`booking-${booking.id}`);
    setError("");
    try {
      await updateBookingRequest(orgId, booking.id, { status: "cancelled" });
      await loadOrgData(orgId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setBusy("");
    }
  }

  async function approveBooking(booking) {
    if (!orgId || !canEdit) return;
    setBusy(`booking-${booking.id}`);
    setError("");
    try {
      await updateBookingRequest(orgId, booking.id, { status: "confirmed" });
      await loadOrgData(orgId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to approve booking",
      );
    } finally {
      setBusy("");
    }
  }

  const floorOptions = floors.map((floor) => ({
    value: floor.id,
    label: `${floor.name} (L${floor.level})`,
  }));

  return (
    <FormFieldProvider rounded="rounded-xl">
      <div className="mx-auto w-full space-y-6">
        <SectionTitle
          icon={PiBuildings}
          title={title}
          description={description}
        />

        {error && !floorModal && !roomModal ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {lodgingOrgs.length === 0 ? (
          <EmptyState
            icon={PiBed}
            title="No hotel or hostel businesses"
            description="Create a hotel-management or hostel-management organization first."
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 lg:justify-between">
              <Dropdown
                value={orgId}
                onChange={handleOrgChange}
                options={orgOptions}
                triggerClassName="h-11 w-full max-w-[320px] justify-between rounded-xl border-gray-200 px-4 font-normal shadow-none"
              />
              <div className="flex w-full items-center justify-center gap-2">
                <div className="flex gap-2 justify-between w-full">
                  <div className="flex gap-2">
                    <TabButton
                      active={tab === "rooms"}
                      onClick={() => setTab("rooms")}
                      icon={PiStack}
                    >
                      Floors & rooms
                    </TabButton>
                    <TabButton
                      active={tab === "bookings"}
                      onClick={() => setTab("bookings")}
                      icon={PiCalendarBlank}
                    >
                      Reservations
                    </TabButton>
                  </div>

                  {canEdit && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={openCreateFloor}
                        className="h-8 gap-2 px-4"
                      >
                        <PiPlus className="icon size-4" />
                        Add floor
                      </Button>
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() => openCreateRoom()}
                        disabled={floors.length === 0}
                        className="h-8 gap-2 px-4"
                      >
                        <PiBed className="icon size-4" />
                        Add room
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isLoading ? (
              <Loading message="Loading hotel data..." />
            ) : tab === "rooms" ? (
              <div className="space-y-4">
                {canEdit ? (
                  <div className="flex flex-wrap p-3 items-center gap-2">
                    <div className="ml-auto flex flex-wrap items-center gap-2">
                      {selectedRoomIds.size > 0 ? (
                        <span className="mr-1 text-xs font-medium text-zinc-500">
                          {selectedRoomIds.size} selected
                        </span>
                      ) : null}
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={selectAllRooms}
                        className="h-10 gap-2 px-3"
                        aria-label="Select all rooms"
                      >
                        <PiCheck className="icon size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={clearSelection}
                        disabled={selectedRoomIds.size === 0}
                        className={ICON_BTN}
                        aria-label="Clear selection"
                      >
                        <PiXCircle className="icon size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outlined"
                        disabled={selectedRoomIds.size === 0 || busy === "bulk"}
                        onClick={() => void applyBulkStatus("open")}
                        className={cn(
                          ICON_BTN,
                          "text-emerald-700 hover:bg-emerald-50",
                        )}
                        aria-label="Mark selected rooms open"
                      >
                        <PiDoorOpen className="icon size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outlined"
                        disabled={selectedRoomIds.size === 0 || busy === "bulk"}
                        onClick={() => void applyBulkStatus("closed")}
                        className={cn(
                          ICON_BTN,
                          "text-rose-700 hover:bg-rose-50",
                        )}
                        aria-label="Mark selected rooms closed"
                      >
                        <PiLockSimple className="icon size-4" />
                      </Button>
                    </div>
                  </div>
                ) : null}

                {floors.length === 0 ? (
                  <EmptyState
                    icon={PiStack}
                    title="No floors yet"
                    description="Add a floor, then create rooms on it."
                  />
                ) : (
                  floors.map((floor) => (
                    <section
                      key={floor.id}
                      className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b icon border-zinc-100 bg-zinc-50/60 px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-500 ring-1 ring-zinc-200">
                            <PiStack className="icon size-5" />
                          </span>
                          <div className="min-w-0">
                            <h2 className="font-semibold text-zinc-900">
                              {floor.name}
                            </h2>
                            <p className="text-xs text-zinc-500">
                              Level {floor.level} · {floor.rooms?.length ?? 0}{" "}
                              room
                              {(floor.rooms?.length ?? 0) === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>
                        {canEdit ? (
                          <div className="flex flex-wrap gap-1.5">
                            <Button
                              type="button"
                              variant="outlined"
                              onClick={() => selectAllOnFloor(floor)}
                              className={ICON_BTN}
                              aria-label={`Select all rooms on ${floor.name}`}
                            >
                              <PiCheck className="icon size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outlined"
                              onClick={() => openCreateRoom(floor.id)}
                              className={ICON_BTN}
                              aria-label={`Add room on ${floor.name}`}
                            >
                              <PiPlus className="icon size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outlined"
                              onClick={() => openEditFloor(floor)}
                              className={ICON_BTN}
                              aria-label="Edit floor"
                            >
                              <PiPencilSimple className="icon size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outlined"
                              onClick={() =>
                                setToDelete({
                                  kind: "floor",
                                  id: floor.id,
                                  name: floor.name,
                                })
                              }
                              className={cn(
                                ICON_BTN,
                                "text-rose-600 hover:bg-rose-50",
                              )}
                              aria-label="Delete floor"
                            >
                              <PiTrash className="icon size-4" />
                            </Button>
                          </div>
                        ) : null}
                      </div>

                      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {(floor.rooms ?? []).length === 0 ? (
                          <p className="col-span-full rounded-xl border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-500">
                            No rooms on this floor.
                          </p>
                        ) : (
                          (floor.rooms ?? []).map((room) => {
                            const selected = selectedRoomIds.has(room.id);
                            const isOpen = room.status === "open";
                            return (
                              <div
                                key={room.id}
                                role={canEdit ? "button" : undefined}
                                tabIndex={canEdit ? 0 : undefined}
                                onClick={() => canEdit && toggleRoom(room.id)}
                                onKeyDown={(event) => {
                                  if (!canEdit) return;
                                  if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                  ) {
                                    event.preventDefault();
                                    toggleRoom(room.id);
                                  }
                                }}
                                className={cn(
                                  "rounded-2xl border p-4 text-left transition",
                                  selected
                                    ? "border-primary bg-primary/5 ring-2 ring-primary/25"
                                    : "border-zinc-200 bg-white hover:border-primary/35",
                                  canEdit && "cursor-pointer",
                                )}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex min-w-0 items-start gap-2.5">
                                    <span
                                      className={cn(
                                        "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded border",
                                        selected
                                          ? "border-primary bg-primary text-white"
                                          : "border-zinc-300 bg-white text-transparent",
                                      )}
                                      aria-hidden
                                    >
                                      <PiCheckCircle className="icon size-3.5" />
                                    </span>
                                    <div className="min-w-0">
                                      <p className="flex items-center gap-1.5 font-semibold text-zinc-900">
                                        <PiBed className="icon size-4 shrink-0 text-zinc-400" />
                                        Room {room.number}
                                      </p>
                                      <p className="mt-0.5 truncate text-xs text-zinc-500">
                                        {room.roomType}
                                        {room.label ? ` · ${room.label}` : ""}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge
                                    tone={isOpen ? "emerald" : "rose"}
                                    className="uppercase font-bold"
                                  >
                                    {isOpen ? (
                                      <PiDoorOpen className="icon size-3" />
                                    ) : (
                                      <PiLockSimple className="icon size-3" />
                                    )}
                                    {isOpen ? "Open" : "Closed"}
                                  </Badge>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                                  <span className="inline-flex items-center gap-1">
                                    <PiUsers className="icon size-3.5" />
                                    {room.capacity}
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <PiThermometer className="icon size-3.5" />
                                    {formatLodgingAttributeLabel(
                                      "climate",
                                      room.climate || "ac",
                                    )}
                                  </span>
                                  <span className="inline-flex px-5 py-2 bg-gray-50 border border-gray-200 rounded-full items-center gap-1">
                                    <PiShower className="icon size-3.5" />
                                    {formatLodgingAttributeLabel(
                                      "bathroom",
                                      room.bathroom || "private",
                                    )}
                                  </span>
                                </div>

                                <div className="mt-3 flex items-center justify-between border-t icon border-zinc-100 pt-3">
                                  <p className="text-sm font-semibold text-primary">
                                    {formatPrice(room.price)}
                                    <span className="text-xs font-normal text-zinc-500">
                                      /night
                                    </span>
                                  </p>
                                  {canEdit ? (
                                    <div className="flex gap-1">
                                      <Button
                                        type="button"
                                        variant="outlined"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          openEditRoom(room);
                                        }}
                                        className="h-10 w-10 px-0"
                                        aria-label={`Edit room ${room.number}`}
                                      >
                                        <PiPencilSimple className="icon size-3.5" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outlined"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          setToDelete({
                                            kind: "room",
                                            id: room.id,
                                            name: `Room ${room.number}`,
                                          });
                                        }}
                                        className="h-10 w-10 px-0 text-rose-600 hover:bg-rose-50"
                                        aria-label={`Delete room ${room.number}`}
                                      >
                                        <PiTrash className="icon size-3.5" />
                                      </Button>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </section>
                  ))
                )}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
                {bookings.length === 0 ? (
                  <EmptyState
                    icon={PiCalendarBlank}
                    title="No reservations yet"
                    description="Guest booking requests will appear here for approval."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left text-sm">
                      <thead className="border-b icon border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        <tr>
                          <th className="px-4 py-3">Guest</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Dates</th>
                          <th className="px-4 py-3">Rooms</th>
                          <th className="px-4 py-3">Total</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr
                            key={booking.id}
                            className="border-b icon border-zinc-100 last:border-0"
                          >
                            <td className="px-4 py-3 font-medium text-zinc-900">
                              {booking.guestName}
                            </td>
                            <td className="px-4 py-3 text-zinc-600">
                              {booking.guestEmail}
                            </td>
                            <td className="px-4 py-3 text-zinc-700">
                              <span className="inline-flex items-center gap-1.5">
                                <PiCalendarBlank className="icon size-3.5 text-zinc-400" />
                                {formatDate(booking.checkIn)} →{" "}
                                {formatDate(booking.checkOut)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-zinc-700">
                              <span className="inline-flex items-center gap-1.5">
                                <PiBed className="icon size-3.5 text-zinc-400" />
                                {(booking.rooms ?? [])
                                  .map((br) => br.room?.number)
                                  .filter(Boolean)
                                  .join(", ") || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-zinc-900">
                              {formatPrice(booking.totalPrice)}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                tone={
                                  booking.status === "confirmed"
                                    ? "emerald"
                                    : booking.status === "pending"
                                      ? "amber"
                                      : booking.status === "cancelled"
                                        ? "rose"
                                        : "neutral"
                                }
                                className="px-5 py-2"
                              >
                                {booking.status === "confirmed" ? (
                                  <PiCheckCircle className="icon size-3" />
                                ) : booking.status === "cancelled" ? (
                                  <PiXCircle className="icon size-3" />
                                ) : null}
                                {formatStatus(booking.status)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                              {canEdit && booking.status === "pending" ? (
                                <div className="flex justify-end gap-1.5">
                                  <Button
                                    type="button"
                                    variant="outlined"
                                    disabled={busy === `booking-${booking.id}`}
                                    onClick={() => void approveBooking(booking)}
                                    className="h-9 gap-1.5 px-3 text-emerald-700 hover:bg-emerald-50"
                                  >
                                    <PiCheckCircle className="icon size-4" />
                                    Allow
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outlined"
                                    disabled={busy === `booking-${booking.id}`}
                                    onClick={() => void cancelBooking(booking)}
                                    className="h-9 gap-1.5 px-3 text-rose-600 hover:bg-rose-50"
                                  >
                                    <PiXCircle className="icon size-4" />
                                    Cancel
                                  </Button>
                                </div>
                              ) : null}
                              {canEdit && booking.status === "confirmed" ? (
                                <Button
                                  type="button"
                                  variant="outlined"
                                  disabled={busy === `booking-${booking.id}`}
                                  onClick={() => void cancelBooking(booking)}
                                  className="h-9 gap-1.5 px-3 text-rose-600 hover:bg-rose-50"
                                >
                                  <PiXCircle className="icon size-4" />
                                  Cancel
                                </Button>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {floorModal ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => busy !== "floor" && setFloorModal(null)}
          />
          <form
            onSubmit={(event) => void saveFloor(event)}
            className="relative z-10 w-full max-w-md space-y-4 rounded-[28px] bg-white p-8 shadow-2xl"
          >
            <SectionTitle
              icon={PiStack}
              title={floorModal.mode === "edit" ? "Edit floor" : "Add floor"}
              description="Floors group rooms in your hotel."
            />
            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <div>
              <FieldLabel>Name</FieldLabel>
              <Input
                value={floorName}
                onChange={(e) => setFloorName(e.target.value)}
                className="mt-1.5 h-11"
                required
              />
            </div>
            <div>
              <FieldLabel>Level</FieldLabel>
              <Input
                type="number"
                value={floorLevel}
                onChange={(e) => setFloorLevel(e.target.value)}
                className="mt-1.5 h-11"
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outlined"
                className="flex-1"
                disabled={busy === "floor"}
                onClick={() => setFloorModal(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={busy === "floor"}
              >
                {busy === "floor" ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {roomModal ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => busy !== "room" && setRoomModal(null)}
          />
          <form
            onSubmit={(event) => void saveRoom(event)}
            className="relative z-10 max-h-[90vh] w-full max-w-md space-y-4 overflow-y-auto rounded-[28px] bg-white p-8 shadow-2xl"
          >
            <SectionTitle
              icon={PiBed}
              title={roomModal.mode === "edit" ? "Edit room" : "Add room"}
              description="Each room has a number, type, and nightly price."
            />
            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <div>
              <FieldLabel>Floor</FieldLabel>
              <Dropdown
                value={roomFloorId}
                onChange={setRoomFloorId}
                options={floorOptions}
                triggerClassName="mt-1.5 h-11 w-full justify-between rounded-xl border-gray-200 px-4 font-normal shadow-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Number</FieldLabel>
                <Input
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="mt-1.5 h-11"
                  required
                />
              </div>
              <div>
                <FieldLabel>Capacity</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  value={roomCapacity}
                  onChange={(e) => setRoomCapacity(e.target.value)}
                  className="mt-1.5 h-11"
                />
              </div>
            </div>
            <div>
              <FieldLabel>Type</FieldLabel>
              <Dropdown
                value={roomType}
                onChange={setRoomType}
                options={roomTypeOptions}
                triggerClassName="mt-1.5 h-11 w-full justify-between rounded-xl border-gray-200 px-4 font-normal shadow-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Climate</FieldLabel>
                <Dropdown
                  value={roomClimate}
                  onChange={setRoomClimate}
                  options={climateOptions}
                  triggerClassName="mt-1.5 h-11 w-full justify-between rounded-xl border-gray-200 px-4 font-normal shadow-none"
                />
              </div>
              <div>
                <FieldLabel>Bathroom</FieldLabel>
                <Dropdown
                  value={roomBathroom}
                  onChange={setRoomBathroom}
                  options={bathroomOptions}
                  triggerClassName="mt-1.5 h-11 w-full justify-between rounded-xl border-gray-200 px-4 font-normal shadow-none"
                />
              </div>
            </div>
            <div>
              <FieldLabel>Label (optional)</FieldLabel>
              <Input
                value={roomLabel}
                onChange={(e) => setRoomLabel(e.target.value)}
                className="mt-1.5 h-11"
                placeholder="Ocean view"
              />
            </div>
            <div>
              <FieldLabel>Price per night</FieldLabel>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={roomPrice}
                onChange={(e) => setRoomPrice(e.target.value)}
                className="mt-1.5 h-11"
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outlined"
                className="flex-1"
                disabled={busy === "room"}
                onClick={() => setRoomModal(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={busy === "room"}
              >
                {busy === "room" ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={Boolean(toDelete)}
        title={toDelete?.kind === "floor" ? "Delete floor?" : "Delete room?"}
        description={
          toDelete
            ? `"${toDelete.name}" will be removed permanently.`
            : "This cannot be undone."
        }
        confirmLabel="Delete"
        isConfirming={busy === "delete"}
        onClose={() => {
          if (busy === "delete") return;
          setToDelete(null);
        }}
        onConfirm={() => void handleConfirmDelete()}
      />
    </FormFieldProvider>
  );
}
