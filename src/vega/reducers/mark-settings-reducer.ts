// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as markSettingsConstants from "vega/constants/mark-settings-action-types"
import { getLayerIndex } from "vega/utils/data-selection"

// TODO: abstract the top level chart reducer portion out
export default {
  [markSettingsConstants.SET_MEASURE_MARK_TYPE](
    state,
    { chartId, layerId, measureIndex, markType }
  ) {
    const dataSelections = Array.from(state[chartId].dataSelections)
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]
    const measures = { ...dataSelection.measures }
    measures.size = Array.from(measures.size)
    measures.size[measureIndex] = {
      ...measures.size[measureIndex],
      markSettings: {
        ...measures.size[measureIndex].markSettings,
        markType
      }
    }

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      measures
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [markSettingsConstants.SET_MEASURE_LINE_STYLE](
    state,
    { chartId, layerId, measureIndex, lineStyle }
  ) {
    const dataSelections = Array.from(state[chartId].dataSelections)
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]
    const measures = { ...dataSelection.measures }
    measures.size = Array.from(measures.size)
    measures.size[measureIndex] = {
      ...measures.size[measureIndex],
      markSettings: {
        ...measures.size[measureIndex].markSettings,
        lineStyle
      }
    }

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      measures
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [markSettingsConstants.SET_MEASURE_AXIS](
    state,
    { chartId, layerId, measureIndex, axis }
  ) {
    const dataSelections = Array.from(state[chartId].dataSelections)
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]
    const measures = { ...dataSelection.measures }
    measures.size = Array.from(measures.size)
    measures.size[measureIndex] = {
      ...measures.size[measureIndex],
      markSettings: {
        ...measures.size[measureIndex].markSettings,
        axis
      }
    }

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      measures
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  // Props below unused for now

  [markSettingsConstants.TOGGLE_MEASURE_HIDE_LINE](
    state,
    { chartId, layerId, measureIndex, hideLine }
  ) {
    const dataSelections = Array.from(state[chartId].dataSelections)
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]
    const measures = { ...dataSelection.measures }
    measures.size = Array.from(measures.size)
    if (typeof hideLine === "undefined" || hideLine === null) {
      hideLine = !measures.size[measureIndex].hideLine
    }

    measures.size[measureIndex] = {
      ...measures.size[measureIndex],
      markSettings: {
        ...measures.size[measureIndex].markSettings,
        hideLine
      }
    }

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      measures
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [markSettingsConstants.SET_MEASURE_LINE_THICKNESS](
    state,
    { chartId, layerId, measureIndex, lineThickness }
  ) {
    const dataSelections = Array.from(state[chartId].dataSelections)
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]
    const measures = { ...dataSelection.measures }
    measures.size = Array.from(measures.size)
    measures.size[measureIndex] = {
      ...measures.size[measureIndex],
      markSettings: {
        ...measures.size[measureIndex].markSettings,
        lineThickness
      }
    }

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      measures
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [markSettingsConstants.SET_MEASURE_LINE_SHADOW](
    state,
    { chartId, layerId, measureIndex, lineShadow }
  ) {
    const dataSelections = Array.from(state[chartId].dataSelections)
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]
    const measures = { ...dataSelection.measures }
    measures.size = Array.from(measures.size)
    measures.size[measureIndex] = {
      ...measures.size[measureIndex],
      markSettings: {
        ...measures.size[measureIndex].markSettings,
        lineShadow
      }
    }

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      measures
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [markSettingsConstants.SET_MEASURE_MARK_COLOR](
    state,
    { chartId, layerId, measureIndex, markColor }
  ) {
    const dataSelections = Array.from(state[chartId].dataSelections)
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]
    const measures = { ...dataSelection.measures }
    measures.size = Array.from(measures.size)
    measures.size[measureIndex] = {
      ...measures.size[measureIndex],
      markSettings: {
        ...measures.size[measureIndex].markSettings,
        markColor
      }
    }

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      measures
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  }
}
