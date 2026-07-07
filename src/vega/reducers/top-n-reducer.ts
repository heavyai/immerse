// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getLayerIndex } from "vega/utils/data-selection"

import * as topnConstants from "../constants/top-n-action-types"
import { VegaCustomizableTopNOrderedItem } from "vega/charts/types"

import {
  buildDefaultCustomizableTopNOptions,
  getAvailableColorScale,
  getNewColors
} from "vega/charts/top-n-utils"
import { CUSTOM_COLORS } from "services/colors"
import produce from "immer"
import { PaletteMapping } from "components/shared-settings/types"

// Mutates `dyamicValues` input, removing item with matching `key`
const removeValueFromDynamicValues = (dynamicValues, key) => {
  const idx = dynamicValues.findIndex((dv) => dv.key === key)
  if (idx > -1) {
    const { order } = dynamicValues.splice(idx, 1)[0]
    dynamicValues = dynamicValues.map((dv) => {
      if (dv.order > order) {
        return { ...dv, order: dv.order - 1 }
      }
      return dv
    })
  }
}

const initializeOptionsProperty = (
  dataSelection,
  dataSelectionIndex,
  propertyName
) => {
  if (!dataSelection[propertyName]) {
    dataSelection[propertyName] = buildDefaultCustomizableTopNOptions(
      dataSelection.table,
      dataSelectionIndex
    )
  }
}

export default {
  [topnConstants.TOPN_RESET_OPTIONS](
    state,
    { chartId, layerId, propertyName, options }
  ) {
    const dataSelections = [...state[chartId].dataSelections]
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]
    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      [propertyName]: options
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },
  [topnConstants.TOPN_SET_OPTIONS](
    state,
    { chartId, layerId, propertyName, options }
  ) {
    const dataSelections = [...state[chartId].dataSelections]
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]
    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      [propertyName]: options
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [topnConstants.TOPN_UPDATE_N](state, { chartId, layerId, propertyName, n }) {
    const dataSelections = [...state[chartId].dataSelections]
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]
    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      [propertyName]: {
        ...dataSelection[propertyName],
        n
      }
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [topnConstants.TOPN_SET_MEASURE](
    state,
    { chartId, layerId, propertyName, measure }
  ) {
    const dataSelections = [...state[chartId].dataSelections]
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]
    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      [propertyName]: {
        ...dataSelection[propertyName],
        measure
      }
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [topnConstants.TOPN_SET_MEASURE_AGGREGATE](
    state,
    { chartId, layerId, propertyName, aggregate }
  ) {
    const dataSelections = [...state[chartId].dataSelections]
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]
    const topNOptions = dataSelection[propertyName]
    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      [propertyName]: {
        ...topNOptions,
        measure: {
          ...topNOptions.measure,
          aggregate
        }
      }
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [topnConstants.TOPN_SET_SORT_ORDER](
    state,
    { chartId, layerId, propertyName, sort }
  ) {
    const dataSelections = [...state[chartId].dataSelections]
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]
    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      [propertyName]: {
        ...dataSelection[propertyName],
        sort
      }
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [topnConstants.TOPN_LOCK](
    state,
    { chartId, layerId, propertyName, key, color, disabled }
  ) {
    const dataSelections = [...state[chartId].dataSelections]
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]

    // add new item to end of staticValues, setting order appropriately
    const staticValues = [...(dataSelection[propertyName].staticValues || [])]
    const newOrder =
      staticValues.reduce((acc, { order }) => Math.max(acc, order), 0) + 1
    staticValues.push({ key, color, order: newOrder, disabled })

    // when adding item to staticValue, remove it from dynamicValues
    const dynamicValues = [...(dataSelection[propertyName].dynamicValues || [])]
    removeValueFromDynamicValues(dynamicValues, key)

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      [propertyName]: {
        ...dataSelection[propertyName],
        staticValues,
        dynamicValues
      }
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },
  // If we're manually selecting TopN values, then we need to generate a list of
  // items to add to `staticValues` with appropiate colors, and remove those
  // values from `dynamicValues`. The meat of this logic is assigning colors:
  //    * If a value already has an assigned color (that was saved in
  //      staticValues or dynamicValues in redux), you want to maintain that
  //      color
  //    * If a value doesn't have an assigned color:
  //      * Fetch the current color palette
  //      * Remove the colors that are already assigned
  //      * Assign the remaining colors to values
  //      * If you run out of colors (say, the user selects 55 new values),
  //        regenerate the palette with ALL colors and assign colors starting
  //        "fresh"
  [topnConstants.TOPN_MANUAL_SELECTION](
    state,
    { chartId, layerId, propertyName, selections, topNData, topNOptions }
  ) {
    const dataSelections = [...state[chartId].dataSelections]
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]

    // Get a string array representing our color palette. Currently using
    // CUSTOM_COLORS, as that's what the TopN widget is currently defaulting to.
    const colors = getNewColors(CUSTOM_COLORS, {})
    // Get available (remaining) colors by removing colors currently in use in
    // locked / assigned items
    let colorScale = getAvailableColorScale(colors, topNOptions)

    const staticValues: VegaCustomizableTopNOrderedItem[] = (selections as string[]).map(
      (s, i) => {
        const previousValue = topNData.find(
          (option) => option.originalKey === s
        )
        let color = previousValue && previousValue.color
        if (!color) {
          // If we've run out of colors, regenerate the palette (using all
          // possible colors this time)
          colorScale = colorScale.length
            ? colorScale
            : [...getNewColors(CUSTOM_COLORS, {})]
          color = colorScale[0]
          colorScale.shift()
        }
        return {
          key: s,
          color,
          disabled: false,
          order: i
        }
      }
    )

    // Remove new staticValues from dynamicValues in a mutate-y way
    const dynamicValues = [...(dataSelection[propertyName].dynamicValues || [])]
    staticValues.forEach(({ key }) => {
      removeValueFromDynamicValues(dynamicValues, key)
    })

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      [propertyName]: {
        ...dataSelection[propertyName],
        staticValues,
        dynamicValues
      }
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [topnConstants.TOPN_UNLOCK](state, { chartId, layerId, propertyName, key }) {
    const dataSelections = [...state[chartId].dataSelections]
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]

    // find the item to remove
    let staticValues = [...(dataSelection[propertyName].staticValues || [])]
    const idx = staticValues.findIndex((sv) => sv.key === key)
    if (idx < 0) {
      return state
    }

    // Move it to dynamicValues to keep color + disabled status before removing from staticValues
    const dynamicValues = [...(dataSelection[propertyName].dynamicValues || [])]
    staticValues.forEach((sv) => {
      if (key === sv.key) {
        dynamicValues.push({
          key: sv.key,
          disabled: sv.disabled,
          color: sv.color
        })
      }
    })

    // remove and reorder any items that came after it
    const { order } = staticValues.splice(idx, 1)[0]
    staticValues = staticValues.map((sv) => {
      if (sv.order > order) {
        return { ...sv, order: sv.order - 1 }
      }
      return sv
    })

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      [propertyName]: {
        ...dataSelection[propertyName],
        staticValues,
        dynamicValues
      }
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [topnConstants.TOPN_SET_POSITION](
    state,
    { chartId, layerId, propertyName, key, order }
  ) {
    const dataSelections = [...state[chartId].dataSelections]
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]
    initializeOptionsProperty(dataSelection, dataSelectionIndex, propertyName)

    // find the item
    let staticValues = [...(dataSelection[propertyName].staticValues || [])]
    const idx = staticValues.findIndex((sv) => sv.key === key)
    if (idx < 0) {
      return state
    }

    // reorder items
    const { order: oldOrder } = staticValues.splice(idx, 1, {
      ...staticValues[idx],
      order
    })[0]
    const adjustment = oldOrder < order ? -1 : 1
    const minOrder = Math.min(order, oldOrder)
    const maxOrder = Math.max(order, oldOrder)
    staticValues = staticValues.map((sv) => {
      if (sv.key !== key && minOrder <= sv.order && sv.order <= maxOrder) {
        return { ...sv, order: sv.order + adjustment }
      }
      return sv
    })

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      [propertyName]: {
        ...dataSelection[propertyName],
        staticValues
      }
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [topnConstants.TOPN_SET_COLOR](
    state,
    { chartId, layerId, propertyName, key, color, isAllOther }
  ) {
    const dataSelections = [...state[chartId].dataSelections]
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]
    initializeOptionsProperty(dataSelection, dataSelectionIndex, propertyName)
    // check if the key is static or All Others
    let found = false

    let allOthers = dataSelection[propertyName].allOthers
    if (key === "All Others" && isAllOther) {
      allOthers = { ...allOthers, color }
      found = true
    }

    let staticValues = dataSelection[propertyName].staticValues
    if (staticValues) {
      const idx = staticValues.findIndex((sv) => sv.key === key)
      if (idx >= 0) {
        staticValues = [...staticValues]
        staticValues.splice(idx, 1, {
          ...staticValues[idx],
          color
        })
        found = true
      }
    }

    // check if it's already in the dynamic properties
    let dynamicValues = dataSelection[propertyName].dynamicValues

    if (!found && dynamicValues) {
      const idx = dynamicValues.findIndex((dv) => dv.key === key)
      if (idx >= 0) {
        dynamicValues = [...dynamicValues]
        dynamicValues.splice(idx, 1, {
          ...dynamicValues[idx],
          color
        })
        found = true
      }
    }

    // otherwise, add it as a dynamic value
    if (!found) {
      dynamicValues = dynamicValues || []
      dynamicValues.push({ key, color })
    }

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      [propertyName]: {
        ...dataSelection[propertyName],
        staticValues,
        dynamicValues,
        allOthers
      }
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [topnConstants.TOPN_TOGGLE](state, { chartId, layerId, propertyName, key }) {
    const dataSelections = [...state[chartId].dataSelections]
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]
    initializeOptionsProperty(dataSelection, dataSelectionIndex, propertyName)

    // check if the key is static
    let found = false
    let staticValues = dataSelection[propertyName].staticValues
    if (staticValues) {
      const idx = staticValues.findIndex((sv) => sv.key === key)
      if (idx >= 0) {
        staticValues = [...staticValues]
        staticValues.splice(idx, 1, {
          ...staticValues[idx],
          disabled: !staticValues[idx].disabled
        })
        found = true
      }
    }

    // check if it's already in the dynamic properties
    let dynamicValues = dataSelection[propertyName].dynamicValues
    if (!found && dynamicValues) {
      const idx = dynamicValues.findIndex((dv) => dv.key === key)
      if (idx >= 0) {
        dynamicValues = [...dynamicValues]
        dynamicValues.splice(idx, 1, {
          ...dynamicValues[idx],
          disabled: !dynamicValues[idx].disabled
        })
        found = true
      }
    }

    // otherwise, add it as a dynamic value
    if (!found) {
      dynamicValues = dynamicValues || []
      dynamicValues.push({ key, disabled: true })
    }

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      [propertyName]: {
        ...dataSelection[propertyName],
        staticValues,
        dynamicValues
      }
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [topnConstants.TOPN_TOGGLE_ALL_OTHERS](
    state,
    { chartId, layerId, propertyName }
  ) {
    const dataSelections = [...state[chartId].dataSelections]
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]
    initializeOptionsProperty(dataSelection, dataSelectionIndex, propertyName)

    const disabled = !dataSelection[propertyName].allOthers.disabled
    const allOthers = { ...dataSelection[propertyName].allOthers, disabled }

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      [propertyName]: {
        ...dataSelection[propertyName],
        allOthers
      }
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [topnConstants.TOPN_SHOW_ALL_OTHERS_IN_LEGEND](
    state,
    { chartId, layerId, enabled }
  ) {
    const dataSelections = [...state[chartId].dataSelections]
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      topNoptions: {
        ...dataSelection.topNoptions,
        showAllOthersInLegend: enabled,
        allOthers: {
          ...dataSelection.topNoptions.allOthers,
          disabled: !enabled
        }
      }
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },

  [topnConstants.TOPN_ALLOW_NULL_KEYS](state, { chartId, layerId, enabled }) {
    const dataSelections = [...state[chartId].dataSelections]
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    if (dataSelectionIndex < 0) {
      return state
    }

    const dataSelection = state[chartId].dataSelections[dataSelectionIndex]

    dataSelections[dataSelectionIndex] = {
      ...dataSelection,
      topNoptions: {
        ...dataSelection.topNoptions,
        allowNullKeys: enabled
      }
    }

    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  },
  [topnConstants.TOPN_SET_FROM_PALETTE_MAPPING]: produce(
    (state, { chartId, layerId, propertyName, paletteMapping, isMeasure }) => {
      const dataSelections = state[chartId].dataSelections
      const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
      if (dataSelectionIndex < 0) {
        return
      }

      const dataSelection = state[chartId].dataSelections[dataSelectionIndex]

      // check if it's already in the dynamic properties
      const dynamicValues = paletteMappingToComboDynamicValues(paletteMapping)

      initializeOptionsProperty(dataSelection, dataSelectionIndex, propertyName)
      dataSelection[propertyName].dynamicValues = dynamicValues
      dataSelection[propertyName].palette = paletteMapping.mapping.palette
      const colorSelector =
        (isMeasure
          ? dataSelection.measures.color
          : dataSelection.dimensions.color) ?? dataSelection
      if (colorSelector) {
        colorSelector.paletteMappingId = null
        colorSelector.lastPaletteMappingId = paletteMapping.id
      }
    }
  )
}

function paletteMappingToComboDynamicValues(paletteMapping: PaletteMapping) {
  const mapping = paletteMapping.mapping
  const dynamicValues = mapping.customDomain.map((domainValue, idx) => {
    const color = mapping.customRange[idx]
    return {
      color,
      key: domainValue
    }
  })
  return dynamicValues
}
