import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { m } from "framer-motion";
import HorizontalLoader from "../components/horizontal-loader";
import { usePermissions } from "../hooks/use-permissions";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Filter,
  Video,
  MapPin,
  ChevronDown,
  X,
  Eye,
  ArrowRight,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Badge } from "../components/ui/badge";
import { userService } from "../services/user-service";
import meetingService from "../services/meeting-service";
import projectService from "../services/project-service";
import teamService from "../services/team-service";
import friendService from "../services/friend-service";
import { useAuth } from "../contexts/auth-context";
import { useNotifications } from "../contexts/notification-context";
import UserAvatar, { AvatarGroup } from "../components/user-avatar";
import UserDetailsModal from "../components/user-details-modal";
import {
  getButtonClasses
} from "../utils/ui-constants";
import { cn } from "../lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { DatePicker } from "../components/ui/date-picker";
import { PiCalendarDuotone } from "react-icons/pi";
import { getAvatarProps } from "@/utils/avatar-utils";


const selectAllCheckedState = (filteredLen, selectedLen) => {
  if (filteredLen === 0) return false;
  if (selectedLen === filteredLen) return true;
  if (selectedLen > 0) return "indeterminate";
  return false;
};
const meetingFormTitle = (editingMeeting) =>
  editingMeeting ? "Edit Meeting" : "Create Meeting";
const meetingFormSubtitle = (editingMeeting) =>
  editingMeeting
    ? "Update meeting details, attendees, and schedule"
    : "Let's schedule a meeting for your workspace";
const zoomTitleHint = (title) =>
  title
    ? "Create video meeting (Jitsi Meet)"
    : "Please enter a meeting title first";
const descriptionOrDefault = (description) =>
  description || "No description provided for this meeting.";
const dateOrFallback = (date, fallback) =>
  date ? new Date(date).toLocaleDateString() : fallback;
const locationOrDefault = (location) => location || "No location provided";
const assignedName = (user) => user?.username || "Unassigned";
const organizerName = (user) => user?.username || "Unknown";
const attendeeDisplayName = (attendee) =>
  attendee.username || attendee.name || "Attendee";
const relatedMeetingDate = (date) =>
  date ? new Date(date).toLocaleDateString() : "No date";
const meetingLinkOverdueText = (isOverdue) =>
  isOverdue ? "Meeting Overdue" : "Not provided";
const canShowJoinLink = (link, isOverdue) => Boolean(link) && !isOverdue;
const hasAttendees = (attendees) => Boolean(attendees && attendees.length > 0);
const saveButtonLabel = (editingMeeting) =>
  editingMeeting ? "Update" : "Schedule";
const isMeetingOwner = (user, meeting) =>
  Boolean(user && user.id && meeting.assignedBy?.id === user.id);

const MeetingsHeaderSection = ({
  itemVariants,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  selectedMeetings,
  handleBulkDelete,
  permissions,
  setEditingMeeting,
  resetMeetingForm,
  setShowNewMeetingPopup,
}) => (
  <>
    {/* Header */}
        <div className="flex py-6 gap-3 items-center fixed z-10 md:-top-3 -top-30 z-10">
          <div className="flex p-2 border-2 items-center gap-2 pr-10 rounded-[15px]">
            <div className="flex p-3 bg-white dark:bg-gray-800 rounded-[15px]">
              <Calendar size={15} />
            </div>
            <h1 className="text-2xl font-bold">Meetings Scheduled</h1>
          </div>
        </div>

        <m.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <m.div variants={itemVariants}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 icon  icon" />
                    <Input
                      type="text"
                      placeholder="Search meetings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="md:w-[500px] w-full pl-10 pr-4 py-3 border border-gray-200 h-13 dark:border-gray-700   bg-white dark:bg-[black] text-black dark:text-white"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="md:w-[180px] w-1/2 px-5 h-13 bg-white cursor-pointer dark:bg-[black] dark:text-white">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[black]  border-gray-200 dark:border-gray-700">
                        <SelectItem
                          className={"cursor-pointer h-10 px-5"}
                          value="all"
                        >
                          All Status
                        </SelectItem>
                        <SelectItem
                          className={"cursor-pointer h-10 px-5"}
                          value="scheduled"
                        >
                          Scheduled
                        </SelectItem>
                        <SelectItem
                          className={"cursor-pointer h-10 px-5"}
                          value="pregress"
                        >
                          In Progress
                        </SelectItem>
                        <SelectItem
                          className={"cursor-pointer h-10 px-5"}
                          value="completed"
                        >
                          Completed
                        </SelectItem>
                        <SelectItem
                          className={"cursor-pointer h-10 px-5"}
                          value="cancelled"
                        >
                          Cancelled
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="md:w-[180px] w-1/2 px-5 h-13 cursor-pointer bg-white dark:bg-[black] dark:text-white">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[black]  border-gray-200 dark:border-gray-700">
                        <SelectItem
                          className={"cursor-pointer h-10 px-5"}
                          value="all"
                        >
                          All Types
                        </SelectItem>
                        <SelectItem
                          className={"cursor-pointer h-10 px-5"}
                          value="online"
                        >
                          Online
                        </SelectItem>
                        <SelectItem
                          className={"cursor-pointer h-10 px-5"}
                          value="in-person"
                        >
                          In Person
                        </SelectItem>
                        <SelectItem
                          className={"cursor-pointer h-10 px-5"}
                          value="hybrid"
                        >
                          Hybrid
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </m.div>
            </div>
            <div className="flex items-center gap-3">
              {selectedMeetings.length > 0 && (
                <m.button
                  onClick={handleBulkDelete}
                  className="flex items-center h-12 flex items-center justify-center font-bold gap-2 px-4 py-2 bg-red-600 text-white rounded-[15px] md:w-[200px] w-[400px] hover:bg-red-700 transition-colors"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Trash2 className="w-4 h-4 icon icon icon" />
                  Delete ({selectedMeetings.length})
                </m.button>
              )}

              {permissions.canCreateMeeting && (
                <Button
                  onClick={() => {
                    if (!permissions.canCreateMeeting) {
                      toast.error(
                        "You do not have permission to create meetings. Contact an admin.",
                      );
                      return;
                    }
                    setEditingMeeting(null);
                    resetMeetingForm();
                    setShowNewMeetingPopup(true);
                  }}
                  className={
                    "md:w-[200px] w-full rounded-[15px] h-12 font-bold"
                  }
                >
                  <PiCalendarDuotone />
                  Schedule Meeting
                </Button>
              )}
            </div>
          </div>
        </m.div>

        {/* Search and Filters */}
  </>
);

const MeetingsTableSection = ({
  itemVariants,
  filteredMeetings,
  selectedMeetings,
  handleSelectAll,
  loading,
  handleSelectMeeting,
  getStatusIcon,
  getTypeColor,
  isMeetingOverdue,
  getDisplayStatus,
  getStatusColor,
  handleStatusChangeWithConfirmation,
  handleUserAvatarClick,
  user,
  handleViewMeetingDetails,
  handleEditMeeting,
  handleDeleteMeeting,
  handleJoinMeeting,
}) => (
  <>
    {/* Meetings Table */}
        <m.div
          variants={itemVariants}
          className="bg-white dark:bg-[black] rounded-[15px] shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <table className="w-full rounded-[15px]">
              <thead className="bg-white rounded-[15px] text-black border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left w-12">
                    <Checkbox
                      checked={selectAllCheckedState(filteredMeetings.length, selectedMeetings.length)}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all meetings"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">
                    Meeting
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider"></th>
                  <th className="px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center">
                      <HorizontalLoader
                        message="Loading meetings..."
                        subMessage="Fetching your meeting schedule"
                        progress={70}
                        className="py-4"
                      />
                    </td>
                  </tr>
                ) : filteredMeetings.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No meetings found
                    </td>
                  </tr>
                ) : (
                  filteredMeetings.map((meeting) => (
                    <m.tr
                      key={meeting.id}
                      className={`hover:bg-gray-50 dark:hover:bg-black transition-colors ${selectedMeetings.includes(meeting.id) ? "bg-gray-100 dark:bg-[black]" : ""}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td
                        className="px-6 py-4 w-12"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedMeetings.includes(meeting.id)}
                          onCheckedChange={() =>
                            handleSelectMeeting(meeting.id)
                          }
                          aria-label={`Select meeting ${meeting.title}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm  text-gray-900 flex items-center gap-2 dark:text-white truncate font-semibold">
                            {getStatusIcon(meeting.status)}
                            {meeting.title}
                          </div>
                          {/* <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {meeting.description}
                        </div> */}
                          {/* {meeting.tags && meeting.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {meeting.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-[15px] text-xs font-medium bg-gray-100 dark:bg-[black] text-gray-800 dark:text-gray-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )} */}
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <div
                          className={`inline-flex items-center justify-center uppercase px-2.5 py-0.5 rounded-[15px] text-[9px] ${getTypeColor(meeting.type)}`}
                        >
                          {meeting.type === "online" && (
                            <div className="flex items-center gap-2 font-semibold">
                              Online
                            </div>
                          )}
                          {meeting.type === "in-person" && (
                            <div className="flex items-center gap-2 font-semibold">
                              {/* <MapPin className="w-4 h-4 icon icon icon" /> In */}
                              In Person
                            </div>
                          )}
                          {meeting.type === "hybrid" && (
                            <div className="flex items-center gap-2 font-semibold">
                              {/* <Calendar className="w-4 h-4 icon icon icon" />{" "} */}
                              Hybrid
                            </div>
                          )}
                          {/* {meeting.type.replaceAll("-", " ")} */}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const overdue = isMeetingOverdue(meeting);
                            const displayStatus = getDisplayStatus(meeting);
                            return (
                              <span
                                className={`inline-flex items-center gap-1 justify-center font-bold rounded-[15px] text-[9px] uppercase truncate ${getStatusColor(meeting.status, overdue)}`}
                              >
                                {/* {getStatusIcon(meeting.status, overdue)} */}
                                {displayStatus}
                              </span>
                            );
                          })()}
                          {(() => {
                            const overdue = isMeetingOverdue(meeting);
                            const canResolve =
                              meeting.status === "scheduled" || overdue;
                            return (
                              canResolve && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() =>
                                      handleStatusChangeWithConfirmation(
                                        meeting.id,
                                        "completed",
                                        meeting.title,
                                      )
                                    }
                                    className="p-1 rounded-[15px] bg-green-100 w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 transition-colors"
                                    title="Mark as Completed"
                                  >
                                    <CheckCircle className="w-4 h-4 icon icon text-green-600 dark:text-green-400" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusChangeWithConfirmation(
                                        meeting.id,
                                        "cancelled",
                                        meeting.title,
                                      )
                                    }
                                    className="p-1 rounded-[15px] bg-red-100 w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
                                    title="Cancel Meeting"
                                  >
                                    <AlertCircle className="w-4 h-4 icon icon text-red-600 dark:text-red-400" />
                                  </button>
                                </div>
                              )
                            );
                          })()}
                          {meeting.status === "completed" && (
                            <button
                              onClick={() =>
                                handleStatusChangeWithConfirmation(
                                  meeting.id,
                                  "cancelled",
                                  meeting.title,
                                )
                              }
                              className="p-1 rounded-[15px] bg-red-100 w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
                              title="Mark as Cancelled"
                            >
                              <AlertCircle className="w-4 h-4 icon icon text-red-600 dark:text-red-400" />
                            </button>
                          )}
                          {meeting.status === "cancelled" && (
                            <button
                              onClick={() =>
                                handleStatusChangeWithConfirmation(
                                  meeting.id,
                                  "completed",
                                  meeting.title,
                                )
                              }
                              className="p-1 rounded-[15px] bg-green-100 w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 transition-colors"
                              title="Mark as Completed"
                            >
                              <CheckCircle className="w-4 h-4 icon icon text-green-600 dark:text-green-400" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 w-[180px]">
                        <AvatarGroup
                          users={meeting.attendees}
                          max={4}
                          size="md"
                          emptyLabel="No attendees"
                          onUserClick={(id) => id && handleUserAvatarClick(id)}
                        />
                      </td>
                      <td className="px-6 py-4 w-[200px]">
                        {meeting.project ? (
                          <div className="flex items-center gap-2">
                            {meeting.project.logo && (
                            <img 
                            {...getAvatarProps(meeting.project.logo, meeting.project.name)}
                            alt={meeting.project.name || "User"}
                            className="w-6 h-6 rounded-[15px] object-cover border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => attendee.id && handleUserAvatarClick(attendee.id)}
                            title={meeting.attendees.username ? `View ${meeting.attendees.username}'s profile` : ''}
                          />
                          )}
                            <span className="text-sm text-gray-900 dark:text-white truncate">
                              {meeting.project.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            No Project
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 icon icon text-gray-400 icon" />
                          <div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {meeting.startDate
                                ? new Date(
                                    meeting.startDate,
                                  ).toLocaleDateString()
                                : "N/A"}
                            </div>
                            {/* <div className="text-xs text-gray-500 dark:text-gray-400">
                            {meeting.startDate ? new Date(meeting.startDate).toLocaleTimeString() : 'N/A'} - {meeting.endDate ? new Date(meeting.endDate).toLocaleTimeString() : 'N/A'}
                          </div> */}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white truncate">
                          {meeting.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewMeetingDetails(meeting)}
                            className="p-2 text-gray-400 h-10 w-10 hover:text-black dark:hover:text-white"
                            title="View meeting details"
                          >
                            <Eye className="w-4 h-4 icon icon" />
                          </Button>
                          {user &&
                            user.id &&
                            meeting.assignedBy?.id === user.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditMeeting(meeting)}
                                className="p-2 text-gray-400 h-10 w-10 hover:text-black dark:hover:text-white"
                              >
                                <Edit className="w-4 h-4 icon icon icon" />
                              </Button>
                            )}
                          {user &&
                            user.id &&
                            meeting.assignedBy?.id === user.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMeeting(meeting.id)}
                                className="p-2 text-gray-400 h-10 w-10 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 icon icon icon" />
                              </Button>
                            )}
                          <DropdownMenu>
                            <DropdownMenuContent
                              align="end"
                              className="bg-white dark:bg-[black]  border-gray-200 dark:border-gray-700"
                            >
                              {/* Status Update Options */}
                              {meeting.status === "scheduled" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChangeWithConfirmation(
                                        meeting.id,
                                        "completed",
                                        meeting.title,
                                      )
                                    }
                                    className="text-green-600 dark:text-green-400 h-12 px-5 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/20"
                                  >
                                    <CheckCircle className="w-4 h-4 icon icon mr-2 icon" />
                                    Mark as Completed
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChangeWithConfirmation(
                                        meeting.id,
                                        "cancelled",
                                        meeting.title,
                                      )
                                    }
                                    className="text-red-600 dark:text-red-400 h-12 px-5 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20"
                                  >
                                    <AlertCircle className="w-4 h-4 icon icon mr-2 icon" />
                                    Cancel Meeting
                                  </DropdownMenuItem>
                                </>
                              )}
                              {meeting.status === "completed" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChangeWithConfirmation(
                                      meeting.id,
                                      "cancelled",
                                      meeting.title,
                                    )
                                  }
                                  className="text-red-600 dark:text-red-400 h-12 px-5 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20"
                                >
                                  <AlertCircle className="w-4 h-4 icon icon mr-2 icon" />
                                  Mark as Cancelled
                                </DropdownMenuItem>
                              )}
                              {meeting.status === "cancelled" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChangeWithConfirmation(
                                      meeting.id,
                                      "completed",
                                      meeting.title,
                                    )
                                  }
                                  className="text-green-600 dark:text-green-400 h-12 px-5 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/20"
                                >
                                  <CheckCircle className="w-4 h-4 icon icon mr-2 icon" />
                                  Mark as Completed
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-black dark:text-white h-12 px-5 cursor-pointer hover:bg-gray-100 dark:hover:bg-black"
                                onClick={() =>
                                  handleJoinMeeting(meeting.meetingLink)
                                }
                              >
                                <Video className="w-4 h-4 icon icon mr-2 icon" />
                                Join Meeting
                              </DropdownMenuItem>
                              {user &&
                                user.id &&
                                meeting.assignedBy?.id === user.id && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteMeeting(meeting.id)
                                    }
                                    className="text-red-600 hover:bg-red-500 hover:text-white px-5 h-12 cursor-pointer dark:hover:bg-red-900"
                                  >
                                    <Trash2 className="w-4 h-4 icon icon mr-2 icon" />
                                    Delete Meeting
                                  </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </m.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </m.div>
  </>
);

const UserSuggestionList = ({ show, suggestions, onSelect, onAvatarClick }) => {
  if (!show || suggestions.length === 0) return null;
  return (
    <div className="absolute z-10 w-full mt-1  border-gray-200 dark:border-gray-700 rounded-[15px] shadow-lg max-h-48 overflow-y-auto">
      {suggestions.map((user) => (
        <div
          key={user.id}
          onClick={() => onSelect(user)}
          className="px-4 py-3 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
        >
          <div className="flex items-center gap-3">
            <UserAvatar
              user={user}
              size="md"
              onClick={(id) => id && onAvatarClick(id)}
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {user.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SelectedAttendeesList = ({
  attendees,
  onRemove,
  onAvatarClick,
}) => {
  if (attendees.length === 0) return null;
  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        {attendees.map((attendee) => (
          <div
            key={attendee.id}
            className="flex items-center gap-2 bg-gray-100 dark:bg-black px-3 py-2 rounded-[15px]"
          >
            <UserAvatar
              user={attendee}
              size="sm"
              onClick={(id) => id && onAvatarClick(id)}
            />
            <span className="text-sm text-gray-900 dark:text-white">
              {attendee.name}
            </span>
            <button
              onClick={() => onRemove(attendee.id)}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="w-4 h-4 icon icon icon" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ZoomScheduleButton = ({
  loading,
  title,
  onClick,
}) => (
  <Button
    type="button"
    onClick={onClick}
    disabled={loading || !title}
    variant={"default"}
    title={zoomTitleHint(title)}
  >
    {loading ? (
      <span className="loader w-4 h-4"></span>
    ) : (
      <>
        <Video className="w-4 h-4 icon icon mr-2 icon" />
        Schedule Video Meeting
      </>
    )}
  </Button>
);

const MeetingSaveButton = ({ loading, editingMeeting, onClick }) => (
  <Button
    onClick={onClick}
    disabled={loading}
    className={`${getButtonClasses("primary", "md", "flex-1")} font-bold disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {loading ? (
      <span className="loader w-5 h-5"></span>
    ) : (
      saveButtonLabel(editingMeeting)
    )}
  </Button>
);

const NewMeetingPopupSection = ({
  showNewMeetingPopup,
  handleCloseMeetingPopup,
  editingMeeting,
  newMeeting,
  setNewMeeting,
  handleAssignedToChange,
  setShowAssignedToSuggestions,
  showAssignedToSuggestions,
  assignedToSuggestions,
  selectUser,
  handleUserAvatarClick,
  handleScheduleZoomMeeting,
  loading,
  handleAttendeeSearch,
  attendeeSuggestions,
  setShowAttendeeSuggestions,
  showAttendeeSuggestions,
  handleAddAttendee,
  handleRemoveAttendee,
  projects,
  handleNewMeeting,
}) => {
  if (!showNewMeetingPopup) return null;
  return (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-opacity-50 bg-black/50 icon flex items-center justify-center p-4 z-50"
            onClick={handleCloseMeetingPopup}
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">
                    {meetingFormTitle(editingMeeting)}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {meetingFormSubtitle(editingMeeting)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseMeetingPopup}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <Input
                    type="text"
                    value={newMeeting.title}
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, title: e.target.value })
                    }
                    className="w-full"
                    placeholder="Enter meeting title"
                  />
                </div>

                <div>
                  <Textarea
                    value={newMeeting.description}
                    onChange={(e) =>
                      setNewMeeting({
                        ...newMeeting,
                        description: e.target.value,
                      })
                    }
                    className="w-full"
                    placeholder="Enter meeting description"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Select
                      value={newMeeting.type || undefined}
                      onValueChange={(value) =>
                        setNewMeeting({ ...newMeeting, type: value })
                      }
                    >
                      <SelectTrigger className="w-full  border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Select meeting type" />
                      </SelectTrigger>
                      <SelectContent className="  border-gray-200 dark:border-gray-700">
                        <SelectItem
                          className={"cursor-pointer h-10 px-5"}
                          value="online"
                        >
                          Online
                        </SelectItem>
                        <SelectItem
                          className={"cursor-pointer h-10 px-5"}
                          value="in-person"
                        >
                          In Person
                        </SelectItem>
                        <SelectItem
                          className={"cursor-pointer h-10 px-5"}
                          value="hybrid"
                        >
                          Hybrid
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Input
                      type="text"
                      value={newMeeting.location}
                      onChange={(e) =>
                        setNewMeeting({
                          ...newMeeting,
                          location: e.target.value,
                        })
                      }
                      className="w-full"
                      placeholder="Enter location or platform"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Input
                      type="text"
                      value={newMeeting.assignedTo}
                      onChange={(e) => handleAssignedToChange(e.target.value)}
                      onFocus={() => {
                        if (newMeeting.assignedTo.length > 0) {
                          setShowAssignedToSuggestions(true);
                        }
                      }}
                      className="w-full"
                      placeholder="Assign To Person"
                    />
                    <UserSuggestionList
                      show={showAssignedToSuggestions}
                      suggestions={assignedToSuggestions}
                      onSelect={selectUser}
                      onAvatarClick={handleUserAvatarClick}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <DatePicker
                      value={newMeeting.startDate}
                      onChange={(value) =>
                        setNewMeeting({ ...newMeeting, startDate: value })
                      }
                      placeholder="Start date"
                      disablePast
                    />
                  </div>

                  <div>
                    <DatePicker
                      value={newMeeting.endDate}
                      onChange={(value) =>
                        setNewMeeting({ ...newMeeting, endDate: value })
                      }
                      placeholder="End date"
                      disablePast
                    />
                  </div>
                </div>

                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                      type="url"
                      value={newMeeting.meetingLink}
                      onChange={(e) =>
                        setNewMeeting({
                          ...newMeeting,
                          meetingLink: e.target.value,
                        })
                      }
                      className="w-full"
                      placeholder="Enter meeting link or create Zoom meeting"
                    />
                    <ZoomScheduleButton
                      loading={loading}
                      title={newMeeting.title}
                      onClick={handleScheduleZoomMeeting}
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search and add attendees..."
                      onChange={(e) => handleAttendeeSearch(e.target.value)}
                      onFocus={() => {
                        if (attendeeSuggestions.length > 0) {
                          setShowAttendeeSuggestions(true);
                        }
                      }}
                      className="w-full"
                    />
                    <UserSuggestionList
                      show={showAttendeeSuggestions}
                      suggestions={attendeeSuggestions}
                      onSelect={handleAddAttendee}
                      onAvatarClick={handleUserAvatarClick}
                    />
                  </div>

                  <SelectedAttendeesList
                    attendees={newMeeting.attendees}
                    onRemove={handleRemoveAttendee}
                    onAvatarClick={handleUserAvatarClick}
                  />
                </div>

                <div>
                  <Select
                    value={
                      newMeeting.projectId && newMeeting.projectId !== "none"
                        ? newMeeting.projectId
                        : undefined
                    }
                    onValueChange={(value) =>
                      setNewMeeting({ ...newMeeting, projectId: value })
                    }
                  >
                    <SelectTrigger className="w-full  border-gray-200 dark:border-gray-700">
                      <SelectValue placeholder="Select project (optional)" />
                    </SelectTrigger>
                    <SelectContent className="  border-gray-200 dark:border-gray-700">
                      <SelectItem
                        className={"cursor-pointer h-10 px-5"}
                        value="none"
                      >
                        No Project
                      </SelectItem>
                      {projects.map((project) => (
                        <SelectItem
                          className={"cursor-pointer h-10 px-5"}
                          key={project.id}
                          value={project.id}
                        >
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 mt-6 text-white dark:text-black">
                <Button
                  onClick={handleCloseMeetingPopup}
                  variant={"outline"}
                  className={"flex-1 text-black dark:text-white"}
                >
                  Cancel
                </Button>
                <MeetingSaveButton
                  loading={loading}
                  editingMeeting={editingMeeting}
                  onClick={handleNewMeeting}
                />
              </div>
            </m.div>
          </m.div>
  );
};

const MeetingTypeIcon = ({ type }) => {
  if (type === "online") return <Video className="w-3 h-3 icon" />;
  if (type === "in-person") return <MapPin className="w-3 h-3 icon" />;
  if (type === "hybrid") return <Calendar className="w-3 h-3 icon" />;
  return null;
};

const MeetingProjectBadge = ({ project }) => {
  if (!project) return null;
  return (
    <Badge className="inline-flex items-center gap-2 rounded-[15px] px-3 py-1 text-xs font-medium border border-transparent bg-[#FF914B] text-black">
      <FolderOpen className="w-3 h-3 icon" />
      {project.name}
    </Badge>
  );
};

const MeetingJoinLink = ({ meeting, isMeetingOverdue }) => {
  const overdue = isMeetingOverdue(meeting);
  if (canShowJoinLink(meeting.meetingLink, overdue)) {
    return (
      <a
        href={meeting.meetingLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
      >
        Join Meeting
      </a>
    );
  }
  return (
    <p className="text-sm text-gray-900 dark:text-white">
      {meetingLinkOverdueText(overdue)}
    </p>
  );
};

const MeetingPersonEmail = ({ email }) => {
  if (!email) return null;
  return <p className="text-xs text-muted-foreground">{email}</p>;
};

const MeetingAttendeesBlock = ({ attendees, onUserClick }) => {
  if (!hasAttendees(attendees)) {
    return (
      <p className="text-sm text-muted-foreground">
        No attendees listed.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {attendees.slice(0, 2).map((attendee, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-white/10 rounded-[15px]"
        >
          <UserAvatar
            user={attendee}
            size="md"
            onClick={(id) => id && onUserClick(id)}
          />
          <div className="w-full justify-between items-center flex">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {attendeeDisplayName(attendee)}
            </p>
            <span className="px-5 py-2 border border-transparent bg-sky-500 text-[10px] uppercase font-bold text-white rounded-[15px]">
              Attendee
            </span>
          </div>
        </div>
      ))}
      {attendees.length > 6 ? (
        <p className="text-xs text-muted-foreground">
          +{attendees.length - 2} more attendee(s)
        </p>
      ) : null}
    </div>
  );
};

const MeetingRelatedBlock = ({
  relatedMeetings,
  onRelatedClick,
  getMeetingStatusBadgeStyles,
  isMeetingOverdue,
  formatLabel,
  getDisplayStatus,
}) => {
  if (relatedMeetings.length <= 0) return null;
  return (
    <div className="shadow-sm">
      <div className="space-y-2">
        {relatedMeetings.slice(0, 3).map((relatedMeeting) => {
          const relatedId = relatedMeeting.id || relatedMeeting._id;
          return (
            <button
              key={relatedId}
              type="button"
              onClick={() => onRelatedClick(relatedMeeting)}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3 p-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                    {relatedMeeting.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    DATE -{" "}
                    <span className="font-bold text-black dark:text-white">
                      {relatedMeetingDate(relatedMeeting.startDate)}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      "inline-flex items-center gap-1 rounded-[15px] px-2.5 py-1 text-[10px] font-medium border backdrop-blur-sm",
                      getMeetingStatusBadgeStyles(
                        relatedMeeting.status,
                        isMeetingOverdue(relatedMeeting),
                      ),
                    )}
                  >
                    {formatLabel(getDisplayStatus(relatedMeeting))}
                  </Badge>
                  <ArrowRight className="w-4 h-4 icon text-muted-foreground" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const MeetingDetailsContent = ({
  meeting,
  handleUserAvatarClick,
  getMeetingStatusBadgeStyles,
  isMeetingOverdue,
  getStatusIcon,
  formatLabel,
  getDisplayStatus,
  getMeetingTypeBadgeStyles,
  relatedMeetings,
  handleRelatedMeetingClick,
}) => (
  <div className="flex h-full flex-col">
    <div className="relative overflow-hidden bg-white text-gray-900 dark:bg-zinc-900 dark:text-white px-6 py-7">
      <div className="relative flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={cn(
              "inline-flex items-center gap-2 rounded-[15px] px-3 py-1 text-xs font-medium backdrop-blur-sm border",
              getMeetingStatusBadgeStyles(
                meeting.status,
                isMeetingOverdue(meeting),
              ),
            )}
          >
            {getStatusIcon(meeting.status, isMeetingOverdue(meeting))}
            <span className="capitalize">
              {formatLabel(getDisplayStatus(meeting))}
            </span>
          </Badge>
          <Badge
            className={cn(
              "inline-flex items-center gap-2 rounded-[15px] px-3 py-1 text-xs font-medium backdrop-blur-sm border",
              getMeetingTypeBadgeStyles(meeting.type),
            )}
          >
            <MeetingTypeIcon type={meeting.type} />
            <span className="capitalize">{formatLabel(meeting.type)}</span>
          </Badge>
          <MeetingProjectBadge project={meeting.project} />
        </div>
        <SheetHeader className="space-y-2">
          <SheetTitle className="text-xl font-semibold text-black dark:text-white leading-8">
            {meeting.title}
          </SheetTitle>
          <p className="text-xs font-semibold line-clamp-2 text-justify text-muted-foreground leading-6">
            {descriptionOrDefault(meeting.description)}
          </p>
        </SheetHeader>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900 px-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 icon text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {dateOrFallback(meeting.startDate, "No start date")}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 icon text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {dateOrFallback(meeting.endDate, "No end date")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 icon text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {locationOrDefault(meeting.location)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Video className="w-4 h-4 icon text-muted-foreground" />
            <div>
              <MeetingJoinLink
                meeting={meeting}
                isMeetingOverdue={isMeetingOverdue}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm truncate overflow-hidden">
          <UserAvatar
            user={meeting.assignedTo}
            size="xl"
            onClick={(id) => id && handleUserAvatarClick(id)}
          />
          <div className="truncate">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Assigned To
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {assignedName(meeting.assignedTo)}
            </p>
            <MeetingPersonEmail email={meeting.assignedTo?.email} />
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm">
          <UserAvatar
            user={meeting.assignedBy}
            size="xl"
            onClick={(id) => id && handleUserAvatarClick(id)}
          />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Organized By
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {organizerName(meeting.assignedBy)}
            </p>
            <MeetingPersonEmail email={meeting.assignedBy?.email} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm">
        <MeetingAttendeesBlock
          attendees={meeting.attendees}
          onUserClick={handleUserAvatarClick}
        />
      </div>

      <MeetingRelatedBlock
        relatedMeetings={relatedMeetings}
        onRelatedClick={handleRelatedMeetingClick}
        getMeetingStatusBadgeStyles={getMeetingStatusBadgeStyles}
        isMeetingOverdue={isMeetingOverdue}
        formatLabel={formatLabel}
        getDisplayStatus={getDisplayStatus}
      />
    </div>
  </div>
);

const MeetingDetailsSheetSection = ({
  handleUserAvatarClick,
  isMeetingSheetOpen,
  handleCloseMeetingDetails,
  setIsMeetingSheetOpen,
  selectedMeetingDetails,
  getMeetingStatusBadgeStyles,
  isMeetingOverdue,
  getStatusIcon,
  formatLabel,
  getDisplayStatus,
  getMeetingTypeBadgeStyles,
  relatedMeetings,
  handleRelatedMeetingClick,
}) => (
  <Sheet
    open={isMeetingSheetOpen}
    onOpenChange={(open) => {
      if (!open) {
        handleCloseMeetingDetails();
      } else {
        setIsMeetingSheetOpen(true);
      }
    }}
  >
    <SheetContent
      side="right"
      className="w-full sm:max-w-md md:max-w-lg p-0"
    >
      {selectedMeetingDetails ? (
        <MeetingDetailsContent
          meeting={selectedMeetingDetails}
          handleUserAvatarClick={handleUserAvatarClick}
          getMeetingStatusBadgeStyles={getMeetingStatusBadgeStyles}
          isMeetingOverdue={isMeetingOverdue}
          getStatusIcon={getStatusIcon}
          formatLabel={formatLabel}
          getDisplayStatus={getDisplayStatus}
          getMeetingTypeBadgeStyles={getMeetingTypeBadgeStyles}
          relatedMeetings={relatedMeetings}
          handleRelatedMeetingClick={handleRelatedMeetingClick}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Select a meeting to view details.
        </div>
      )}
    </SheetContent>
  </Sheet>
);

const MeetingsUserModalSection = ({
  selectedUserId,
  showUserDetails,
  setShowUserDetails,
  setSelectedUserId,
}) => (
  <UserDetailsModal
    userId={selectedUserId}
    isOpen={showUserDetails}
    onClose={() => {
      setShowUserDetails(false);
      setSelectedUserId(null);
    }}
  />
);

const MeetingsView = ({

  containerVariants,
  itemVariants,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  selectedMeetings,
  handleBulkDelete,
  permissions,
  setEditingMeeting,
  resetMeetingForm,
  setShowNewMeetingPopup,
  filteredMeetings,
  handleSelectAll,
  loading,
  handleSelectMeeting,
  getStatusIcon,
  getTypeColor,
  isMeetingOverdue,
  getDisplayStatus,
  getStatusColor,
  handleStatusChangeWithConfirmation,
  handleUserAvatarClick,
  user,
  handleViewMeetingDetails,
  handleEditMeeting,
  handleDeleteMeeting,
  handleJoinMeeting,
  showNewMeetingPopup,
  handleCloseMeetingPopup,
  editingMeeting,
  newMeeting,
  setNewMeeting,
  handleAssignedToChange,
  setShowAssignedToSuggestions,
  showAssignedToSuggestions,
  assignedToSuggestions,
  selectUser,
  handleScheduleZoomMeeting,
  handleAttendeeSearch,
  attendeeSuggestions,
  setShowAttendeeSuggestions,
  showAttendeeSuggestions,
  handleAddAttendee,
  handleRemoveAttendee,
  projects,
  handleNewMeeting,
  isMeetingSheetOpen,
  handleCloseMeetingDetails,
  setIsMeetingSheetOpen,
  selectedMeetingDetails,
  getMeetingStatusBadgeStyles,
  formatLabel,
  getMeetingTypeBadgeStyles,
  relatedMeetings,
  handleRelatedMeetingClick,
  selectedUserId,
  showUserDetails,
  setShowUserDetails,
  setSelectedUserId,

}) => (
  <div className="overflow-hidden pt-10">
    <m.div
      className="mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <MeetingsHeaderSection
        itemVariants={itemVariants}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterType={filterType}
        setFilterType={setFilterType}
        selectedMeetings={selectedMeetings}
        handleBulkDelete={handleBulkDelete}
        permissions={permissions}
        setEditingMeeting={setEditingMeeting}
        resetMeetingForm={resetMeetingForm}
        setShowNewMeetingPopup={setShowNewMeetingPopup}
      />
      <MeetingsTableSection
        itemVariants={itemVariants}
        filteredMeetings={filteredMeetings}
        selectedMeetings={selectedMeetings}
        handleSelectAll={handleSelectAll}
        loading={loading}
        handleSelectMeeting={handleSelectMeeting}
        getStatusIcon={getStatusIcon}
        getTypeColor={getTypeColor}
        isMeetingOverdue={isMeetingOverdue}
        getDisplayStatus={getDisplayStatus}
        getStatusColor={getStatusColor}
        handleStatusChangeWithConfirmation={handleStatusChangeWithConfirmation}
        handleUserAvatarClick={handleUserAvatarClick}
        user={user}
        handleViewMeetingDetails={handleViewMeetingDetails}
        handleEditMeeting={handleEditMeeting}
        handleDeleteMeeting={handleDeleteMeeting}
        handleJoinMeeting={handleJoinMeeting}
      />
      <NewMeetingPopupSection
        showNewMeetingPopup={showNewMeetingPopup}
        handleCloseMeetingPopup={handleCloseMeetingPopup}
        editingMeeting={editingMeeting}
        newMeeting={newMeeting}
        setNewMeeting={setNewMeeting}
        handleAssignedToChange={handleAssignedToChange}
        setShowAssignedToSuggestions={setShowAssignedToSuggestions}
        showAssignedToSuggestions={showAssignedToSuggestions}
        assignedToSuggestions={assignedToSuggestions}
        selectUser={selectUser}
        handleUserAvatarClick={handleUserAvatarClick}
        handleScheduleZoomMeeting={handleScheduleZoomMeeting}
        loading={loading}
        handleAttendeeSearch={handleAttendeeSearch}
        attendeeSuggestions={attendeeSuggestions}
        setShowAttendeeSuggestions={setShowAttendeeSuggestions}
        showAttendeeSuggestions={showAttendeeSuggestions}
        handleAddAttendee={handleAddAttendee}
        handleRemoveAttendee={handleRemoveAttendee}
        projects={projects}
        handleNewMeeting={handleNewMeeting}
      />
      <MeetingDetailsSheetSection
        handleUserAvatarClick={handleUserAvatarClick}
        isMeetingSheetOpen={isMeetingSheetOpen}
        handleCloseMeetingDetails={handleCloseMeetingDetails}
        setIsMeetingSheetOpen={setIsMeetingSheetOpen}
        selectedMeetingDetails={selectedMeetingDetails}
        getMeetingStatusBadgeStyles={getMeetingStatusBadgeStyles}
        isMeetingOverdue={isMeetingOverdue}
        getStatusIcon={getStatusIcon}
        formatLabel={formatLabel}
        getDisplayStatus={getDisplayStatus}
        getMeetingTypeBadgeStyles={getMeetingTypeBadgeStyles}
        relatedMeetings={relatedMeetings}
        handleRelatedMeetingClick={handleRelatedMeetingClick}
      />
      <MeetingsUserModalSection
        selectedUserId={selectedUserId}
        showUserDetails={showUserDetails}
        setShowUserDetails={setShowUserDetails}
        setSelectedUserId={setSelectedUserId}
      />
    </m.div>
  </div>
);

const Meetings = () => {
  document.title = "Meetings - Schedule & Manage";

  const { user } = useAuth();
  const { markAsReadByType } = useNotifications();
  const { permissions, loading: permissionsLoading } = usePermissions();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewMeetingPopup, setShowNewMeetingPopup] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedMeetings, setSelectedMeetings] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    type: "",
    assignedTo: "",
    assignedToId: "",
    startDate: "",
    endDate: "",
    location: "",
    meetingLink: "",
    attendees: [],
    tags: [],
    projectId: "",
  });
  const [assignedToSuggestions, setAssignedToSuggestions] = useState([]);
  const [showAssignedToSuggestions, setShowAssignedToSuggestions] =
    useState(false);
  const [attendeeSuggestions, setAttendeeSuggestions] = useState([]);
  const [showAttendeeSuggestions, setShowAttendeeSuggestions] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [selectedMeetingDetails, setSelectedMeetingDetails] = useState(null);
  const [isMeetingSheetOpen, setIsMeetingSheetOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const relatedMeetings = useMemo(() => {
    if (!selectedMeetingDetails?.project) return [];
    const projectId =
      selectedMeetingDetails.project.id || selectedMeetingDetails.project._id;
    if (!projectId) return [];

    const selectedId = selectedMeetingDetails.id || selectedMeetingDetails._id;

    return meetings
      .filter((meeting) => {
        const currentProjectId = meeting.project?.id || meeting.project?._id;
        const meetingId = meeting.id || meeting._id;
        return currentProjectId === projectId && meetingId !== selectedId;
      })
      .slice(0, 4);
  }, [selectedMeetingDetails, meetings]);

  const handleUserAvatarClick = (userId) => {
    setSelectedUserId(userId);
    setShowUserDetails(true);
  };

  const handleViewMeetingDetails = (meeting) => {
    setSelectedMeetingDetails(meeting);
    setIsMeetingSheetOpen(true);
  };

  const handleCloseMeetingDetails = () => {
    setIsMeetingSheetOpen(false);
    setSelectedMeetingDetails(null);
  };

  const handleRelatedMeetingClick = (meeting) => {
    if (!meeting) return;
    handleViewMeetingDetails(meeting);
  };

  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {
        status: filterStatus !== "all" ? filterStatus : undefined,
        type: filterType !== "all" ? filterType : undefined,
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await meetingService.getMeetings(filters);
      const allMeetings = response.meetings || [];

      const matchesUser = (party) => {
        if (!party || !user?.id) return false;
        const partyId =
          typeof party === "object" ? party.id || party._id : party;
        return String(partyId) === String(user.id);
      };

      const authorizedMeetings = allMeetings.filter((meeting) => {
        if (!user || !user.id) return false;
        return (
          matchesUser(meeting.assignedTo) ||
          matchesUser(meeting.assignedBy) ||
          (Array.isArray(meeting.attendees) &&
            meeting.attendees.some((attendee) => matchesUser(attendee)))
        );
      });

      setMeetings(authorizedMeetings);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error loading meetings:", error);
      toast.error(error.message || "Failed to load meetings");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType, pagination.page, pagination.limit, user]);

  useEffect(() => {
    if (user && user.id) {
      loadMeetings();
    }
  }, [filterStatus, filterType, user]);

  useEffect(() => {
    if (user && user.id) {
      markAsReadByType("meetings");
    }
  }, [user, markAsReadByType]);

  useEffect(() => {
    if (location.state?.openModal && location.state?.date) {
      const date = new Date(location.state.date);
      const day = date.toISOString().split("T")[0];
      setEditingMeeting(null);
      setNewMeeting({
        title: "",
        description: "",
        type: "",
        assignedTo: "",
        assignedToId: "",
        startDate: day,
        endDate: day,
        location: "",
        meetingLink: "",
        attendees: [],
        tags: [],
        projectId: "",
      });
      setShowNewMeetingPopup(true);
    }
  }, [location.state]);

  // Chrome extension → open create-meeting modal
  useEffect(() => {
    if (searchParams.get("create") !== "1") return;
    setEditingMeeting(null);
    setNewMeeting({
      title: "",
      description: "",
      type: "",
      assignedTo: "",
      assignedToId: "",
      startDate: "",
      endDate: "",
      location: "",
      meetingLink: "",
      attendees: [],
      tags: [],
      projectId: "",
    });
    setShowNewMeetingPopup(true);
    const next = new URLSearchParams(searchParams);
    next.delete("create");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const loadUsers = async () => {
    try {
      const response = await friendService.getFriends();
      const friends = response.friends || [];

      const transformedUsers = friends
        .map((friendship) => ({
          id: friendship.friend.id,
          name: friendship.friend.username,
          username: friendship.friend.username,
          email: friendship.friend.email,
          avatar:
            friendship.friend.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(friendship.friend.username)}&background=random&color=fff&size=128`,
        }))
        .filter((friend) => friend.id !== user?.id); // Exclude current user

      setUsers(transformedUsers);
    } catch (error) {
      console.error("Error loading friends:", error);
      toast.error("Failed to load friends");
      setUsers([]);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectService.getProjects({ limit: 100 });
      setProjects(response.projects || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
      setProjects([]);
    }
  };

  const loadTeams = async () => {
    try {
      const response = await teamService.getTeams({ limit: 100 });
      setTeams(response.teams || []);
    } catch (error) {
      console.error("Error loading teams:", error);
    }
  };

  const loadTeamMembers = async (teamId) => {
    if (!teamId) {
      setAvailableUsers(users);
      return;
    }
    try {
      const response = await teamService.getTeamMembers(teamId);
      setAvailableUsers(response.members || []);
    } catch (error) {
      console.error("Error loading team members:", error);
      setAvailableUsers(users);
    }
  };

  const updateAvailableUsers = useCallback(() => {
    if (newMeeting.projectId && newMeeting.projectId !== "none") {
      const selectedProject = projects.find(
        (p) => p.id === newMeeting.projectId,
      );
      if (selectedProject && selectedProject.teamId) {
        loadTeamMembers(selectedProject.teamId);
      } else {
        setAvailableUsers(users);
      }
    } else {
      setAvailableUsers(users);
    }
  }, [newMeeting.projectId, projects, users]);

  useEffect(() => {
    loadUsers();
    loadProjects();
    loadTeams();
  }, []);

  useEffect(() => {
    setAvailableUsers(users);
  }, [users]);

  useEffect(() => {
    updateAvailableUsers();
  }, [updateAvailableUsers]);

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch =
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (meeting.description &&
        meeting.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (meeting.assignedTo &&
        meeting.assignedTo.username &&
        meeting.assignedTo.username
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const handleAssignedToChange = async (value) => {
    setNewMeeting({ ...newMeeting, assignedTo: value, assignedToId: "" });
    if (value.length > 0) {
      const filtered = availableUsers.filter(
        (user) =>
          (user.username || user.name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          user.email.toLowerCase().includes(value.toLowerCase()),
      );
      setAssignedToSuggestions(filtered);
      setShowAssignedToSuggestions(true);
    } else {
      setShowAssignedToSuggestions(false);
    }
  };

  const selectUser = (user) => {
    setNewMeeting({
      ...newMeeting,
      assignedTo: user.username || user.name,
      assignedToId: user.id,
    });
    setShowAssignedToSuggestions(false);
  };

  const handleSelectAll = () => {
    if (selectedMeetings.length === filteredMeetings.length) {
      setSelectedMeetings([]);
    } else {
      setSelectedMeetings(filteredMeetings.map((meeting) => meeting.id));
    }
  };

  const handleSelectMeeting = (meetingId) => {
    if (selectedMeetings.includes(meetingId)) {
      setSelectedMeetings(selectedMeetings.filter((id) => id !== meetingId));
    } else {
      setSelectedMeetings([...selectedMeetings, meetingId]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMeetings.length === 0) {
      toast.error("No meetings selected");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedMeetings.length} meeting(s)? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const results = await Promise.allSettled(
        selectedMeetings.map((id) => meetingService.deleteMeeting(id)),
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      const deleted = selectedMeetings.length - failed;

      setSelectedMeetings([]);
      await loadMeetings();

      if (deleted > 0)
        toast.success(`${deleted} meeting(s) deleted successfully!`);
      if (failed > 0) toast.error(`${failed} meeting(s) could not be deleted.`);
    } catch (error) {
      console.error("Error deleting meetings:", error);
      toast.error(error.message || "Failed to delete meetings");
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "online":
        return "text-dark dark:border-transparent dark:text-black bg-gray-100 border border-gray-500 px-4 py-2 min-w-[100px] pt-2.5";
      case "in-person":
        return "text-dark dark:border-transparent dark:text-black bg-green-100 border border-green-500 px-4 py-2 min-w-[100px] pt-2.5";
      case "hybrid":
        return "text-dark dark:border-transparent dark:text-black bg-yellow-100 border border-yellow-500 px-4 py-2 min-w-[100px] pt-2.5";
      default:
        return "text-dark dark:border-transparent dark:text-black bg-gray-100 border border-gray-500 px-4 py-2 min-w-[100px] pt-2.5";
    }
  };

  const isMeetingOverdue = (meeting) => {
    if (!meeting.endDate) return false;
    if (meeting.status === "completed" || meeting.status === "cancelled")
      return false;

    const endDate = new Date(meeting.endDate);
    const now = new Date();
    return endDate < now;
  };

  const getDisplayStatus = (meeting) => {
    const overdue = isMeetingOverdue(meeting);
    if (overdue) {
      return "overdue";
    }
    return meeting.status;
  };

  const getStatusColor = (status, isOverdue = false) => {
    if (isOverdue) {
      return "text-black dark:text-black font-bold dark:text-white bg-red-100/50 dark:bg-red-500 dark:border-red-500 text-red-600 border border-red-400 px-4 py-2 pt-2.5 min-w-[100px]";
    }
    switch (status) {
      case "completed":
        return "text-black dark:text-black font-bold dark:bg-green-500 dark:border-green-500 dark:text-white bg-green-100/50 text-black dark:text-black border border-green-400 px-4 py-2 pt-2.5 min-w-[100px]";
      case "pregress":
      case "in_progress":
        return "text-black dark:text-black font-bold dark:text-white bg-gray-100/50 text-gray-600 border border-gray-400 px-4 py-2 pt-2.5 min-w-[100px]";
      case "scheduled":
        return "text-black dark:text-black font-bold dark:text-white bg-yellow-100/50 text-yellow-600 border border-yellow-400 px-4 py-2 pt-2.5 min-w-[100px]";
      case "cancelled":
        return "text-black dark:text-black font-bold dark:text-white bg-red-100/50 dark:bg-red-500 dark:border-red-500 text-red-600 border border-red-400 px-4 py-2 pt-2.5 min-w-[100px]";
      default:
        return "text-black dark:text-black font-bold dark:text-white bg-yellow-100/50 text-yellow-600 border border-yellow-400 px-4 py-2 pt-2.5 min-w-[100px]";
    }
  };

  const getStatusIcon = (status, isOverdue = false) => {
    if (isOverdue) {
      return <AlertCircle className="w-4 h-4 icon icon icon" />;
    }
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 icon icon icon" />;
      case "pregress":
        return <Clock className="w-4 h-4 icon icon icon" />;
      case "scheduled":
        return <Calendar className="w-4 h-4 icon icon icon" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4 icon icon icon" />;
      default:
        return <Calendar className="w-4 h-4 icon icon icon" />;
    }
  };

  const formatLabel = (value) => {
    if (!value) return "N/A";
    return value
      .toString()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getMeetingStatusBadgeStyles = (status, isOverdue = false) => {
    if (isOverdue) {
      return "bg-red-500/15 text-red-600 border border-red-400/40 dark:border-transparent dark:bg-red-500 dark:text-white";
    }
    switch (status) {
      case "completed":
        return "bg-emerald-500/15 text-emerald-700 border border-emerald-400/40 dark:border-transparent dark:bg-green-500 dark:text-white";
      case "scheduled":
        return "bg-amber-500/15 text-amber-700 border border-amber-400/40 dark:border-transparent dark:bg-amber-500 dark:text-black";
      case "pregress":
      case "in_progress":
        return "bg-sky-500/15 text-sky-700 border border-sky-400/40 dark:border-transparent dark:bg-sky-500 dark:text-white";
      case "cancelled":
        return "bg-red-500/15 text-red-600 border border-red-400/40 dark:border-transparent dark:bg-red-500 dark:text-white";
      case "overdue":
        return "bg-red-500/15 text-red-600 border border-red-400/40 dark:border-transparent dark:bg-red-500 dark:text-white";
      default:
        return "bg-gray-500/15 text-gray-600 border border-gray-400/40 dark:border-transparent dark:bg-zinc-600 dark:text-white";
    }
  };

  const getMeetingTypeBadgeStyles = (type) => {
    switch (type) {
      case "online":
        return "bg-sky-500/15 text-sky-700 border border-sky-400/40 dark:border-transparent dark:bg-sky-500 dark:text-white";
      case "in-person":
        return "bg-green-500/15 text-green-700 border border-green-400/40 dark:border-transparent dark:bg-green-500 dark:text-white";
      case "hybrid":
        return "bg-orange-500/15 text-orange-700 border border-orange-400/40 dark:border-transparent dark:bg-orange-500 dark:text-black";
      default:
        return "bg-green-500/15 text-green-700 border border-green-400/40 dark:border-transparent dark:bg-green-500 dark:text-white";
    }
  };

  const handleNewMeeting = async () => {
    if (!newMeeting.title.trim()) {
      toast.error("Please enter a meeting title");
      return;
    }
    if (!newMeeting.type) {
      toast.error("Please select a meeting type");
      return;
    }

    if (!newMeeting.assignedTo.trim() || !newMeeting.assignedToId) {
      toast.error("Please select a person to assign the meeting to");
      return;
    }

    try {
      setLoading(true);

      const meetingData = {
        title: newMeeting.title,
        description: newMeeting.description,
        type: newMeeting.type,
        assignedTo: newMeeting.assignedToId,
        startDate: newMeeting.startDate,
        endDate: newMeeting.endDate,
        location: newMeeting.location,
        meetingLink: newMeeting.meetingLink,
        attendees: newMeeting.attendees.map((attendee) => attendee.id),
        tags: newMeeting.tags,
        projectId:
          newMeeting.projectId && newMeeting.projectId !== "none"
            ? newMeeting.projectId
            : undefined,
      };

      if (editingMeeting) {
        await meetingService.updateMeeting(editingMeeting.id, meetingData);
      } else {
        await meetingService.createMeeting(meetingData);
      }

      await loadMeetings();

      resetMeetingForm();
      setEditingMeeting(null);
      setShowNewMeetingPopup(false);
      toast.success(
        editingMeeting
          ? "Meeting updated successfully!"
          : "Meeting created successfully!",
      );
    } catch (error) {
      console.error("Error saving meeting:", error);
      toast.error(
        error.message ||
          (editingMeeting
            ? "Failed to update meeting"
            : "Failed to create meeting"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeeting = async (id) => {
    try {
      setLoading(true);
      await meetingService.deleteMeeting(id);
      await loadMeetings(); // Reload meetings after deletion
      toast.success("Meeting deleted successfully!");
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast.error(error.message || "Failed to delete meeting");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (meetingId, newStatus) => {
    try {
      setLoading(true);
      await meetingService.updateMeetingStatus(meetingId, newStatus);
      await loadMeetings(); // Reload meetings after status change
      toast.success(
        `Meeting ${newStatus === "completed" ? "completed" : "cancelled"} successfully!`,
      );
    } catch (error) {
      console.error("Error updating meeting status:", error);
      toast.error(error.message || "Failed to update meeting status");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChangeWithConfirmation = async (
    meetingId,
    newStatus,
    meetingTitle,
  ) => {
    const action = newStatus === "completed" ? "complete" : "cancel";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} the meeting "${meetingTitle}"?`,
    );

    if (confirmed) {
      await handleStatusChange(meetingId, newStatus);
    }
  };

  const handleAttendeeSearch = (value) => {
    if (value.length > 0) {
      const filtered = availableUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(value.toLowerCase()) &&
          !newMeeting.attendees.some((attendee) => attendee.id === user.id),
      );
      setAttendeeSuggestions(filtered);
      setShowAttendeeSuggestions(true);
    } else {
      setAttendeeSuggestions([]);
      setShowAttendeeSuggestions(false);
    }
  };

  const handleAddAttendee = (user) => {
    if (!newMeeting.attendees.some((attendee) => attendee.id === user.id)) {
      setNewMeeting({
        ...newMeeting,
        attendees: [...newMeeting.attendees, user],
      });
    }
    setShowAttendeeSuggestions(false);
    setAttendeeSuggestions([]);
  };

  const handleRemoveAttendee = (userId) => {
    setNewMeeting({
      ...newMeeting,
      attendees: newMeeting.attendees.filter(
        (attendee) => attendee.id !== userId,
      ),
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newMeeting.tags.includes(newTag.trim())) {
      setNewMeeting({
        ...newMeeting,
        tags: [...newMeeting.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewMeeting({
      ...newMeeting,
      tags: newMeeting.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const meetingDateToInput = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const resetMeetingForm = () => {
    setNewMeeting({
      title: "",
      description: "",
      type: "",
      assignedTo: "",
      assignedToId: "",
      startDate: "",
      endDate: "",
      location: "",
      meetingLink: "",
      attendees: [],
      tags: [],
      projectId: "",
    });
  };

  const handleEditMeeting = (meeting) => {
    if (!meeting) return;

    const assignedRaw = meeting.assignedTo;
    let assignedToId = "";
    let assignedToName = "";
    if (assignedRaw) {
      if (typeof assignedRaw === "object") {
        assignedToId = assignedRaw.id || assignedRaw._id || "";
        assignedToName = assignedRaw.username || assignedRaw.name || "";
      } else {
        assignedToId = assignedRaw;
        const matched = users.find(
          (user) => (user.id || user._id) === assignedRaw,
        );
        assignedToName = matched ? matched.username || matched.name : "";
      }
    }

    const attendees = (meeting.attendees || []).map((attendee) => {
      if (attendee && typeof attendee === "object") {
        return { ...attendee, id: attendee.id || attendee._id };
      }
      const matched = users.find((user) => (user.id || user._id) === attendee);
      return matched
        ? { ...matched, id: matched.id || matched._id }
        : { id: attendee, name: attendee };
    });

    setEditingMeeting(meeting);
    setNewMeeting({
      title: meeting.title || "",
      description: meeting.description || "",
      type: meeting.type || "online",
      assignedTo: assignedToName,
      assignedToId: assignedToId,
      startDate: meetingDateToInput(meeting.startDate),
      endDate: meetingDateToInput(meeting.endDate),
      location: meeting.location || "",
      meetingLink: meeting.meetingLink || "",
      attendees: attendees,
      tags: meeting.tags || [],
      projectId: meeting.projectId || meeting.project?.id || "none",
    });
    setShowNewMeetingPopup(true);
  };

  const handleCloseMeetingPopup = () => {
    setShowNewMeetingPopup(false);
    setEditingMeeting(null);
    resetMeetingForm();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const handleJoinMeeting = (meetingLink) => {
    window.open(meetingLink, "_blank", "noopener,noreferrer");
  };

  const handleScheduleZoomMeeting = async () => {
    if (!newMeeting.title.trim()) {
      toast.error("Please enter a meeting title first");
      return;
    }

    try {
      setLoading(true);

      let duration = 60; // default 60 minutes
      if (newMeeting.startDate && newMeeting.endDate) {
        const start = new Date(newMeeting.startDate);
        const end = new Date(newMeeting.endDate);
        duration = Math.max(1, Math.round((end - start) / (1000 * 60)));
      }

      let startTime;
      if (newMeeting.startDate) {
        const date = new Date(newMeeting.startDate);

        if (date.getHours() === 0 && date.getMinutes() === 0) {
          date.setHours(9, 0, 0, 0);
        }
        startTime = date.toISOString();
      }

      const meetingData = {
        topic: newMeeting.title,
        startTime: startTime,
        duration: duration,
        agenda: newMeeting.description || "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      };

      const response = await meetingService.createZoomMeeting(meetingData);

      if (response.meeting && response.meeting.joinUrl) {
        setNewMeeting({
          ...newMeeting,
          meetingLink: response.meeting.joinUrl,
          location: newMeeting.location || "Video Meeting",
        });
        toast.success(
          "Video meeting created successfully! Meeting link has been added.",
        );
      } else {
        toast.error("Failed to get meeting link");
      }
    } catch (error) {
      console.error("Error creating video meeting:", error);
      toast.error(error.message || "Failed to create video meeting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MeetingsView
      containerVariants={containerVariants}
      itemVariants={itemVariants}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      filterStatus={filterStatus}
      setFilterStatus={setFilterStatus}
      filterType={filterType}
      setFilterType={setFilterType}
      selectedMeetings={selectedMeetings}
      handleBulkDelete={handleBulkDelete}
      permissions={permissions}
      setEditingMeeting={setEditingMeeting}
      resetMeetingForm={resetMeetingForm}
      setShowNewMeetingPopup={setShowNewMeetingPopup}
      filteredMeetings={filteredMeetings}
      handleSelectAll={handleSelectAll}
      loading={loading}
      handleSelectMeeting={handleSelectMeeting}
      getStatusIcon={getStatusIcon}
      getTypeColor={getTypeColor}
      isMeetingOverdue={isMeetingOverdue}
      getDisplayStatus={getDisplayStatus}
      getStatusColor={getStatusColor}
      handleStatusChangeWithConfirmation={handleStatusChangeWithConfirmation}
      handleUserAvatarClick={handleUserAvatarClick}
      user={user}
      handleViewMeetingDetails={handleViewMeetingDetails}
      handleEditMeeting={handleEditMeeting}
      handleDeleteMeeting={handleDeleteMeeting}
      handleJoinMeeting={handleJoinMeeting}
      showNewMeetingPopup={showNewMeetingPopup}
      handleCloseMeetingPopup={handleCloseMeetingPopup}
      editingMeeting={editingMeeting}
      newMeeting={newMeeting}
      setNewMeeting={setNewMeeting}
      handleAssignedToChange={handleAssignedToChange}
      setShowAssignedToSuggestions={setShowAssignedToSuggestions}
      showAssignedToSuggestions={showAssignedToSuggestions}
      assignedToSuggestions={assignedToSuggestions}
      selectUser={selectUser}
      handleScheduleZoomMeeting={handleScheduleZoomMeeting}
      handleAttendeeSearch={handleAttendeeSearch}
      attendeeSuggestions={attendeeSuggestions}
      setShowAttendeeSuggestions={setShowAttendeeSuggestions}
      showAttendeeSuggestions={showAttendeeSuggestions}
      handleAddAttendee={handleAddAttendee}
      handleRemoveAttendee={handleRemoveAttendee}
      projects={projects}
      handleNewMeeting={handleNewMeeting}
      isMeetingSheetOpen={isMeetingSheetOpen}
      handleCloseMeetingDetails={handleCloseMeetingDetails}
      setIsMeetingSheetOpen={setIsMeetingSheetOpen}
      selectedMeetingDetails={selectedMeetingDetails}
      getMeetingStatusBadgeStyles={getMeetingStatusBadgeStyles}
      formatLabel={formatLabel}
      getMeetingTypeBadgeStyles={getMeetingTypeBadgeStyles}
      relatedMeetings={relatedMeetings}
      handleRelatedMeetingClick={handleRelatedMeetingClick}
      selectedUserId={selectedUserId}
      showUserDetails={showUserDetails}
      setShowUserDetails={setShowUserDetails}
      setSelectedUserId={setSelectedUserId}
    />
  )
};

export default Meetings;
