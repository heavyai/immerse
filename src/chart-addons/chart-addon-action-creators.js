// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import pushid from "pushid"

import { updateChart } from "actions/update-chart-action-creator"

import {
  ADD_CHART_ADDON,
  REMOVE_CHART_ADDON,
  DUPLICATE_CHART_ADDON,
  UPDATE_CHART_ADDON,
  CHART_ADDON_STORAGE_TRANSIENT,
  CHART_ADDON_STORAGE_SHARED,
  CHART_ADDON_STORAGE_STORED
} from "./chart-addon-constants"

import { getChartAddonOfType } from "./chart-addon-registry"

export const addChartAddon = (type, id = pushid()) => {
  const addon = getChartAddonOfType(type)

  if (!addon.type) {
    throw new Error(
      `Could not add chart addon of type ${type} : does not exist`
    )
  }

  return async (dispatch) => {
    await dispatch({
      type: ADD_CHART_ADDON,
      payload: { id, type }
    })
    return id
  }
}

export const duplicateChartAddon = (id, chartId) => {
  return async (dispatch, getState) => {
    const addon = getState().chartAddons[id]
    const addonType = getChartAddonOfType(addon.type)
    const newAddon = addonType.duplicate(addon)
    const newAddonId = pushid()
    dispatch({
      type: DUPLICATE_CHART_ADDON,
      payload: { id: newAddonId, addon: newAddon }
    })
    dispatch(updateChart(chartId, { addon: newAddonId }))
  }
}

export const removeChartAddon = (id) => {
  return { type: REMOVE_CHART_ADDON, payload: { id } }
}

export const updateChartAddon = (id, updates) => {
  return { type: UPDATE_CHART_ADDON, payload: { id, updates } }
}

export const addChartAddonToChart = (chartId, type) => {
  const addon = getChartAddonOfType(type)

  switch (addon.storage) {
    case CHART_ADDON_STORAGE_TRANSIENT: {
      // not implemented. Concept is for a chart addon that has no storage, but maybe I don't want to complicate it?
      // originally this was just going to stick the chart addon's type into the chart's addon slot, but then there's
      // extra work to extract the data later. So I left it alone for now.
      return null
    }
    case CHART_ADDON_STORAGE_SHARED: {
      // not implemented. Concept is for a single chart addon to be shared across multiple charts, for some reason.
      // Maybe this would be useful? I dunno. Anyway, doesn't do anything right now either.
      return null
    }
    case CHART_ADDON_STORAGE_STORED: {
      return async (dispatch, getState) => {
        const chart = getState().charts[chartId]
        if (chart.addon) {
          await dispatch(removeChartAddonFromChart(chartId))
        }
        const addonId = await dispatch(addChartAddon(addon.type))
        dispatch(updateChart(chartId, { addon: addonId }))
      }
    }
    default:
      throw new Error(`Could not add chart addon of type ${type} : No storage`)
  }
}

export function removeChartAddonFromChart(chartId) {
  return async (dispatch, getState) => {
    const chart = getState().charts[chartId]
    if (chart.addon) {
      await dispatch(updateChart(chartId, { addon: undefined }))
      await dispatch(removeChartAddon(chart.addon))
    }
  }
}
