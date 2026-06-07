import { markRaw } from 'vue'
import IMsCloud from '~icons/material-symbols/cloud'
import IMsExplore from '~icons/material-symbols/explore'
import IMsSettingsInputAntenna from '~icons/material-symbols/settings-input-antenna'
import IMsAir from '~icons/material-symbols/air'
import IMsFlight from '~icons/material-symbols/flight'
import IMsInfo from '~icons/material-symbols/info'
import IMsGavel from '~icons/material-symbols/gavel'
import IMsPublic from '~icons/material-symbols/public'
import IMsPsychology from '~icons/material-symbols/psychology'
import IMsHelicopter from '~icons/material-symbols/helicopter'
import IMsApartment from '~icons/material-symbols/apartment'
import IMsFlightLand from '~icons/material-symbols/flight-land'
import IMsRadar from '~icons/material-symbols/radar'
import IMsTrackChanges from '~icons/material-symbols/track-changes'
import IMsMap from '~icons/material-symbols/map'
import IMsSupportAgent from '~icons/material-symbols/support-agent'
import IMsMonitorHeart from '~icons/material-symbols/monitor-heart'
import IMsStar from '~icons/material-symbols/star'
import IMsFlightTakeoff from '~icons/material-symbols/flight-takeoff'
import IMsRadioButtonChecked from '~icons/material-symbols/radio-button-checked'
import IMsMenuBook from '~icons/material-symbols/menu-book'
import IMsWarning from '~icons/material-symbols/warning'
import IMsCollectionsBookmark from '~icons/material-symbols/collections-bookmark'
import IMsConnectingAirports from '~icons/material-symbols/connecting-airports'
import IMsWork from '~icons/material-symbols/work'
import IMsLanguage from '~icons/material-symbols/language'
import IMsPlayArrow from '~icons/material-symbols/play-arrow'
import IMsArrowForward from '~icons/material-symbols/arrow-forward'
import IMsArrowBack from '~icons/material-symbols/arrow-back'
import IMsShuffle from '~icons/material-symbols/shuffle'

export const iconMap = {
  aviationMeteorology: markRaw(IMsCloud),
  airNavigation: markRaw(IMsExplore),
  communicationNavigationSurveillance: markRaw(IMsSettingsInputAntenna),
  principlesOfFlight: markRaw(IMsAir),
  aircraftSystems: markRaw(IMsFlight),
  aeronauticalInformation: markRaw(IMsInfo),
  airTrafficServicesGeneral: markRaw(IMsGavel),
  airspace: markRaw(IMsPublic),
  humanFactors: markRaw(IMsPsychology),
  generalAviation: markRaw(IMsHelicopter),
  aerodromeControl: markRaw(IMsApartment),
  approachControl: markRaw(IMsFlightLand),
  approachRadarControl: markRaw(IMsRadar),
  precisionApproachRadarControl: markRaw(IMsTrackChanges),
  areaControl: markRaw(IMsMap),
  areaRadarControl: markRaw(IMsRadar),
  flightService: markRaw(IMsSupportAgent),
  regionalOperationsMonitoring: markRaw(IMsMonitorHeart),
  caacOperationsMonitoring: markRaw(IMsApartment),
  specialSkillAdsb: markRaw(IMsStar),
  apronControl: markRaw(IMsFlightTakeoff),
  apronControlOld: markRaw(IMsFlight),
  singleChoice: markRaw(IMsRadioButtonChecked),
  readingComprehension: markRaw(IMsMenuBook),
  RunwayIncursionPrevention: markRaw(IMsWarning),
  basicCollection: markRaw(IMsCollectionsBookmark),
  atc: markRaw(IMsFlight),
  airport: markRaw(IMsApartment),
  airline: markRaw(IMsConnectingAirports),
  base: markRaw(IMsFlight),
  professional: markRaw(IMsWork),
  english: markRaw(IMsLanguage),
  科目: markRaw(IMsMenuBook),
  练习: markRaw(IMsPlayArrow),
  sequence: markRaw(IMsArrowForward),
  reverse: markRaw(IMsArrowBack),
  shuffle: markRaw(IMsShuffle),
}
