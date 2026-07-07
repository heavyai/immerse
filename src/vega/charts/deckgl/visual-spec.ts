// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import deepEquals from "fast-deep-equal"

import { ChartState } from "reducers/charts/charts-reducer-types"
import { Dimension, Measure } from "constants/prop-types"
import { isSelectorUsable } from "utils/selector-helpers"
import {
  STROKE_WIDTH_RANGE_DEFAULTS,
  SIZE_RANGE_DEFAULTS,
  layerDefaultOpacity
} from "constants/magic-variables"

const DEFAULT_COLOR = [17, 95, 154]

export type BaseDeckGLLayerVisualSpec = {
  opacity: number
  hasColor: boolean
  palette: Array<[number, number, number]>
  popupColumns?: Record<"key" | "label" | "format", string>[]
}

export type DeckGLPointmapLayerVisualSpec = BaseDeckGLLayerVisualSpec & {
  type: "pointmap"
  hasAlt: boolean
  pointSize: number
}

export type DeckGLLinemapLayerVisualSpec = BaseDeckGLLayerVisualSpec & {
  type: "linemap"
  strokeWidth: number
}

export type DeckGLGeoheatLayerVisualSpec = BaseDeckGLLayerVisualSpec & {
  type: "geoheat"
}

export type DeckGLChoroplethLayerVisualSpec = BaseDeckGLLayerVisualSpec & {
  type: "choropleth"
  hasElevation: boolean
}

export type DeckGLLayerVisualSpec =
  | DeckGLPointmapLayerVisualSpec
  | DeckGLLinemapLayerVisualSpec
  | DeckGLGeoheatLayerVisualSpec
  | DeckGLChoroplethLayerVisualSpec

function hexColorToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.substr(1, 2), 16),
    parseInt(hex.substr(3, 2), 16),
    parseInt(hex.substr(5, 2), 16)
  ]
}

export const buildVisualSpecs = (
  chart: ChartState,
  prev: Array<DeckGLLayerVisualSpec | null> = []
): Array<DeckGLLayerVisualSpec | null> => {
  let layers = chart.layers ?? [chart]
  const currentLayer = chart.currentLayer ?? 0
  if (currentLayer !== "master") {
    layers = [...layers]
    layers[currentLayer] = chart
  }
  return layers.map((layer, layerIndex): DeckGLLayerVisualSpec | null => {
    if (currentLayer !== "master" && currentLayer !== layerIndex) {
      return prev[layerIndex]
    }

    const dimensions = layer.dimensions.filter(isSelectorUsable) as Dimension[]
    const measures = layer.measures.filter(isSelectorUsable) as Measure[]
    const popupColumns = (layer.hoverSelectedColumns ?? []).filter(
      isSelectorUsable
    ) as Measure[]
    let palette = undefined
    if (layer.color.val && layer.color.reverse) {
      palette = [...layer.color.val].reverse().map(hexColorToRgb)
    } else {
      palette = layer.color?.val?.map(hexColorToRgb) || [DEFAULT_COLOR]
    }
    const base: BaseDeckGLLayerVisualSpec = {
      opacity:
        typeof layer.opacity === "undefined"
          ? layerDefaultOpacity(layer.type)
          : Number(layer.opacity),
      hasColor: Boolean(measures.find(({ name }) => name === "color")),
      palette
    }

    const type = layer.type.substr(7) || "pointmap"
    let spec: DeckGLLayerVisualSpec | null = null
    if (type === "pointmap") {
      spec = buildPointmapVisualSpec(
        layer,
        dimensions,
        measures,
        popupColumns,
        base
      )
    } else if (type === "linemap") {
      spec = buildLinemapVisualSpec(layer, dimensions, popupColumns, base)
    } else if (type === "geoheat") {
      spec = buildGeoheatVisualSpec(base)
    } else if (type === "choropleth") {
      spec = buildChoroplethVisualSpec(dimensions, measures, popupColumns, base)
    }

    if (deepEquals(spec, prev[layerIndex])) {
      return prev[layerIndex]
    }
    return spec
  })
}

function buildPointmapVisualSpec(
  layer: ChartState,
  dimensions: Dimension[],
  measures: Measure[],
  hoverColumns: Measure[],
  base: BaseDeckGLLayerVisualSpec
): DeckGLPointmapLayerVisualSpec {
  let popupColumns: DeckGLPointmapLayerVisualSpec["popupColumns"] = undefined
  if (hoverColumns.length > 0) {
    const keys =
      dimensions.length > 0
        ? dimensions
            .map((_, i) => `dimension${i}`)
            .concat(measures.map(({ name }) => name))
        : hoverColumns.map((_, i) => `popup${i}`)
    popupColumns = hoverColumns.map(({ label, format }, i) => ({
      key: keys[i],
      label,
      format
    }))
  }

  return {
    type: "pointmap",
    ...base,
    hasAlt: Boolean(measures.find(({ name }) => name === "alt")),
    popupColumns,
    pointSize: layer.sizeRange?.[0] || SIZE_RANGE_DEFAULTS[0]
  }
}

function buildLinemapVisualSpec(
  layer: ChartState,
  dimensions: Dimension[],
  hoverColumns: Measure[],
  base: BaseDeckGLLayerVisualSpec
): DeckGLLinemapLayerVisualSpec {
  let popupColumns: DeckGLLinemapLayerVisualSpec["popupColumns"] = undefined
  if (hoverColumns.length > 0) {
    const keys =
      dimensions.length > 0
        ? dimensions.map((_, i) => `dimension${i}`)
        : hoverColumns.map((_, i) => `popup${i}`)
    popupColumns = hoverColumns.map(({ label, format }, i) => ({
      key: keys[i],
      label,
      format
    }))
  }

  return {
    type: "linemap",
    ...base,
    popupColumns,
    strokeWidth: layer.sizeRange?.[0] || STROKE_WIDTH_RANGE_DEFAULTS[0]
  }
}

function buildGeoheatVisualSpec(
  base: BaseDeckGLLayerVisualSpec
): DeckGLGeoheatLayerVisualSpec {
  return {
    type: "geoheat",
    ...base
  }
}

function buildChoroplethVisualSpec(
  dimensions: Dimension[],
  measures: Measure[],
  hoverColumns: Measure[],
  base: BaseDeckGLLayerVisualSpec
): DeckGLChoroplethLayerVisualSpec {
  let popupColumns: DeckGLChoroplethLayerVisualSpec["popupColumns"] = undefined
  if (hoverColumns.length > 0) {
    const keys =
      dimensions.length > 0
        ? dimensions.map((_, i) => `dimension${i}`)
        : hoverColumns.map((_, i) => `popup${i}`)
    popupColumns = hoverColumns.map(({ label, format }, i) => ({
      key: keys[i],
      label,
      format
    }))
  }

  return {
    type: "choropleth",
    ...base,
    hasElevation: Boolean(measures.find(({ name }) => name === "elevation")),
    popupColumns
  }
}
