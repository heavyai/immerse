// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import ParameterSelectorInput from "components/parameter-selector-input"
import { SELECTOR_HEIGHT } from "components/parameter-selector-input/constants"

const getPopoverPosition = (
  currentInputRef: HTMLElement | null,
  parameterSelectorOpen: boolean
) => {
  if (!currentInputRef || !parameterSelectorOpen) {
    return undefined
  }

  const { top, left } = currentInputRef.getBoundingClientRect() || {}
  const { offsetWidth, offsetHeight } = currentInputRef || {}

  const popoverTop = top + offsetHeight
  // Align to right side of element, with 8 px padding
  const popoverLeft = left + offsetWidth - 8
  const popoverPosition = { left: popoverLeft, transform: "translate(-50%)" }

  // Show selector on top if it'll go off the bottom of the screen otherwise.
  if (popoverTop + SELECTOR_HEIGHT > window.innerHeight) {
    const bottom = window.innerHeight - top
    return {
      ...popoverPosition,
      bottom,
      top: "initial"
    }
  }

  return { ...popoverPosition, top: popoverTop }
}

const FilterPanelParameterSelectorInput = (props) => {
  // We need to recalculate the popover position if either of these containers are scrolled
  const scroller = document.getElementById("filter-panel-scroller")
  const dashboardScroller = document.getElementById("dashboard-container")

  const portalProps = {
    getPopoverPosition,
    scrollingElements: [scroller, dashboardScroller]
  }

  return <ParameterSelectorInput {...props} portalProps={portalProps} />
}

export default FilterPanelParameterSelectorInput
