// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Layout } from "actions/dashboard-layout-action-creators"
import { HTMLProps } from "react"

export const SELECTOR_HEIGHT = 310

export type PopoverStyle = {
  top?: number | string
  bottom?: number
  left: number
  transform: string
}

export enum PopoverOrientation {
  BOTTOM = "BOTTOM",
  TOP = "TOP",
  LEFT = "LEFT",
  RIGHT = "RIGHT"
}

export type PortalProps = {
  scrollingElements: HTMLElement[]
  getPopoverPosition: (
    currentInputRef: HTMLElement | null,
    isParameterSelectorOpen: boolean
  ) => void
  popoverOrientation?: PopoverOrientation
  layout?: Layout
}

export type InputProps = HTMLProps<HTMLInputElement> & {
  "data-testid"?: string
  "data-ui-config-id"?: string
}

// Regex for detecting if the user is in the middle of typing a parameter, specifically
// "${" with valid parameter name characters (alphanumeric, _, or space) proceeding
export const OPEN_PARAM_REGEX = new RegExp(`\\\${[\\w ]*$`)
