// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  SELECTOR_HEIGHT,
  PopoverOrientation
} from "components/parameter-selector-input/constants"
import { AxisOrientation } from "vega/charts/types"

// It's (not) Opposite Day
export const getPopoverOrientationFromAxis = (
  axisLocation: AxisOrientation
) => {
  switch (axisLocation) {
    case AxisOrientation.LEFT:
      return PopoverOrientation.RIGHT
    case AxisOrientation.RIGHT:
      return PopoverOrientation.LEFT
    case AxisOrientation.BOTTOM:
      return PopoverOrientation.TOP
    default:
      return PopoverOrientation.BOTTOM
  }
}

export const getDefaultPopoverPosition = (
  currentInputRef: HTMLElement | null,
  parameterSelectorOpen: boolean,
  orientation?: PopoverOrientation
) => {
  if (!currentInputRef || !parameterSelectorOpen) {
    return undefined
  }
  const { top, left } = currentInputRef.getBoundingClientRect() || {}
  const { offsetWidth, offsetHeight } = currentInputRef || {}

  const popoverPosition = {
    transform: "translate(-50%)"
  }

  if (
    orientation === PopoverOrientation.RIGHT ||
    orientation === PopoverOrientation.LEFT
  ) {
    popoverPosition.left =
      orientation === PopoverOrientation.RIGHT ? left + 150 : left - 130

    // Because the y-axis is rotated, the "width" is the height
    popoverPosition.top = top - (SELECTOR_HEIGHT - offsetWidth) / 2
  } else {
    const popoverTop = top + offsetHeight

    // Center popover above/below input
    popoverPosition.left = left + offsetWidth / 2
    popoverPosition.top = popoverTop

    // Show selector on top if it'll go off the bottom of the screen otherwise.
    if (popoverTop + SELECTOR_HEIGHT > window.innerHeight) {
      popoverPosition.bottom = window.innerHeight - top
      popoverPosition.top = "initial"
    }
  }

  return popoverPosition
}
