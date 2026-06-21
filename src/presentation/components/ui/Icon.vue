<script setup>
import { computed } from 'vue'

import IconAdd from "~icons/material-symbols/add"
import IconAddCircleOutline from "~icons/material-symbols/add-circle-outline"
import IconAir from "~icons/material-symbols/air"
import IconApartment from "~icons/material-symbols/apartment"
import IconArrowBack from "~icons/material-symbols/arrow-back"
import IconArrowForward from "~icons/material-symbols/arrow-forward"
import IconAssignment from "~icons/material-symbols/assignment"
import IconAssignmentOutline from "~icons/material-symbols/assignment-outline"
import IconAssignmentTurnedInOutline from "~icons/material-symbols/assignment-turned-in-outline"
import IconBarChart from "~icons/material-symbols/bar-chart"
import IconBookOutline from "~icons/material-symbols/book-outline"
import IconBookmarkOutline from "~icons/material-symbols/bookmark-outline"
import IconCalendarTodayOutline from "~icons/material-symbols/calendar-today-outline"
import IconCancelOutline from "~icons/material-symbols/cancel-outline"
import IconCheck from "~icons/material-symbols/check"
import IconCheckCircleOutline from "~icons/material-symbols/check-circle-outline"
import IconChevronLeft from "~icons/material-symbols/chevron-left"
import IconChevronRight from "~icons/material-symbols/chevron-right"
import IconClose from "~icons/material-symbols/close"
import IconCloud from "~icons/material-symbols/cloud"
import IconCollectionsBookmark from "~icons/material-symbols/collections-bookmark"
import IconConnectingAirports from "~icons/material-symbols/connecting-airports"
import IconDarkModeOutline from "~icons/material-symbols/dark-mode-outline"
import IconDeleteOutline from "~icons/material-symbols/delete-outline"
import IconDeleteSweepOutline from "~icons/material-symbols/delete-sweep-outline"
import IconDescriptionOutline from "~icons/material-symbols/description-outline"
import IconDownload from "~icons/material-symbols/download"
import IconEditNote from "~icons/material-symbols/edit-note"
import IconEditNoteOutline from "~icons/material-symbols/edit-note-outline"
import IconErrorOutline from "~icons/material-symbols/error-outline"
import IconEventOutline from "~icons/material-symbols/event-outline"
import IconExpandMore from "~icons/material-symbols/expand-more"
import IconExplore from "~icons/material-symbols/explore"
import IconFlight from "~icons/material-symbols/flight"
import IconFlightLand from "~icons/material-symbols/flight-land"
import IconFlightTakeoff from "~icons/material-symbols/flight-takeoff"
import IconGavel from "~icons/material-symbols/gavel"
import IconGradeOutline from "~icons/material-symbols/grade-outline"
import IconGridView from "~icons/material-symbols/grid-view"
import IconGridViewOutline from "~icons/material-symbols/grid-view-outline"
import IconHelicopter from "~icons/material-symbols/helicopter"
import IconHistory from "~icons/material-symbols/history"
import IconHome from "~icons/material-symbols/home"
import IconHomeOutline from "~icons/material-symbols/home-outline"
import IconHourglassTop from "~icons/material-symbols/hourglass-top"
import IconInfo from "~icons/material-symbols/info"
import IconKidStar from "~icons/material-symbols/kid-star"
import IconKidStarOutline from "~icons/material-symbols/kid-star-outline"
import IconLanguage from "~icons/material-symbols/language"
import IconLightModeOutline from "~icons/material-symbols/light-mode-outline"
import IconListAltOutline from "~icons/material-symbols/list-alt-outline"
import IconLocalFireDepartmentOutline from "~icons/material-symbols/local-fire-department-outline"
import IconLogout from "~icons/material-symbols/logout"
import IconMap from "~icons/material-symbols/map"
import IconMenuBook from "~icons/material-symbols/menu-book"
import IconMenuBookOutline from "~icons/material-symbols/menu-book-outline"
import IconMonitorHeart from "~icons/material-symbols/monitor-heart"
import IconMoreVert from "~icons/material-symbols/more-vert"
import IconPerson from "~icons/material-symbols/person"
import IconPersonOutline from "~icons/material-symbols/person-outline"
import IconPlayArrow from "~icons/material-symbols/play-arrow"
import IconPlayArrowOutline from "~icons/material-symbols/play-arrow-outline"
import IconPlaylistRemove from "~icons/material-symbols/playlist-remove"
import IconPsychology from "~icons/material-symbols/psychology"
import IconPublic from "~icons/material-symbols/public"
import IconQuizOutline from "~icons/material-symbols/quiz-outline"
import IconRadar from "~icons/material-symbols/radar"
import IconRadioButtonChecked from "~icons/material-symbols/radio-button-checked"
import IconRateReviewOutline from "~icons/material-symbols/rate-review-outline"
import IconRecordVoiceOverOutline from "~icons/material-symbols/record-voice-over-outline"
import IconRefresh from "~icons/material-symbols/refresh"
import IconRestartAlt from "~icons/material-symbols/restart-alt"
import IconScheduleOutline from "~icons/material-symbols/schedule-outline"
import IconSearch from "~icons/material-symbols/search"
import IconSearchOff from "~icons/material-symbols/search-off"
import IconSendOutline from "~icons/material-symbols/send-outline"
import IconSettings from "~icons/material-symbols/settings"
import IconSettingsInputAntenna from "~icons/material-symbols/settings-input-antenna"
import IconSettingsOutline from "~icons/material-symbols/settings-outline"
import IconShareOutline from "~icons/material-symbols/share-outline"
import IconShuffle from "~icons/material-symbols/shuffle"
import IconStar from "~icons/material-symbols/star"
import IconStarOutline from "~icons/material-symbols/star-outline"
import IconStorage from "~icons/material-symbols/storage"
import IconSupportAgent from "~icons/material-symbols/support-agent"
import IconSyncAlt from "~icons/material-symbols/sync-alt"
import IconTarget from "~icons/material-symbols/target"
import IconTimer from "~icons/material-symbols/timer"
import IconTimerOutline from "~icons/material-symbols/timer-outline"
import IconTrackChanges from "~icons/material-symbols/track-changes"
import IconTranslate from "~icons/material-symbols/g-translate"
import IconTrendingUp from "~icons/material-symbols/trending-up"
import IconTrophyOutline from "~icons/material-symbols/trophy-outline"
import IconUpload from "~icons/material-symbols/upload"
import IconUploadFileOutline from "~icons/material-symbols/upload-file-outline"
import IconVerifiedOutline from "~icons/material-symbols/verified-outline"
import IconVisibilityOutline from "~icons/material-symbols/visibility-outline"
import IconVolumeOffOutline from "~icons/material-symbols/volume-off-outline"
import IconVolumeUpOutline from "~icons/material-symbols/volume-up-outline"
import IconWarning from "~icons/material-symbols/warning"
import IconWork from "~icons/material-symbols/work"

const props = defineProps({
  name: { type: String, required: true }
})

const registry = {
  add: IconAdd,
  'add-circle-outline': IconAddCircleOutline,
  air: IconAir,
  apartment: IconApartment,
  'arrow-back': IconArrowBack,
  'arrow-forward': IconArrowForward,
  assignment: IconAssignment,
  'assignment-outline': IconAssignmentOutline,
  'assignment-turned-in-outline': IconAssignmentTurnedInOutline,
  'bar-chart': IconBarChart,
  'book-outline': IconBookOutline,
  'bookmark-outline': IconBookmarkOutline,
  'calendar-today-outline': IconCalendarTodayOutline,
  'cancel-outline': IconCancelOutline,
  check: IconCheck,
  'check-circle-outline': IconCheckCircleOutline,
  'chevron-left': IconChevronLeft,
  'chevron-right': IconChevronRight,
  close: IconClose,
  cloud: IconCloud,
  'collections-bookmark': IconCollectionsBookmark,
  'connecting-airports': IconConnectingAirports,
  'dark-mode-outline': IconDarkModeOutline,
  'delete-outline': IconDeleteOutline,
  'delete-sweep-outline': IconDeleteSweepOutline,
  'description-outline': IconDescriptionOutline,
  download: IconDownload,
  'edit-note': IconEditNote,
  'edit-note-outline': IconEditNoteOutline,
  'error-outline': IconErrorOutline,
  'event-outline': IconEventOutline,
  'expand-less': IconExpandMore,
  'expand-more': IconExpandMore,
  explore: IconExplore,
  flight: IconFlight,
  'flight-land': IconFlightLand,
  'flight-takeoff': IconFlightTakeoff,
  gavel: IconGavel,
  'grade-outline': IconGradeOutline,
  'grid-view': IconGridView,
  'grid-view-outline': IconGridViewOutline,
  helicopter: IconHelicopter,
  history: IconHistory,
  home: IconHome,
  'home-outline': IconHomeOutline,
  'hourglass-top': IconHourglassTop,
  info: IconInfo,
  'kid-star': IconKidStar,
  'kid-star-outline': IconKidStarOutline,
  language: IconLanguage,
  'light-mode-outline': IconLightModeOutline,
  'list-alt-outline': IconListAltOutline,
  'local-fire-department-outline': IconLocalFireDepartmentOutline,
  logout: IconLogout,
  map: IconMap,
  'menu-book': IconMenuBook,
  'menu-book-outline': IconMenuBookOutline,
  'monitor-heart': IconMonitorHeart,
  'more-vert': IconMoreVert,
  person: IconPerson,
  'person-outline': IconPersonOutline,
  'play-arrow': IconPlayArrow,
  'play-arrow-outline': IconPlayArrowOutline,
  'playlist-remove': IconPlaylistRemove,
  psychology: IconPsychology,
  public: IconPublic,
  'quiz-outline': IconQuizOutline,
  radar: IconRadar,
  'radio-button-checked': IconRadioButtonChecked,
  'rate-review-outline': IconRateReviewOutline,
  'record-voice-over-outline': IconRecordVoiceOverOutline,
  refresh: IconRefresh,
  'restart-alt': IconRestartAlt,
  'schedule-outline': IconScheduleOutline,
  search: IconSearch,
  'search-off': IconSearchOff,
  'send-outline': IconSendOutline,
  settings: IconSettings,
  'settings-input-antenna': IconSettingsInputAntenna,
  'settings-outline': IconSettingsOutline,
  'share-outline': IconShareOutline,
  shuffle: IconShuffle,
  star: IconStar,
  'star-outline': IconStarOutline,
  storage: IconStorage,
  'support-agent': IconSupportAgent,
  'sync-alt': IconSyncAlt,
  target: IconTarget,
  timer: IconTimer,
  'timer-outline': IconTimerOutline,
  'track-changes': IconTrackChanges,
  'g-translate': IconTranslate,
  'trending-up': IconTrendingUp,
  'trophy-outline': IconTrophyOutline,
  upload: IconUpload,
  'upload-file-outline': IconUploadFileOutline,
  'verified-outline': IconVerifiedOutline,
  'visibility-outline': IconVisibilityOutline,
  'volume-off-outline': IconVolumeOffOutline,
  'volume-up-outline': IconVolumeUpOutline,
  warning: IconWarning,
  work: IconWork,
}

const iconComponent = computed(() => registry[props.name])
</script>

<template>
  <component :is="iconComponent" />
</template>
