// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { CHART_ADDON_STORAGE_STORED } from "./chart-addon-constants"
import { ChartAddonDefaultIcon } from "./utils/ChartAddonDefaultIcon"
import { defaultDuplicateChartAddon } from "chart-addons/utils/default-chart-addon-duplicator"

// never access these constant directly, use the functions down below.

// this is a mapping of chart addon types that you can import.
// e.g., [CHART_ADDON_CROSSFILTER_REPLAY] : "CHART_ADDON_CROSSFILTER_REPLAY"
const CHART_ADDON_CONSTANTS = {}

// returns the full type mappings for addons
export const getChartAddonTypes = () => {
  return CHART_ADDON_CONSTANTS
}

// this is a mapping of addon constants -> addon component.
// e.g., [CHART_ADDON_CROSSFILTER_REPLAY] : CrossFilterReplay
const CHART_ADDON_DEFINITIONS = {}

// registers a new chart addon
export const registerChartAddon = ({
  type,
  component,
  label,
  storage = CHART_ADDON_STORAGE_STORED,
  icon = ChartAddonDefaultIcon(),
  action, // default action is defined in chart-container-header for circular dependency reasons
  duplicate = defaultDuplicateChartAddon,
  // Default user has permission, otherwise function takes user roles to decide
  userHasPermission = () => true
}) => {
  CHART_ADDON_CONSTANTS[type] = type
  CHART_ADDON_DEFINITIONS[type] = {
    type,
    component,
    label,
    storage,
    icon,
    action,
    duplicate,
    userHasPermission
  }
}

// gets a chart addon of the given type, or returns a null component if no such addon type exists.
export const getChartAddonOfType = (type) => {
  return CHART_ADDON_DEFINITIONS[type] || { component: () => null }
}

// returns the complete type -> addon mapping.
export const getChartAddons = () => {
  return CHART_ADDON_DEFINITIONS
}

// this is a mapping of chart type -> array of addon types that are associated with that chart
// e.g., 'vega-combo' : [CHART_ADDON_CROSSFILTER_REPLAY]
const CHART_ADDONS = {}

// registers a chart type -> list of addons.
// should only be called from chart-registration.
export const registerChartTypeAddons = (type, addons) => {
  CHART_ADDONS[type] = addons
}

// given a chart type, returns an array of the addon types this chart can accept.
export const getChartTypeAddons = (type) => {
  const chartAddons = CHART_ADDONS[type] || []
  return chartAddons.filter((addon) => Boolean(CHART_ADDON_DEFINITIONS[addon]))
}
