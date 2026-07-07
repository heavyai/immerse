// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  HIDE_BANNER,
  HIDE_CLEAR_FILTERS_DROPDOWN,
  HIDE_MODAL,
  SELECTOR_PILL_HOVER,
  SELECTOR_PILL_NOT_HOVER,
  SET_SELECTOR_POSITION,
  SHOW_BANNER,
  SHOW_CLEAR_FILTERS_DROPDOWN,
  SHOW_DASHBOARD_IMPORT_MODAL,
  SHOW_MODAL,
  SHOW_DANGER_MODAL,
  HIDE_DANGER_MODAL,
  SHOW_INFO_MODAL,
  HIDE_INFO_MODAL,
  SHOW_WARNING_MODAL,
  HIDE_WARNING_MODAL,
  MODAL_LOADING,
  MODAL_DONE,
  SHOW_REFRESH_MODAL,
  CLOSE_REFRESH_MODAL
} from "constants/action-types"

export const hideClearFiltersDropDown = () => ({
  type: HIDE_CLEAR_FILTERS_DROPDOWN
})

export const showClearFiltersDropDown = () => ({
  type: SHOW_CLEAR_FILTERS_DROPDOWN
})

export const hideModal = () => ({
  type: HIDE_MODAL
})

export const showModal = ({
  type: modalType = null,
  className,
  heading,
  content,
  primaryAction,
  secondaryAction,
  closeOnAction = true,
  hideCloseIcon = false
}) => ({
  type: SHOW_MODAL,
  modalType,
  className,
  heading,
  content,
  primaryAction,
  secondaryAction,
  closeOnAction,
  hideCloseIcon
})

export const modalLoading = (optionalText) => ({
  type: MODAL_LOADING,
  optionalText
})

export const modalDone = () => ({
  type: MODAL_DONE
})

export const showRefreshModal = () => ({
  type: SHOW_REFRESH_MODAL
})

export const closeRefreshModal = () => ({
  type: CLOSE_REFRESH_MODAL
})

export const selectorPillHover = (selector, top) => ({
  type: SELECTOR_PILL_HOVER,
  selector,
  top
})

export const selectorPillNotHover = () => ({
  type: SELECTOR_PILL_NOT_HOVER
})

export const setSelectorPosition = (selectorType, index, position) => ({
  type: SET_SELECTOR_POSITION,
  selectorType,
  index,
  position
})

export const setSelectorPillHoverFromIndex = (id, type, index) => (
  dispatch,
  getState
) => {
  const {
    charts,
    ui: { selectorPositions }
  } = getState()
  const payload = Object.assign({}, charts[id][type][index], {
    chartType: charts[id].type,
    index,
    selectorType: type
  })
  const top = selectorPositions[type][index]
  dispatch(selectorPillHover(payload, top))
}

export const showDangerModal = ({
  className,
  title,
  message,
  primaryAction,
  secondaryAction
}) => ({
  type: SHOW_DANGER_MODAL,
  className,
  title,
  message,
  primaryAction,
  secondaryAction
})

export const hideDangerModal = () => ({
  type: HIDE_DANGER_MODAL
})

export const showDashboardImportModal = () => ({
  type: SHOW_DASHBOARD_IMPORT_MODAL
})

export const showInfoModal = ({
  hideCloseIcon,
  title,
  message,
  primaryAction
}) => ({
  hideCloseIcon,
  type: SHOW_INFO_MODAL,
  title,
  message,
  primaryAction
})

export const hideInfoModal = () => ({
  type: HIDE_INFO_MODAL
})

export const showWarningModal = ({
  className = "",
  title = "",
  message = "",
  primaryAction,
  secondaryAction
}) => ({
  type: SHOW_WARNING_MODAL,
  className,
  title,
  message,
  primaryAction,
  secondaryAction
})

export const hideWarningModal = () => ({
  type: HIDE_WARNING_MODAL
})

export function showBanner(bannerType) {
  return {
    type: SHOW_BANNER,
    bannerType
  }
}

export function hideBanner() {
  return {
    type: HIDE_BANNER
  }
}
